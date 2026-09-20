import { db } from "./db";
import { getVaultId } from "./vault";

// =========================================================================
// GOALS HELPERS (Scoped strictly to current vaultId)
//
// Schema fields stored in IndexedDB:
//   id, vaultId, title, category, targetAmount, savedAmount (currentAmount),
//   targetDate (deadline), description, status, streak, createdAt, updatedAt
// =========================================================================

/**
 * Create a new goal in the local Dexie database.
 *
 * @param {Object} goalData
 * @param {string} goalData.title - Goal title (required)
 * @param {string} [goalData.category="Other"] - Category label
 * @param {number} goalData.targetAmount - Target savings amount (required, > 0)
 * @param {number} [goalData.savedAmount=0] - Amount already saved (alias: currentAmount)
 * @param {string} [goalData.targetDate] - ISO date string deadline (alias: deadline)
 * @param {string} [goalData.description] - Motivation / notes
 * @returns {Promise<Object>} The created goal record
 */
export async function createGoal(goalData) {
  const vaultId = getVaultId();

  if (!goalData.title || typeof goalData.title !== "string" || !goalData.title.trim()) {
    throw new Error("Goal title is required.");
  }

  const targetAmount = Number(goalData.targetAmount);
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw new Error("Goal target amount must be a positive number.");
  }

  const savedAmount = Number(goalData.savedAmount ?? goalData.currentAmount ?? 0);
  if (!Number.isFinite(savedAmount) || savedAmount < 0) {
    throw new Error("Saved amount must be zero or greater.");
  }

  const now = new Date().toISOString();

  const newGoal = {
    id: goalData.id || crypto.randomUUID(),
    vaultId,
    title: goalData.title.trim(),
    category: goalData.category || "Other",
    targetAmount,
    savedAmount,
    targetDate: goalData.targetDate || goalData.deadline || null,
    description: goalData.description || "",
    status: savedAmount >= targetAmount ? "completed" : (goalData.status || "active"),
    streak: Number(goalData.streak) || 0,
    createdAt: goalData.createdAt || now,
    updatedAt: now,
  };

  await db.goals.put(newGoal);
  return newGoal;
}

/**
 * Update progress or fields on an existing goal.
 * Verifies vault ownership before applying any changes.
 * Automatically marks goal as "completed" when savedAmount >= targetAmount.
 *
 * @param {string} goalId - The goal ID to update
 * @param {Object} updates - Fields to merge (e.g. { savedAmount: 5000 })
 * @returns {Promise<Object>} The updated goal record
 */
export async function updateGoalProgress(goalId, updates = {}) {
  const vaultId = getVaultId();
  const existing = await db.goals.get(goalId);

  if (!existing || existing.vaultId !== vaultId) {
    throw new Error("Goal not found or access denied.");
  }

  const updatedGoal = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Prevent tampering with ownership
  updatedGoal.vaultId = vaultId;
  updatedGoal.id = goalId;

  // Auto-complete when saved amount reaches or exceeds target
  const saved = Number(updatedGoal.savedAmount) || 0;
  const target = Number(updatedGoal.targetAmount) || 1;
  if (saved >= target && updatedGoal.status !== "completed") {
    updatedGoal.status = "completed";
  }

  await db.goals.put(updatedGoal);
  return updatedGoal;
}

/**
 * Retrieve all goals belonging to the current user's vault.
 *
 * @param {Object} [options]
 * @param {string} [options.status] - Filter by status: "active" | "completed" | "all" (default: "all")
 * @returns {Promise<Object[]>} Array of goal records sorted by createdAt descending
 */
export async function getGoalsByUser(options = {}) {
  const vaultId = getVaultId();
  const { status = "all" } = options;

  let results;

  if (status !== "all") {
    // Use the compound index path: query by vaultId first, then filter status in-memory
    // (Dexie schema indexes "id, vaultId, status" — vaultId is indexed)
    results = await db.goals.where("vaultId").equals(vaultId).toArray();
    results = results.filter((g) => g.status === status);
  } else {
    results = await db.goals.where("vaultId").equals(vaultId).toArray();
  }

  // Sort by createdAt descending (newest first)
  results.sort((a, b) => {
    const dateA = a.createdAt || "";
    const dateB = b.createdAt || "";
    return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
  });

  return results;
}

/**
 * Delete a goal from the local database.
 * Verifies vault ownership before deleting.
 *
 * @param {string} goalId - The goal ID to delete
 * @returns {Promise<boolean>} true if successfully deleted
 */
export async function deleteGoal(goalId) {
  const vaultId = getVaultId();
  const existing = await db.goals.get(goalId);

  if (!existing || existing.vaultId !== vaultId) {
    throw new Error("Goal not found or access denied.");
  }

  await db.goals.delete(goalId);
  return true;
}
