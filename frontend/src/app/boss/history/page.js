"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import { db } from "../../../../lib/db";
import { getVaultId } from "../../../../lib/vault";
import { useLiveQuery } from "dexie-react-hooks";
import BossCard from "@/components/boss/BossCard";
import PennyLoader from "@/components/PennyLoader";
import { Swords, Plus, Trophy, ShieldAlert, ArrowLeft } from "lucide-react";

export default function BossHistoryPage() {
  const [filter, setFilter] = useState("all"); // "all" | "victory" | "defeat"

  const vaultId = typeof window !== "undefined" ? getVaultId() : "default_vault";

  const rawBosses = useLiveQuery(
    async () => {
      try {
        if (!db || !db.bosses) return [];
        const items = await db.bosses.toArray();
        return items.filter((b) => !b.vaultId || b.vaultId === vaultId);
      } catch {
        return [];
      }
    },
    [vaultId]
  );

  if (rawBosses === undefined) {
    return <PennyLoader message="Loading boss history..." />;
  }

  const bosses = rawBosses || [];

  const filteredBosses = bosses.filter((b) => {
    if (filter === "victory") return b.status === "victory";
    if (filter === "defeat") return b.status === "defeat" || Number(b.spentAmount) > Number(b.targetLimit);
    return true;
  });

  const defeatedCount = bosses.filter((b) => b.status === "victory").length;
  const totalBossesCount = bosses.length;

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Soft Background Lavender & Pink Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />

      {/* NAVBAR */}
      <AppNavbar />

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-12 py-8 flex flex-col gap-8 flex-1">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-[#EAE3FA] text-[#8064C8] rounded-2xl flex items-center justify-center border border-[#C9B9F2]">
                <Swords className="w-6 h-6" />
              </div>
              <h1 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91]">
                Boss History
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#5B3F91]/80 font-medium">
              Track your financial battles against CASHpaw!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-[#EAE3FA] shadow-xs text-xs font-bold text-gray-700">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{defeatedCount} / {totalBossesCount} Defeated</span>
            </div>

            <Link
              href="/boss/create"
              className="px-4 py-2 bg-[#5B3F91] hover:bg-[#4A3277] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Boss</span>
            </Link>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-2 border-b border-[#EAE3FA] pb-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === "all"
                ? "bg-[#5B3F91] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-[#FAF9FF] border border-gray-200"
            }`}
          >
            All Battles ({bosses.length})
          </button>
          <button
            onClick={() => setFilter("victory")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === "victory"
                ? "bg-[#5B3F91] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-[#FAF9FF] border border-gray-200"
            }`}
          >
            Defeated ({defeatedCount})
          </button>
          <button
            onClick={() => setFilter("defeat")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === "defeat"
                ? "bg-[#5B3F91] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-[#FAF9FF] border border-gray-200"
            }`}
          >
            Survived ({bosses.length - defeatedCount})
          </button>
        </div>

        {/* BOSS CARDS GRID */}
        {filteredBosses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBosses.map((boss) => (
              <BossCard key={boss.id} boss={boss} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 border border-[#EAE3FA] text-center flex flex-col items-center justify-center my-8 shadow-sm space-y-4">
            <div className="w-24 h-24 flex items-center justify-center">
              <Image
                src="/villain.png"
                alt="CASHpaw"
                width={90}
                height={90}
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-handwritten">
              No boss battles found!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              Create your first spending boss challenge to fight CASHpaw and earn XP rewards!
            </p>
            <Link
              href="/boss/create"
              className="py-3 px-6 bg-[#5B3F91] hover:bg-[#4A3277] text-white font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Boss</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
