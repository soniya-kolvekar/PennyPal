import { db } from "./db";
import { getCurrentUser } from "./auth";

/**
 * Helper to retrieve the current user's vaultId (Firebase UID).
 * Throws an error if no user is authenticated to enforce strict vault isolation.
 */
export function getVaultId() {
  const user = getCurrentUser();
  if (user && user.uid) {
    return user.uid;
  }
  if (typeof window !== "undefined") {
    let guestId = localStorage.getItem("pennypal_guest_vault");
    if (!guestId) {
      guestId = "guest_vault";
      localStorage.setItem("pennypal_guest_vault", guestId);
    }
    return guestId;
  }
  return "guest_vault";
}

/**
 * Simple string similarity score between 0 and 1 (for merchant heuristic matching)
 */
function getSimilarityScore(str1 = "", str2 = "") {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Bigram token overlap
  const getBigrams = (str) => {
    const bigrams = new Set();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };
  
  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;
  for (const item of b1) {
    if (b2.has(item)) intersection++;
  }
  return (2.0 * intersection) / (b1.size + b2.size || 1);
}

// =========================================================================
// TRANSACTION QUERIES (Scoped strictly to current vaultId)
// =========================================================================

/**
 * Retrieve transactions for current user.
 * @param {Object} options
 * @param {string} [options.status="active"] - "active" | "pending_review" | "reconciled" | "ignored" | "all"
 * @param {string} [options.startDate] - YYYY-MM-DD
 * @param {string} [options.endDate] - YYYY-MM-DD
 * @param {string} [options.category] - category name
 * @param {string} [options.type] - "income" | "expense"
 * @param {number} [options.limit] - max records to return
 */
export async function getTransactions(options = {}) {
  const vaultId = getVaultId();
  const { status = "active", startDate, endDate, category, type, limit } = options;

  let query;

  // Use fast compound index [vaultId+status] if status is specified (not "all")
  if (status !== "all") {
    query = db.transactions.where("[vaultId+status]").equals([vaultId, status]);
  } else {
    query = db.transactions.where("vaultId").equals(vaultId);
  }

  let results = await query.toArray();

  // In-memory filter on indexed subset (dataset per user in IndexedDB is local and light)
  if (startDate) {
    results = results.filter((tx) => tx.date >= startDate);
  }
  if (endDate) {
    results = results.filter((tx) => tx.date <= endDate);
  }
  if (category) {
    results = results.filter((tx) => tx.category?.toLowerCase() === category.toLowerCase());
  }
  if (type) {
    results = results.filter((tx) => tx.type === type);
  }

  // Sort descending by date
  results.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

  if (limit && Number.isInteger(limit) && limit > 0) {
    return results.slice(0, limit);
  }

  return results;
}

/**
 * Get a single transaction by ID, verifying vault ownership.
 */
export async function getTransactionById(id) {
  const vaultId = getVaultId();
  const tx = await db.transactions.get(id);
  if (!tx || tx.vaultId !== vaultId) {
    return null;
  }
  return tx;
}

/**
 * Retrieve pending review transactions (optionally filtered by batch ID).
 */
export async function getPendingTransactions(importBatchId = null) {
  const vaultId = getVaultId();
  let query = db.transactions.where("[vaultId+status]").equals([vaultId, "pending_review"]);
  let results = await query.toArray();

  if (importBatchId) {
    results = results.filter((tx) => tx.importBatchId === importBatchId);
  }

  return results;
}

// =========================================================================
// TRANSACTION MUTATIONS (Scoped strictly to current vaultId)
// =========================================================================

/**
 * Add a new manual transaction into the current vault.
 */
