"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Sparkles, ArrowRight, Zap } from "lucide-react";
import LevelUpModal from "./LevelUpModal";
import AchievementPopup from "./AchievementPopup";

export default function VictoryScreen({ boss }) {
  const [xp, setXp] = useState(1420);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);

  const target = Number(boss.targetLimit) || 1;
  const spent = Number(boss.spentAmount) || 0;
  const saved = Math.max(0, target - spent);

  useEffect(() => {
    // XP Animation effect
    const timer1 = setTimeout(() => {
      setXp(1670);
    }, 600);

    const timer2 = setTimeout(() => {
      setShowLevelUp(true);
    }, 1500);

    const timer3 = setTimeout(() => {
      setShowAchievement(true);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Victory Hero Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-emerald-400 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-amber-300 border border-white/30 uppercase tracking-widest mb-4">
          <Trophy className="w-4 h-4 fill-amber-300" />
          <span>VICTORY! BOSS DEFEATED</span>
        </div>

        {/* CASHpaw Defeated Illustration */}
        <div className="w-32 h-32 mx-auto bg-white/15 backdrop-blur-md rounded-3xl border border-white/30 flex items-center justify-center my-3 relative p-2 overflow-hidden">
          <Image
            src="/villain.png"
            alt={boss.name || "CASHpaw"}
            width={100}
            height={100}
            className="w-full h-full object-contain filter drop-shadow-md"
          />
          <span className="absolute -bottom-2 -right-2 text-3xl">😵💫</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-handwritten mt-2">
          You Defeated {boss.name || "CASHpaw"}!
        </h1>
        <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-md mx-auto mt-1">
          You beat your spending target and stayed <span className="font-extrabold text-white">₹{saved.toLocaleString()}</span> under budget!
        </p>

        {/* Amounts Comparison */}
        <div className="max-w-xs mx-auto mt-6 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex justify-around items-center">
          <div>
            <span className="text-xs text-emerald-200 block">Total Spent</span>
            <span className="text-lg font-bold">₹{spent.toLocaleString()}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/20" />
          <div>
            <span className="text-xs text-emerald-200 block">Target Limit</span>
            <span className="text-lg font-bold">₹{target.toLocaleString()}</span>
          </div>
        </div>

        {/* Animated XP Rewards */}
        <div className="mt-8 bg-white text-[#5B3F91] p-4 sm:p-5 rounded-2xl shadow-xl max-w-sm mx-auto flex items-center justify-between border border-[#EAE3FA]">
          <div className="flex items-center gap-2 font-bold text-xs">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>XP Earned</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-600 transition-all duration-700">
              {xp.toLocaleString()} XP
            </span>
            <span className="text-xs font-bold text-emerald-600 block">+250 XP Victory Bonus</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/boss/create"
            className="py-3.5 px-6 bg-white text-emerald-800 font-extrabold rounded-2xl shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2 text-sm hover:scale-105"
          >
            <span>⚔️ Create Next Boss</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="py-3.5 px-6 bg-white/20 text-white font-bold rounded-2xl border border-white/40 hover:bg-white/30 transition-colors text-sm"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Gamification Modals */}
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        level={8}
        reward="New Penny accessory"
      />

      <AchievementPopup
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
        title="FIRST BOSS DEFEATED"
        xp={50}
      />
    </div>
  );
}
