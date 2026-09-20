"use client";

import { X, Sparkles, Trophy, ArrowRight, Gift } from "lucide-react";

export default function LevelUpModal({ isOpen, onClose, level = 8, reward = "New Penny accessory" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE3FA] relative text-center animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-3 animate-bounce">
          <Sparkles className="w-10 h-10 fill-amber-400" />
        </div>

        <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
          LEVEL UP!
        </span>

        <div className="my-4 flex items-center justify-center gap-3 text-3xl font-black text-gray-900">
          <span className="text-gray-400">{level - 1}</span>
          <ArrowRight className="w-6 h-6 text-[#5B3F91]" />
          <span className="text-[#5B3F91] text-4xl">{level}</span>
        </div>

        <h3 className="text-xl font-black text-gray-900 font-handwritten mb-2">
          You Reached Level {level}!
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Your financial discipline is leveling up PennyPal!
        </p>

        <div className="bg-[#FAF9FF] p-4 rounded-2xl border border-[#EAE3FA] mb-6 flex items-center justify-between text-xs font-bold text-gray-800">
          <div className="flex items-center gap-2 text-[#5B3F91]">
            <Gift className="w-4 h-4 text-amber-500" />
            <span>Reward Unlocked:</span>
          </div>
          <span className="bg-[#EAE3FA] text-[#5B3F91] px-3 py-1 rounded-xl">
            {reward}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-[#5B3F91] hover:bg-[#4A3277] text-white font-bold rounded-2xl shadow-lg transition-colors text-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