export async function addTransaction(transactionData) {
  const vaultId = getVaultId();
  const now = new Date().toISOString();

  const amount = Number(transactionData.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a valid positive number.");
  }

  const newTx = {
    id: transactionData.id || crypto.randomUUID(),
    vaultId,
    date: transactionData.date || now.split("T")[0],
    merchant: (transactionData.merchant || "Unknown").trim(),
    amount,
    type: transactionData.type === "income" ? "income" : "expense",
    category: transactionData.category || "Other",
    source: transactionData.source || "manual",
    status: transactionData.status || "active",
    reconciledWith: transactionData.reconciledWith || null,
    originalDescription: transactionData.originalDescription || transactionData.merchant || "",
    originalMerchant: transactionData.originalMerchant || transactionData.merchant || "",
    importBatchId: transactionData.importBatchId || null,
    createdAt: transactionData.createdAt || now,
    updatedAt: now,
  };

  await db.transactions.put(newTx);
  return newTx;
}

/**
 * Update an existing transaction, verifying vault ownership.
 */
export async function updateTransaction(id, updates) {
  const vaultId = getVaultId();
  const existing = await db.transactions.get(id);

  if (!existing || existing.vaultId !== vaultId) {
    throw new Error("Transaction not found or access denied.");
  }

  const updatedTx = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Prevent tampering with ownership
  updatedTx.vaultId = vaultId;
  updatedTx.id = id;

  await db.transactions.put(updatedTx);
  return updatedTx;
}

/**
 * Delete a transaction, verifying vault ownership.
 */
export async function deleteTransaction(id) {
  const vaultId = getVaultId();
  const existing = await db.transactions.get(id);

  if (!existing || existing.vaultId !== vaultId) {
    throw new Error("Transaction not found or access denied.");
  }

  await db.transactions.delete(id);
  return true;
}

// =========================================================================
// IMPORT VERIFICATION WORKFLOW (Staging -> Review -> Confirm / Cancel)
// =========================================================================

/**
 * Stage an extracted bank statement batch into Dexie as 'pending_review'.
 * Candidate transactions DO NOT affect active analytics until confirmed.
 */
export async function stageImportBatch(batchInfo, candidateTransactions = []) {
  const vaultId = getVaultId();
  const now = new Date().toISOString();
  const batchId = batchInfo?.id || crypto.randomUUID();

  const batchRecord = {
    id: batchId,
    vaultId,
    fileName: batchInfo?.fileName || "Uploaded Statement",
    status: "pending_review",
    createdAt: now,
    updatedAt: now,
    transactionCount: candidateTransactions.length,
  };

  const stagedTransactions = candidateTransactions.map((tx) => ({
    id: tx.id || crypto.randomUUID(),
    vaultId,
    date: tx.date,
    merchant: (tx.merchant || tx.originalDescription || "Unknown").trim(),
    amount: Number(tx.amount),
    type: tx.type === "income" ? "income" : "expense",
    category: tx.category || "Uncategorized",
    source: "bank_statement",
    status: "pending_review",
    reconciledWith: null,
    originalDescription: tx.originalDescription || tx.merchant || "",
    originalMerchant: tx.originalMerchant || tx.merchant || "",
    importBatchId: batchId,
    createdAt: tx.createdAt || now,
    updatedAt: now,
  }));

  await db.transaction("rw", [db.importBatches, db.transactions], async () => {
    await db.importBatches.put(batchRecord);
    await db.transactions.bulkPut(stagedTransactions);
  });

  return {
    batch: batchRecord,
    transactions: stagedTransactions,
  };
}

/**
 * Confirm an import batch: Atomically promotes reviewed transactions to 'active'.
 * Allows passing an updated/edited list from the review UI.
 */
