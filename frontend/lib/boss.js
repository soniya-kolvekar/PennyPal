import { db } from "./db";

/**
 * Computes actual total spending for a boss challenge from real active transactions.
 * Scoped strictly to category, non-income transactions, and within the boss active date window.
 *
 * @param {Object} boss
 * @param {Array} transactions
 * @returns {number} total spending
 */
export function computeBossSpent(boss, transactions = []) {
  if (!boss || !Array.isArray(transactions)) return Number(boss?.spentAmount) || 0;

  const category = (boss.category || "").trim().toLowerCase();
  const startDate = boss.startDate || "1970-01-01";
  const endDate = boss.endDate || "2099-12-31";

  const matchingTransactions = transactions.filter((tx) => {
    // Only count expenses
    const isExpense = tx.type?.toLowerCase() === "expense" || (!tx.type && Number(tx.amount) > 0);
    if (!isExpense) return false;

    // Status check (active or reconciled)
    const isActive = tx.status === "active" || tx.status === "reconciled" || !tx.status;
    if (!isActive) return false;

    // Category match
    const txCat = (tx.category || "").trim().toLowerCase();
    const categoryMatches = category === "all" || txCat === category;
    if (!categoryMatches) return false;

    // Date range check
    if (tx.date) {
      if (tx.date < startDate || tx.date > endDate) return false;
    }

    return true;
  });

  const total = matchingTransactions.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

  // If there are recorded transactions, return the computed total.
  // Otherwise fall back to any manually simulated spentAmount.
  return total > 0 ? total : Number(boss.spentAmount) || 0;
}

/**
 * Returns filtered and sorted transactions for an active boss challenge:
 * - Matching category
 * - Expense only
 * - Between boss startDate and endDate
 * - Sorted newest first
 *
 * @param {Object} boss
 * @param {Array} transactions
 * @returns {Array} matching transactions sorted newest first
 */
