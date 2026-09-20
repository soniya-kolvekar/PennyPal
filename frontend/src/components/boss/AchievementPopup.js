"use client";

import { Award, Zap, X } from "lucide-react";

export default function AchievementPopup({ isOpen, onClose, title = "FIRST BOSS DEFEATED", xp = 50 }) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#5B3F91] text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-[#8064C8] max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-400 text-gray-900 flex items-center justify-center shrink-0">
          <Award className="w-6 h-6" />
        </div>

        <div className="flex-1 space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-200">
            TROPHY UNLOCKED
          </span>
          <h4 className="text-base font-black leading-tight text-white">{title}</h4>
          <p className="text-xs text-purple-200">You defeated your first PennyPal Boss!</p>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 pt-1">
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span>+{xp} XP Earned</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-purple-300 hover:text-white rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