export async function confirmImportBatch(batchId, reviewedTransactions = null) {
  const vaultId = getVaultId();
  const now = new Date().toISOString();

  return await db.transaction("rw", [db.importBatches, db.transactions], async () => {
    const pending = await db.transactions
      .where("[vaultId+status]")
      .equals([vaultId, "pending_review"])
      .toArray();

    const batchPending = pending.filter((tx) => tx.importBatchId === batchId);

    // If user provided edited transactions from review screen, save them directly
    if (reviewedTransactions && Array.isArray(reviewedTransactions)) {
      const reviewedIds = new Set(reviewedTransactions.map((t) => t.id));
      const toDelete = batchPending
        .filter((tx) => !reviewedIds.has(tx.id))
        .map((tx) => tx.id);

      if (toDelete.length > 0) {
        await db.transactions.bulkDelete(toDelete);
      }

      const confirmed = [];
      for (const tx of reviewedTransactions) {
        if (tx.reconciledWith) {
          const matchedActive = await db.transactions.get(tx.reconciledWith);
          if (matchedActive && matchedActive.vaultId === vaultId) {
            matchedActive.reconciledWith = tx.id;
            matchedActive.updatedAt = now;
            await db.transactions.put(matchedActive);
          }
        }

        confirmed.push({
          ...tx,
          vaultId,
          importBatchId: batchId,
          status: "active",
          updatedAt: now,
        });
      }

      await db.transactions.bulkPut(confirmed);
    } else {
      // Otherwise promote existing pending transactions
      const activeTransactions = batchPending.map((tx) => ({
        ...tx,
        status: "active",
        updatedAt: now,
      }));

      await db.transactions.bulkPut(activeTransactions);
    }

    // Update batch status
    const batch = await db.importBatches.get(batchId);
    if (batch && batch.vaultId === vaultId) {
      batch.status = "confirmed";
      batch.updatedAt = now;
      await db.importBatches.put(batch);
    }

    return true;
  });
}

/**
 * Cancel an import batch: Discards all pending transactions without touching active records.
 */
export async function cancelImportBatch(batchId) {
  const vaultId = getVaultId();

  return await db.transaction("rw", [db.importBatches, db.transactions], async () => {
    const pending = await db.transactions
      .where("[vaultId+status]")
      .equals([vaultId, "pending_review"])
      .toArray();

    const toDelete = pending
      .filter((tx) => tx.importBatchId === batchId)
      .map((tx) => tx.id);

    if (toDelete.length > 0) {
      await db.transactions.bulkDelete(toDelete);
    }

    // Update or remove batch record
    const batch = await db.importBatches.get(batchId);
    if (batch && batch.vaultId === vaultId) {
      batch.status = "cancelled";
      batch.updatedAt = new Date().toISOString();
      await db.importBatches.put(batch);
    }

    return true;
  });
}

// =========================================================================
// RECONCILIATION & DUPLICATE DETECTION ENGINE
// =========================================================================

/**
 * Detect duplicates and reconciliation opportunities between candidates and existing active records,
 * as well as detecting within-batch duplicates.
 *
 * Distinguishes between:
 * 1. 'reconciliation': Same expenditure recorded from different sources (e.g. Manual Entry vs Bank Statement).
 * 2. 'exact_duplicate': Identical transaction already committed to active ledger.
 * 3. 'batch_duplicate': Duplicate entries present within the same import batch.
 * 4. 'potential_duplicate': Similar amounts and dates that warrant review.
 */
