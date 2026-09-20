"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import { db } from "../../../../lib/db";
import { getVaultId } from "../../../../lib/vault";
import { useLiveQuery } from "dexie-react-hooks";
import BossCharacter, { getBossStateMeta } from "@/components/boss/BossCharacter";
import BossHealthBar from "@/components/boss/BossHealthBar";
import PennyMessage from "@/components/boss/PennyMessage";
import DamageAnimation from "@/components/boss/DamageAnimation";
import VictoryScreen from "@/components/boss/VictoryScreen";
import DefeatScreen from "@/components/boss/DefeatScreen";
import PennyLoader from "@/components/PennyLoader";
import { ArrowLeft, Swords, Plus, Sparkles } from "lucide-react";

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

  // Fetch transactions for this boss category
  const categoryTransactions = useLiveQuery(
    async () => {
      if (!db || !db.transactions || !boss) return [];
      const all = await db.transactions.toArray();
      return all.filter((t) => t.category === boss.category);
    },
    [boss]
  );

  const handleSimulateDamage = async (amount = 450, merchant = "Amazon") => {
    if (!boss) return;

    const newSpent = (Number(boss.spentAmount) || 0) + amount;
    const target = Number(boss.targetLimit) || 1;
    const isOverBudget = newSpent > target;

    try {
      // Add damage transaction to DB
      await db.transactions.add({
        id: `tx-${Date.now()}`,
        vaultId,
        merchant,
        category: boss.category,
        amount,
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        status: "active"
      });

      // Update boss spent amount
      await db.bosses.update(boss.id, {
        spentAmount: newSpent,
        status: isOverBudget ? "defeat" : boss.status || "active"
      });

      // Trigger floating FX
      setActiveDamageFX({ amount, merchant });
      setTimeout(() => setActiveDamageFX(null), 3000);

      setToastMessage(`Recorded ₹${amount} damage to ${boss.name}!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Failed to add damage:", err);
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

  // Render Victory or Defeat screens if completed
  if (boss.status === "victory") {
    return (
      <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans relative">
        <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1">
          <VictoryScreen boss={boss} />
        </main>
      </div>
    );
  }

  if (boss.status === "defeat") {
    return (
      <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans relative">
        <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1">
          <DefeatScreen boss={boss} />
        </main>
      </div>
    );
  }

  const target = Number(boss.targetLimit) || 1;
  const spent = Number(boss.spentAmount) || 0;
  const ratio = spent / target;

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
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5B3F91] hover:text-[#8064C8] transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#EAE3FA]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <button
            onClick={() => handleSimulateDamage(450, "Amazon")}
            className="px-3.5 py-1.5 bg-[#5B3F91] hover:bg-[#4A3277] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Record Purchase (-₹450)</span>
          </button>
        </div>

        {/* 1. POLAR BEAR CENTERSTAGE */}
        <BossCharacter boss={boss} />

        {/* 2. BOSS HEALTH BAR */}
        <BossHealthBar boss={boss} />

        {/* 3. PENNY COACH MESSAGE */}
        <PennyMessage status={boss.status} ratio={ratio} />

        {/* 4. RECENT DAMAGE LOG */}
        <DamageAnimation
          transactions={categoryTransactions || []}
          activeDamage={activeDamageFX}
        />
      </main>
    </div>
  );
}
