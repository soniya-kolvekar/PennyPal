"use client";

import { Clock, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

export default function BossHealthBar({ boss }) {
  const target = Number(boss.targetLimit) || 1;
  const spent = Number(boss.spentAmount) || 0;
  const remaining = target - spent;
  const progress = Math.min(100, Math.round((spent / target) * 100));
  const isOverBudget = spent > target;
  const isVictory = boss.status === "victory";

  // Days left calculation
  let daysLeft = 0;
  if (boss.endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endD = new Date(boss.endDate);
    endD.setHours(0, 0, 0, 0);
    const diffTime = endD - today;
    daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Bar Gradient logic
  let barGradient = "from-[#8064C8] to-[#5B3F91]";
  let textColor = "text-[#5B3F91]";

  if (isVictory) {
    barGradient = "from-emerald-400 to-teal-600";
    textColor = "text-emerald-700";
  } else if (isOverBudget) {
    barGradient = "from-rose-500 to-red-700";
    textColor = "text-rose-700";
  } else if (progress >= 85) {
    barGradient = "from-amber-500 to-red-500";
    textColor = "text-red-600";
  } else if (progress >= 60) {
    barGradient = "from-amber-400 to-amber-600";
    textColor = "text-amber-700";
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE3FA] shadow-sm space-y-4">
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-500">
        <span>⚔️ BOSS HEALTH</span>
        <div className="flex items-center gap-1.5 bg-[#FAF9FF] px-3 py-1 rounded-full border border-[#EAE3FA] text-[#5B3F91]">
          <Clock className="w-3.5 h-3.5" />
          <span>{daysLeft > 0 ? `${daysLeft} DAYS LEFT` : "FINAL DAY"}</span>
        </div>
      </div>

      {/* Main Amounts Display */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            ₹{spent.toLocaleString()}
          </span>
          <span className="text-base text-gray-500 font-bold">
            / ₹{target.toLocaleString()} limit
          </span>
        </div>
        <span className={`text-2xl font-black ${textColor}`}>{progress}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-[#FAF9FF] rounded-full h-4 border border-[#EAE3FA] overflow-hidden p-1">
        <div
          className={`bg-gradient-to-r ${barGradient} h-full rounded-full transition-all duration-700`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Subtitle Footer */}
      <div className="flex items-center justify-between text-xs font-bold pt-1">
        <span className={isOverBudget ? "text-rose-600 font-black" : "text-gray-600"}>
          {isOverBudget
            ? `₹${Math.abs(remaining).toLocaleString()} OVER BUDGET!`
            : `₹${remaining.toLocaleString()} budget remaining`}
        </span>
        <span className="text-[#5B3F91]">{boss.category} Battle</span>
      </div>
    </div>
  );
}
