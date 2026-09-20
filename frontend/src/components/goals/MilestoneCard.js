"use client";

import { Trophy, Award, ArrowUpRight, Zap } from "lucide-react";

export default function MilestoneCard({ goal, onAddSavings }) {
  const target = Number(goal.targetAmount) || 1;
  const saved = Number(goal.savedAmount) || 0;

  // Find next milestone (20%, 40%, 60%, 80%, 100%)
  const steps = [0.2, 0.4, 0.6, 0.8, 1.0].map((r) => Math.round(target * r));
  const nextMilestone = steps.find((m) => m > saved) || target;
  const remainingToMilestone = Math.max(0, nextMilestone - saved);
  const milestoneProgress = Math.min(100, Math.round((saved / nextMilestone) * 100));

  if (saved >= target) {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-6 shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Goal Mastered!
            </span>
          </div>
          <h3 className="text-xl font-black">All Milestones Achieved!</h3>
          <p className="text-xs text-emerald-100">You completed 100% of this money quest.</p>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-center border border-white/30">
          <span className="text-xs font-semibold block text-emerald-100">Bonus XP</span>
          <span className="text-lg font-black text-amber-300">+1,000 XP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#5B3F91] to-[#8064C8] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
      {/* Background Decorative Circle */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
              Next Milestone Target
            </span>
            <h3 className="text-xl font-bold">₹{nextMilestone.toLocaleString()}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold">
          <Zap className="w-3.5 h-3.5 fill-amber-300" />
          <span>+250 XP Reward</span>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex justify-between text-xs text-purple-200 font-medium">
          <span>₹{remainingToMilestone.toLocaleString()} needed to unlock</span>
          <span>{milestoneProgress}%</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden p-0.5">
          <div
            className="bg-amber-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${milestoneProgress}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => onAddSavings && onAddSavings(remainingToMilestone)}
        className="w-full py-2.5 px-4 bg-white text-[#5B3F91] hover:bg-purple-50 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
      >
        <span>Add ₹{remainingToMilestone.toLocaleString()} to complete milestone</span>
        <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  );
}
