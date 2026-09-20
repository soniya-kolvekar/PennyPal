"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Swords, Sparkles, Trophy, Sliders } from "lucide-react";
import { getBossPersonaName } from "./BossCharacter";

export default function CreateBossModal({ isOpen, onClose, category = "Shopping", lastMonthSpending = 5000, onSave }) {
  const [targetLimit, setTargetLimit] = useState(() => Math.round(lastMonthSpending * 0.7));

  if (!isOpen) return null;

  const personaName = getBossPersonaName(category);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetLimit || targetLimit <= 0) return;

    const newBoss = {
      id: `boss-${Date.now()}`,
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

    if (onSave) onSave(newBoss);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE3FA] relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center text-[#5B3F91]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-handwritten">Create Your Boss Battle</h2>
              <span className="text-xs font-bold text-[#5B3F91] uppercase tracking-wider">{category} Category</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Penny Coach Speech Bubble */}
          <div className="bg-[#FAF9FF] rounded-2xl p-4 border border-[#EAE3FA] flex items-start gap-3">
            <Image src="/friend.png" alt="Penny" width={28} height={28} className="w-7 h-7 object-contain shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700">
              <span className="font-bold text-[#5B3F91] block mb-0.5">Penny says:</span>
              <p className="italic">"Let me help you challenge CASHpaw! Set a spending target below last month."</p>
            </div>
          </div>

          {/* Last Month vs Limit Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
              <span>Last Month Spent</span>
              <span className="font-bold text-gray-900 text-sm">₹{lastMonthSpending.toLocaleString()}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Target Spending Limit (₹)</label>
              <input
                type="number"
                min="100"
                max={lastMonthSpending * 2}
                required
                value={targetLimit}
                onChange={(e) => setTargetLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] text-base font-extrabold text-gray-900"
              />
            </div>

            {/* Slider */}
            <input
              type="range"
              min={Math.round(lastMonthSpending * 0.3)}
              max={lastMonthSpending}
              step="100"
              value={targetLimit}
              onChange={(e) => setTargetLimit(Number(e.target.value))}
              className="w-full accent-[#5B3F91] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-semibold text-gray-400">
              <span>₹{Math.round(lastMonthSpending * 0.3).toLocaleString()}</span>
              <span className="text-[#5B3F91] font-extrabold">Target: ₹{targetLimit.toLocaleString()}</span>
              <span>₹{lastMonthSpending.toLocaleString()}</span>
            </div>
          </div>

          {/* BOSS PREVIEW BOX */}
          <div className="bg-gradient-to-b from-[#FAF9FF] to-purple-50/60 rounded-3xl p-5 border border-[#EAE3FA] text-center space-y-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#5B3F91]">
              ──────── BOSS PREVIEW ────────
            </span>

            <div className="w-24 h-24 mx-auto my-1 flex items-center justify-center">
              <Image
                src="/villain.png"
                alt={personaName}
                width={96}
                height={96}
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>

            <h3 className="text-xl font-black text-gray-900">{personaName}</h3>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="bg-white p-2 rounded-xl border border-[#EAE3FA]">
                <span className="text-gray-400 block text-[10px]">Target Budget</span>
                <span className="font-bold text-gray-900">₹{targetLimit.toLocaleString()}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#EAE3FA]">
                <span className="text-gray-400 block text-[10px]">Last Month</span>
                <span className="font-bold text-gray-900">₹{lastMonthSpending.toLocaleString()}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#EAE3FA]">
                <span className="text-gray-400 block text-[10px]">Reward</span>
                <span className="font-extrabold text-amber-600">⭐ 250 XP</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#5B3F91] hover:bg-[#4A3277] text-white font-extrabold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>Start Boss Battle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
