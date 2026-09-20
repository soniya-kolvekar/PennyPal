"use client";

import { useState, useEffect, useMemo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import { db } from "../../../../lib/db";
import { getVaultId } from "../../../../lib/vault";
import { useLiveQuery } from "dexie-react-hooks";
import { computeBossSpent, evaluateBossStatus, getBossTransactions } from "../../../../lib/boss";
import BossCharacter, { getBossStateMeta } from "@/components/boss/BossCharacter";
import BossHealthBar from "@/components/boss/BossHealthBar";
import PennyMessage from "@/components/boss/PennyMessage";
import DamageAnimation from "@/components/boss/DamageAnimation";
import VictoryScreen from "@/components/boss/VictoryScreen";
import DefeatScreen from "@/components/boss/DefeatScreen";
import PennyLoader from "@/components/PennyLoader";
import { ArrowLeft, Swords, Plus, Sparkles, Trophy } from "lucide-react";

export default function BossBattlePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const bossId = params?.bossId;

  const [activeDamageFX, setActiveDamageFX] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const vaultId = typeof window !== "undefined" ? getVaultId() : "default_vault";

  // Fetch boss live from Dexie
  const boss = useLiveQuery(
    async () => {
      if (!db || !db.bosses || !bossId) return null;
      const found = await db.bosses.get(bossId);
      if (found) return found;
      const all = await db.bosses.toArray();
      return all.find((b) => b.id === bossId) || null;
    },
    [bossId]
  );

  // Fetch transactions for this boss category strictly within the active challenge period
  const categoryTransactions = useLiveQuery(
    async () => {
      if (!db || !db.transactions || !boss) return [];
      const all = await db.transactions.toArray();
      const vaultScoped = all.filter((t) => !t.vaultId || t.vaultId === vaultId);
      return getBossTransactions(boss, vaultScoped);
    },
    [boss, vaultId]
  );

  // Compute live spending directly derived from transactions
  const spent = useMemo(() => {
    return computeBossSpent(boss, categoryTransactions || []);
  }, [boss, categoryTransactions]);

  const target = Number(boss?.targetLimit) || 1;
  const ratio = spent / target;

  // Auto-sync status if budget is exceeded or challenge completed
  useEffect(() => {
    if (!boss || !boss.id) return;
    const effectiveStatus = evaluateBossStatus(boss, spent);
    if (effectiveStatus !== boss.status && (effectiveStatus === "defeat" || effectiveStatus === "victory")) {
      db.bosses.update(boss.id, {
        status: effectiveStatus,
        spentAmount: spent
      }).catch((err) => console.warn("Could not sync boss status:", err));
    }
  }, [boss?.id, boss?.status, spent]);

  const handleSimulateDamage = async (amount = 450, merchant = "Amazon") => {
    if (!boss) return;

    const newSpent = spent + amount;
    const isOverBudget = newSpent > target;

    try {
      const todayStr = new Date().toISOString().split("T")[0];

      // Add damage transaction to DB (triggers useLiveQuery reactivity instantly)
      await db.transactions.add({
        id: `tx-${Date.now()}`,
        vaultId,
        merchant,
        category: boss.category,
        amount,
        type: "expense",
        date: todayStr,
        createdAt: new Date().toISOString(),
        status: "active"
      });

      // Update boss spent amount in Dexie
      await db.bosses.update(boss.id, {
        spentAmount: newSpent,
        status: isOverBudget ? "defeat" : boss.status || "active"
      });

      // Trigger floating FX
      setActiveDamageFX({ amount, merchant });
      setTimeout(() => setActiveDamageFX(null), 3000);

      setToastMessage(`Recorded ₹${amount} expense to ${boss.name}!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Failed to add damage:", err);
    }
  };

  const handleClaimVictory = async () => {
    if (!boss) return;
    try {
      await db.bosses.update(boss.id, {
        status: "victory",
        spentAmount: spent
      });
      setToastMessage(`Victory claimed against ${boss.name}!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Failed to claim victory:", err);
    }
  };

  if (boss === undefined) {
    return <PennyLoader message="Entering the battle arena..." />;
  }

  if (!boss) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans">
        <AppNavbar />

        <main className="max-w-4xl w-full mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold font-handwritten mb-4">Boss Battle Not Found</h2>
          <p className="text-gray-500 mb-6">The requested boss battle does not exist or has expired.</p>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#5B3F91] text-white font-bold rounded-2xl shadow-md inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </main>
      </div>
    );
  }

  const bossView = {
    ...boss,
    spentAmount: spent,
    status: boss.status
  };

  // Render Victory or Defeat screens if completed
  if (boss.status === "victory") {
    return (
      <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans relative">
        <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1">
          <VictoryScreen boss={bossView} />
        </main>
      </div>
    );
  }

  if (boss.status === "defeat") {
    return (
      <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans relative">
        <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1">
          <DefeatScreen boss={bossView} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Soft Background Lavender & Pink Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />
      <div className="absolute top-2/3 left-0 w-[450px] h-[450px] bg-[#F6C9D5] rounded-full blur-3xl opacity-30 pointer-events-none -translate-x-1/3" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#5B3F91] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* NAVBAR */}
      <AppNavbar />

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 sm:px-12 py-8 flex flex-col gap-6 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5B3F91] hover:text-[#8064C8] transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#EAE3FA]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            {spent <= target && (
              <button
                onClick={handleClaimVictory}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Claim Victory</span>
              </button>
            )}

            <button
              onClick={() => handleSimulateDamage(450, "Amazon")}
              className="px-3.5 py-1.5 bg-[#5B3F91] hover:bg-[#4A3277] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Purchase (-₹450)</span>
            </button>
          </div>
        </div>

        {/* 1. POLAR BEAR CENTERSTAGE */}
        <BossCharacter boss={bossView} />

        {/* 2. BOSS HEALTH BAR */}
        <BossHealthBar boss={bossView} />

        {/* 3. PENNY COACH MESSAGE */}
        <PennyMessage status={bossView.status} ratio={ratio} />

        {/* 4. RECENT DAMAGE LOG */}
        <DamageAnimation
          transactions={categoryTransactions || []}
          activeDamage={activeDamageFX}
        />
      </main>
    </div>
  );
}
