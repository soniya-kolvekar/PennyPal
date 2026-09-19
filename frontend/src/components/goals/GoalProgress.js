"use client";

import { getGoalCategoryIcon } from "./GoalCard";
import { Flame, Calendar, Clock, TrendingUp, Plus, CheckCircle2 } from "lucide-react";

export default function GoalProgress({ goal, onAddSavings }) {
  const IconComponent = getGoalCategoryIcon(goal.category);
  const target = Number(goal.targetAmount) || 1;
  const saved = Number(goal.savedAmount) || 0;
  const remaining = Math.max(0, target - saved);
  const progress = Math.min(100, Math.round((saved / target) * 100));
  const isCompleted = progress >= 100 || goal.status === "completed";

  let daysLeft = 1;
  if (goal.targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetD = new Date(goal.targetDate);
    targetD.setHours(0, 0, 0, 0);
    const diffTime = targetD - today;
    daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const requiredPerDay = remaining > 0 ? Math.round(remaining / daysLeft) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3FA] shadow-sm">
      {/* Top Category & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center text-[#5B3F91]">
            <IconComponent className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF9FF] text-[#5B3F91] border border-[#EAE3FA]">
                {goal.category || "General"}
              </span>
              {goal.streak > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {goal.streak} Day Streak
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{goal.title}</h1>
          </div>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" /> Goal Completed!
          </div>
        ) : (
          <button
            onClick={() => onAddSavings && onAddSavings(1000)}
            className="py-2.5 px-5 bg-[#5B3F91] hover:bg-[#4A3277] text-white rounded-xl font-semibold text-sm shadow-md transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add ₹1,000</span>
          </button>
        )}
      </div>

      {/* Main Amounts and Progress Bar */}
      <div className="space-y-3 mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              ₹{saved.toLocaleString()}
            </span>
            <span className="text-base text-gray-500 font-semibold">
              of ₹{target.toLocaleString()} saved
            </span>
          </div>
          <span className="text-2xl font-black text-[#5B3F91]">{progress}%</span>
        </div>

        <div className="w-full bg-[#FAF9FF] rounded-full h-4 border border-[#EAE3FA] overflow-hidden p-1">
          <div
            className="bg-gradient-to-r from-[#8064C8] to-[#5B3F91] h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="bg-[#FAF9FF] p-4 rounded-2xl border border-[#EAE3FA]">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <TrendingUp className="w-4 h-4 text-[#5B3F91]" />
            <span>Remaining Target</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {isCompleted ? "₹0" : `₹${remaining.toLocaleString()}`}
          </p>
        </div>

        <div className="bg-[#FAF9FF] p-4 rounded-2xl border border-[#EAE3FA]">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Clock className="w-4 h-4 text-[#5B3F91]" />
            <span>Time Remaining</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {isCompleted ? "Achieved!" : `${daysLeft} days left`}
          </p>
        </div>

        <div className="bg-[#FAF9FF] p-4 rounded-2xl border border-[#EAE3FA]">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Calendar className="w-4 h-4 text-[#5B3F91]" />
            <span>Daily Savings Needed</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {isCompleted ? "₹0 / day" : `₹${requiredPerDay.toLocaleString()} / day`}
          </p>
        </div>
      </div>
    </div>
  );
}
