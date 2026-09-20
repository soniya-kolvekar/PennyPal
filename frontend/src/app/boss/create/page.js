"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import { useRouter } from "next/navigation";
import { db } from "../../../../lib/db";
import { getVaultId } from "../../../../lib/vault";
import { getBossPersonaName } from "@/components/boss/BossCharacter";
import { ArrowLeft, Swords, Sparkles, Trophy, Sliders } from "lucide-react";

const CANONICAL_CATEGORIES = [
  "Shopping",
  "Food",
  "Transport",
  "Bills",
  "Subscriptions",
  "Entertainment",
  "Healthcare",
  "Education",
  "Rent",
  "Travel",
  "Personal",
  "Other"
];

export default function StandaloneCreateBossPage() {
  const router = useRouter();
  const [category, setCategory] = useState("Shopping");
  const [lastMonthSpending, setLastMonthSpending] = useState(5000);
  const [targetLimit, setTargetLimit] = useState(3000);

  const vaultId = typeof window !== "undefined" ? getVaultId() : "default_vault";
  const personaName = getBossPersonaName(category);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetLimit || targetLimit <= 0) return;

    const newBoss = {
      id: `boss-${Date.now()}`,
      vaultId,
      name: personaName,
      category,
      targetLimit: Number(targetLimit),
      spentAmount: 0,
      lastMonthSpending: Number(lastMonthSpending),
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "active",
      rewardXP: 250,
      createdAt: new Date().toISOString()
    };

    try {
      await db.bosses.add(newBoss);
      router.push(`/boss/${newBoss.id}`);
    } catch (err) {
      console.error("Failed to create boss:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Soft Background Lavender & Pink Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />

      {/* NAVBAR */}
      <AppNavbar />

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-3xl w-full mx-auto px-6 sm:px-12 py-8 flex flex-col gap-8 flex-1">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5B3F91] hover:text-[#8064C8] transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#EAE3FA]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE3FA] shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 bg-[#FAF9FF] text-[#5B3F91] rounded-2xl flex items-center justify-center border border-[#EAE3FA]">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-handwritten">
                Create Your Boss Battle
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Set a spending limit and challenge CASHpaw Polar Bear!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                Select Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] text-base font-bold text-gray-900 bg-white"
              >
                {CANONICAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Penny Speech */}
            <div className="bg-[#FAF9FF] rounded-2xl p-4 border border-[#EAE3FA] flex items-start gap-3">
              <Image src="/friend.png" alt="Penny" width={28} height={28} className="w-7 h-7 object-contain shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <span className="font-bold text-[#5B3F91] block mb-0.5">Penny says:</span>
                <p className="italic">
                  "Let's see if we can beat this one! Challenge CASHpaw for {category}!"
                </p>
              </div>
            </div>

            {/* Target Input & Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span>Last Month Spending</span>
                <span className="text-gray-900 text-sm">₹{lastMonthSpending.toLocaleString()}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your Target Limit (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  max="100000"
                  required
                  value={targetLimit}
                  onChange={(e) => setTargetLimit(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] text-lg font-extrabold text-gray-900"
                />
              </div>

              <input
                type="range"
                min="500"
                max={lastMonthSpending * 1.5}
                step="250"
                value={targetLimit}
                onChange={(e) => setTargetLimit(Number(e.target.value))}
                className="w-full accent-[#5B3F91] cursor-pointer"
              />
            </div>

            {/* BOSS PREVIEW BOX */}
            <div className="bg-gradient-to-b from-[#FAF9FF] to-purple-50/60 rounded-3xl p-6 border border-[#EAE3FA] text-center space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#5B3F91]">
                ──────── BOSS PREVIEW ────────
              </span>

              <div className="w-28 h-28 mx-auto my-2 flex items-center justify-center">
                <Image
                  src="/villain.png"
                  alt={personaName}
                  width={110}
                  height={110}
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>

              <h3 className="text-2xl font-black text-gray-900">{personaName}</h3>

              <div className="grid grid-cols-3 gap-3 text-xs pt-2">
                <div className="bg-white p-3 rounded-2xl border border-[#EAE3FA]">
                  <span className="text-gray-400 block text-[10px]">Budget Limit</span>
                  <span className="font-extrabold text-gray-900">₹{targetLimit.toLocaleString()}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#EAE3FA]">
                  <span className="text-gray-400 block text-[10px]">Last Month</span>
                  <span className="font-extrabold text-gray-900">₹{lastMonthSpending.toLocaleString()}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#EAE3FA]">
                  <span className="text-gray-400 block text-[10px]">Reward</span>
                  <span className="font-extrabold text-amber-600">⭐ 250 XP</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-[#5B3F91] hover:bg-[#4A3277] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base hover:scale-[1.02]"
            >
              <Swords className="w-5 h-5" />
              <span>Start Boss Battle</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