export function getBossTransactions(boss, transactions = []) {
  if (!boss || !Array.isArray(transactions)) return [];

  const category = (boss.category || "").trim().toLowerCase();
  const startDate = boss.startDate || "1970-01-01";
  const endDate = boss.endDate || "2099-12-31";

  return transactions
    .filter((tx) => {
      const isExpense = tx.type?.toLowerCase() === "expense" || (!tx.type && Number(tx.amount) > 0);
      if (!isExpense) return false;
      if (tx.status === "deleted") return false;

      const txCat = (tx.category || "").trim().toLowerCase();
      const matchesCat = category === "all" || txCat === category;
      if (!matchesCat) return false;

      if (tx.date) {
        if (tx.date < startDate || tx.date > endDate) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = a.date || a.createdAt || "";
      const dateB = b.date || b.createdAt || "";
      return dateB.localeCompare(dateA);
    });
}

/**
 * Dynamically computes total spending in a category for the previous calendar month from real transactions.
 *
 * @param {string} category
 * @param {Array} transactions
 * @returns {number} actual spent in the previous month
 */
export function calculateLastMonthSpending(category, transactions = []) {
  if (!Array.isArray(transactions) || transactions.length === 0) return 0;

  const cat = (category || "").trim().toLowerCase();

  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonthNum = String(lastMonthDate.getMonth() + 1).padStart(2, "0");
  const lastMonthPrefix = `${lastMonthYear}-${lastMonthNum}`;

  const lastMonthTxs = transactions.filter((tx) => {
    const isExpense = tx.type?.toLowerCase() === "expense" || (!tx.type && Number(tx.amount) > 0);
    if (!isExpense) return false;
    if (tx.status === "deleted") return false;

    const txCat = (tx.category || "").trim().toLowerCase();
    const matchesCat = cat === "all" || txCat === cat;
    if (!matchesCat) return false;

    return Boolean(tx.date && tx.date.startsWith(lastMonthPrefix));
  });

  const sum = lastMonthTxs.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  if (sum > 0) return sum;

  // Fallback: check 30 days window before the 1st of current month
  const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const thirtyDaysBefore = new Date(new Date(currentMonthStart).getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const fallbackTxs = transactions.filter((tx) => {
    const isExpense = tx.type?.toLowerCase() === "expense" || (!tx.type && Number(tx.amount) > 0);
    if (!isExpense) return false;
    if (tx.status === "deleted") return false;

    const txCat = (tx.category || "").trim().toLowerCase();
    const matchesCat = cat === "all" || txCat === cat;
    if (!matchesCat) return false;

    return Boolean(tx.date && tx.date >= thirtyDaysBefore && tx.date < currentMonthStart);
  });

  return fallbackTxs.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
}

/**
 * Evaluates the current state of a boss battle based on target limit, spent amount, and date.
 *
 * @param {Object} boss
 * @param {number} currentSpent
 * @returns {"active" | "victory" | "defeat"}
 */
export function evaluateBossStatus(boss, currentSpent) {
  if (!boss) return "active";

  const target = Number(boss.targetLimit) || 1;
  const spent = Number(currentSpent) || 0;

  // If already manually marked victory, preserve it
  if (boss.status === "victory") return "victory";

  // If spent strictly exceeds target limit, boss survived -> user defeat
  if (spent > target) {
    return "defeat";
  }

  // Check if period has ended and user stayed under budget -> victory!
  if (boss.endDate) {
    const todayStr = new Date().toISOString().split("T")[0];
    if (todayStr > boss.endDate && spent <= target) {
      return "victory";
    }
  }

  return boss.status || "active";
}

/**
 * Calculates current level from XP points (e.g., 200 XP per level)
 * @param {number} xp
 * @returns {number} level
 */
export function calculateLevelFromXp(xp = 0) {
  return Math.max(1, Math.floor(xp / 200) + 1);
}

/**
 * Retrieves the user progress record from Dexie for the given vaultId
 * @param {string} vaultId
 * @returns {Promise<{ id: string, vaultId: string, xp: number, level: number, streak: number }>}
 */
export async function getUserProgress(vaultId = "default_vault") {
  try {
    if (!db || !db.userProgress) {
      return { id: `prog-${vaultId}`, vaultId, xp: 1420, level: 8, streak: 5 };
    }

    let progress = await db.userProgress.where("vaultId").equals(vaultId).first();
    if (!progress) {
      progress = await db.userProgress.get(`prog-${vaultId}`);
    }

    if (!progress) {
      // Initialize default user progress
      progress = {
        id: `prog-${vaultId}`,
        vaultId,
        xp: 1420,
        level: 8,
        streak: 5,
        updatedAt: new Date().toISOString()
      };
      await db.userProgress.put(progress);
    }

    return progress;
  } catch (err) {
    console.warn("Failed to get user progress:", err);
    return { id: `prog-${vaultId}`, vaultId, xp: 1420, level: 8, streak: 5 };
  }
}

/**
 * Claims the victory reward for defeating a boss battle:
 * - Increases user XP in Dexie userProgress
 * - Unlocks the FIRST_BOSS_DEFEATED achievement in Dexie achievements
 * - Updates the boss record to mark rewardClaimed: true
 *
 * @param {string} bossId
 * @param {number} xpReward
 * @param {string} vaultId
 * @returns {Promise<{ newXp: number, newLevel: number, leveledUp: boolean, rewardClaimed: boolean }>}
 */
export async function claimBossReward(bossId, xpReward = 250, vaultId = "default_vault") {
  try {
    if (!db || !db.bosses) {
      return { newXp: 1670, newLevel: 9, leveledUp: true, rewardClaimed: true };
    }

    const boss = await db.bosses.get(bossId);
    const rewardAlreadyClaimed = Boolean(boss?.rewardClaimed);

    // Get current progress
    const progress = await getUserProgress(vaultId);
    const currentXp = Number(progress.xp) || 1420;
    const currentLevel = Number(progress.level) || calculateLevelFromXp(currentXp);

    if (rewardAlreadyClaimed) {
      return {
        newXp: currentXp,
        newLevel: currentLevel,
        leveledUp: false,
        rewardClaimed: true
      };
    }

    const newXp = currentXp + (Number(xpReward) || 250);
    const newLevel = calculateLevelFromXp(newXp);
    const leveledUp = newLevel > currentLevel;

    // Update userProgress in Dexie
    await db.userProgress.put({
      ...progress,
      xp: newXp,
      level: newLevel,
      updatedAt: new Date().toISOString()
    });

    // Mark boss as claimed & victory
    await db.bosses.update(bossId, {
      status: "victory",
      rewardClaimed: true,
      updatedAt: new Date().toISOString()
    });

    // Record achievement if not already present
    if (db.achievements) {
      const existingAch = await db.achievements
        .where("vaultId")
        .equals(vaultId)
        .filter((a) => a.code === "FIRST_BOSS_DEFEATED")
        .first();

      if (!existingAch) {
        await db.achievements.add({
          id: `ach-boss-${Date.now()}`,
          vaultId,
          code: "FIRST_BOSS_DEFEATED",
          title: "First Boss Defeated",
          description: "Defeated CASHpaw by staying under your spending budget!",
          unlockedAt: new Date().toISOString()
        });
      }
    }

    return {
      newXp,
      newLevel,
      leveledUp,
      rewardClaimed: true
    };
  } catch (err) {
    console.error("Failed to claim boss reward:", err);
    return {
      newXp: 1670,
      newLevel: 9,
      leveledUp: true,
      rewardClaimed: true
    };
  }
}

/**
 * Seeds a default starter boss challenge if none exists yet for the user
 * @param {string} vaultId
 */
export async function seedDemoBossIfEmpty(vaultId = "default_vault") {
  try {
    if (!db || !db.bosses) return;
    const count = await db.bosses.count();
    if (count === 0) {
      await db.bosses.add({
        id: "boss-shopping-1",
        vaultId,
        name: "CASHpaw Shopzilla",
        category: "Shopping",
        targetLimit: 3000,
        spentAmount: 1850,
        lastMonthSpending: 5000,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "active",
        rewardXP: 250,
        rewardClaimed: false,
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn("Could not seed demo boss:", err);
  }
}
