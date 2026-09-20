"use client";

import Image from "next/image";
import { Flame, ShieldAlert, Sparkles, Skull, Trophy } from "lucide-react";

export function getBossPersonaName(category) {
  switch (category) {
    case "Shopping":
      return "CASHpaw Shopzilla";
    case "Food":
      return "CASHpaw Snackzilla";
    case "Entertainment":
      return "CASHpaw Funzilla";
    case "Transport":
      return "CASHpaw Roadzilla";
    default:
      return `CASHpaw ${category} Bear`;
  }
}

export function getBossStateMeta(status, ratio) {
  if (status === "victory") {
    return {
      state: "victory",
      emoji: "😵💫",
      badge: "DEFEATED",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      quote: "Ugh... I was defeated! You beat your target!",
      bgGrad: "from-emerald-50 to-teal-50 border-emerald-200"
    };
  }

  if (status === "defeat" || ratio > 1) {
    return {
      state: "defeat",
      emoji: "😈",
      badge: "SURVIVED & ESCAPED",
      badgeBg: "bg-rose-100 text-rose-800 border-rose-300",
      quote: "HA! You spent over budget! I survived this round!",
      bgGrad: "from-rose-50 to-pink-50 border-rose-200"
    };
  }

  if (ratio >= 0.9) {
    return {
      state: "critical",
      emoji: "😱",
      badge: "FINAL PHASE - PANICKING",
      badgeBg: "bg-red-100 text-red-800 border-red-300 animate-pulse",
      quote: "NO! You're about to defeat me! Stop saving!",
      bgGrad: "from-red-50 to-orange-50 border-red-200"
    };
  }

  if (ratio >= 0.75) {
    return {
      state: "danger",
      emoji: "😰",
      badge: "CASHpaw IS NERVOUS",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
      quote: "Careful... You're getting dangerously close to beating me!",
      bgGrad: "from-amber-50 to-yellow-50 border-amber-200"
    };
  }

  if (ratio >= 0.5) {
    return {
      state: "caution",
      emoji: "😏",
      badge: "CASHpaw IS GETTING WORRIED",
      badgeBg: "bg-[#EAE3FA] text-[#5B3F91] border-[#C9B9F2]",
      quote: "Wait... are you actually sticking to your spending limit?",
      bgGrad: "from-[#FAF9FF] to-[#EAE3FA]/60 border-[#EAE3FA]"
    };
  }

  return {
    state: "safe",
    emoji: "😈",
    badge: "CONFIDENT BOSS",
    badgeBg: "bg-[#FAF9FF] text-[#5B3F91] border-[#EAE3FA]",
    quote: "Come on... buy just one more thing!",
    bgGrad: "from-[#FAF9FF] to-purple-50/50 border-[#EAE3FA]"
  };
}

export default function BossCharacter({ boss }) {
  const target = Number(boss.targetLimit) || 1;
  const spent = Number(boss.spentAmount) || 0;
  const ratio = spent / target;

  const meta = getBossStateMeta(boss.status, ratio);
  const personaName = getBossPersonaName(boss.category);

  return (
    <div className={`bg-gradient-to-b ${meta.bgGrad} rounded-3xl p-6 sm:p-8 border shadow-sm text-center relative overflow-hidden transition-all duration-500`}>
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/40 rounded-full blur-2xl pointer-events-none" />

      {/* State Badge */}
      <div className="relative z-10 mb-4 inline-flex">
        <span className={`text-xs font-black px-3.5 py-1 rounded-full border shadow-xs tracking-wider uppercase ${meta.badgeBg}`}>
          {meta.badge}
        </span>
      </div>

      {/* Character Visual */}
      <div className="relative z-10 my-2 flex flex-col items-center justify-center">
        <div className="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center relative group transform transition-transform hover:scale-105">
          <Image
            src="/villain.png"
            alt={personaName}
            width={160}
            height={160}
            className="w-full h-full object-contain filter drop-shadow-lg"
            priority
          />
          <div className="absolute -bottom-1 -right-1 bg-white px-2.5 py-1 rounded-xl text-2xl shadow-sm border border-gray-200/80">
            {meta.emoji}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-4 tracking-tight">
          {personaName}
        </h2>
      </div>

      {/* Speech Bubble Quote */}
      <div className="relative z-10 max-w-sm mx-auto mt-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-200/80 shadow-xs text-xs sm:text-sm font-semibold text-gray-700 italic">
        "{meta.quote}"
      </div>
    </div>
  );
}
