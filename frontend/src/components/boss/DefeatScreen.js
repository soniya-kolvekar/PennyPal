"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingDown, RefreshCw } from "lucide-react";

export default function DefeatScreen({ boss }) {
  const target = Number(boss.targetLimit) || 1;
  const spent = Number(boss.spentAmount) || 0;
  const lastMonth = Number(boss.lastMonthSpending) || 5000;
  const overAmount = Math.max(0, spent - target);
  const totalReduced = Math.max(0, lastMonth - spent);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Defeat Screen Card */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-rose-400 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-white border border-white/30 uppercase tracking-widest mb-4">
          <span>😈 BOSS SURVIVED THIS ROUND</span>
        </div>

        {/* CASHpaw Escaped Visual */}
        <div className="w-32 h-32 mx-auto bg-white/15 backdrop-blur-md rounded-3xl border border-white/30 flex items-center justify-center my-3 relative p-2 overflow-hidden">
          <Image
            src="/villain.png"
            alt={boss.name || "CASHpaw"}
            width={100}
            height={100}
            className="w-full h-full object-contain filter drop-shadow-md"
          />
          <span className="absolute -bottom-2 -right-2 text-3xl">😈</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-handwritten mt-2">
          {boss.name || "CASHpaw"} Survived!
        </h1>
        <p className="text-sm sm:text-base text-rose-100 font-medium max-w-md mx-auto mt-1">
          You spent <span className="font-extrabold text-white">₹{spent.toLocaleString()}</span> (₹{overAmount.toLocaleString()} over target).
        </p>

        {/* POSITIVE COMPARISON CARD */}
        <div className="mt-8 bg-white text-gray-900 p-6 rounded-3xl shadow-xl max-w-md mx-auto border border-[#EAE3FA] text-left space-y-4">
          <div className="flex items-center gap-2">
            <Image src="/heart.png" alt="Heart" width={16} height={16} />
            <h3 className="text-lg font-extrabold text-[#5B3F91] font-handwritten">
              BUT LOOK AT THIS 💜
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#FAF9FF] p-4 rounded-2xl border border-[#EAE3FA]">
            <div>
              <span className="text-xs text-gray-500 font-semibold block">Last Month</span>
              <span className="text-lg font-bold text-gray-700">₹{lastMonth.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold block">This Month</span>
              <span className="text-lg font-bold text-[#5B3F91]">₹{spent.toLocaleString()}</span>
            </div>
          </div>

          {totalReduced > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-bold">
              <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>You reduced your overall spending by ₹{totalReduced.toLocaleString()}!</span>
            </div>
          )}

          {/* Penny Coach Speech */}
          <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
            <Image src="/friend.png" alt="Penny" width={28} height={28} className="w-7 h-7 object-contain shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 font-semibold italic">
              "CASHpaw won this round, but you're still making real progress! Let's adjust target and fight back!"
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/boss/create"
            className="py-3.5 px-6 bg-white text-rose-800 font-extrabold rounded-2xl shadow-md hover:bg-rose-50 transition-all flex items-center gap-2 text-sm hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>⚔️ Create Next Boss</span>
          </Link>
          <Link
            href="/dashboard"
            className="py-3.5 px-6 bg-white/20 text-white font-bold rounded-2xl border border-white/40 hover:bg-white/30 transition-colors text-sm"
          >
            View Spending
          </Link>
        </div>
      </div>
    </div>
  );
}