export async function detectPossibleDuplicates(candidates = []) {
  const vaultId = getVaultId();
  const activeTransactions = await db.transactions
    .where("[vaultId+status]")
    .equals([vaultId, "active"])
    .toArray();

  if (candidates.length === 0) {
    return [];
  }

  return candidates.map((candidate, idx) => {
    let highestScore = 0;
    let bestMatch = null;
    let matchType = null; // 'reconciliation' | 'exact_duplicate' | 'batch_duplicate' | 'potential_duplicate'

    const candAmount = Math.abs(Number(candidate.amount));
    const candDate = new Date(candidate.date).getTime();
    const candSource = (candidate.source || "manual_entry").toLowerCase();
    const candDesc = candidate.merchant || candidate.desc || "";

    // 1. Cross-reference with existing active transactions in the local vault
    for (const active of activeTransactions) {
      let score = 0;

      // Amount Match (40% exact, 25% within 5%)
      const activeAmount = Math.abs(Number(active.amount));
      if (candAmount === activeAmount) {
        score += 0.40;
      } else if (Math.abs(candAmount - activeAmount) / (candAmount || 1) < 0.05) {
        score += 0.25;
      }

      // Date Match (30% if same day, 20% if within 1 day, 10% if within 3 days)
      const activeDate = new Date(active.date).getTime();
      const diffDays = Math.abs(candDate - activeDate) / (1000 * 60 * 60 * 24);
      if (diffDays === 0) {
        score += 0.30;
      } else if (diffDays <= 1) {
        score += 0.20;
      } else if (diffDays <= 3) {
        score += 0.10;
      }

      // Merchant / Description Similarity (25%)
      const merchantSim = getSimilarityScore(candDesc, active.merchant);
      score += merchantSim * 0.25;

      // Type Match (5%)
      const candType = (candidate.type || "expense").toLowerCase();
      const activeType = (active.type || "expense").toLowerCase();
      if (candType === activeType) {
        score += 0.05;
      }

      if (score > highestScore && score >= 0.65) {
        highestScore = score;
        bestMatch = active;

        const activeSource = (active.source || "manual").toLowerCase();
        const isCrossSource =
          (candSource.includes("manual") || candSource.includes("upi") || candSource.includes("cash")) !==
          (activeSource.includes("manual") || activeSource.includes("upi") || activeSource.includes("cash"));

        if (score >= 0.80 && isCrossSource) {
          matchType = "reconciliation";
        } else if (score >= 0.90) {
          matchType = "exact_duplicate";
        } else {
          matchType = "potential_duplicate";
        }
      }
    }

    // 2. Also check for duplicates within the current candidate batch itself
    if (!bestMatch) {
      for (let j = 0; j < candidates.length; j++) {
        if (j === idx) continue;
        const other = candidates[j];
        const otherAmount = Math.abs(Number(other.amount));
        const otherDate = new Date(other.date).getTime();
        const diffDays = Math.abs(candDate - otherDate) / (1000 * 60 * 60 * 24);

        if (candAmount === otherAmount && diffDays === 0) {
          const sim = getSimilarityScore(candDesc, other.merchant || other.desc || "");
          if (sim >= 0.8) {
            highestScore = 0.95;
            bestMatch = {
              id: other.id,
              merchant: other.merchant || other.desc,
              amount: otherAmount,
              date: other.date,
              source: other.source || "batch_item",
              isWithinBatch: true,
            };
            matchType = "batch_duplicate";
            break;
          }
        }
      }
    }

    let reason = "";
    if (bestMatch) {
      if (matchType === "reconciliation") {
        reason = `Reconciles with active ${bestMatch.source.replace("_", " ")}: "${bestMatch.merchant}" (₹${bestMatch.amount} on ${bestMatch.date})`;
      } else if (matchType === "batch_duplicate") {
        reason = `Duplicate in current import batch: matches "${bestMatch.merchant}" (₹${bestMatch.amount})`;
      } else if (matchType === "exact_duplicate") {
        reason = `Exact duplicate of active ledger transaction: "${bestMatch.merchant}" (₹${bestMatch.amount} on ${bestMatch.date})`;
      } else {
        reason = `Similar to active transaction: "${bestMatch.merchant}" (₹${bestMatch.amount} on ${bestMatch.date})`;
      }
    }

    return {
      candidate,
      possibleDuplicate: bestMatch,
      duplicateScore: Math.round(highestScore * 100),
      isDuplicateCandidate: highestScore >= 0.70,
      matchType,
      reason,
      suggestedAction:
        matchType === "reconciliation"
          ? "reconcile"
          : matchType === "exact_duplicate"
          ? "discard"
          : "review",
    };
  });
}
