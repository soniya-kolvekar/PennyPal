"use client";

import Link from "next/link";
import { 
  Laptop, 
  Plane, 
  GraduationCap, 
  TrendingUp, 
  Sparkles, 
  Flame, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export function getGoalCategoryIcon(category) {
  switch (category) {
    case "Purchase":
      return Laptop;
    case "Travel":
      return Plane;
    case "Education":
      return GraduationCap;
    case "Savings":
      return TrendingUp;
    case "Other":
    default:
      return Sparkles;
  }
}

export default function GoalCard({ goal }) {
  const IconComponent = getGoalCategoryIcon(goal.category);
  const target = Number(goal.targetAmount) || 1;
  const saved = Number(goal.savedAmount) || 0;
  const remaining = Math.max(0, target - saved);
  const progress = Math.min(100, Math.round((saved / target) * 100));
  const isCompleted = progress >= 100 || goal.status === "completed";

  // Calculate days remaining
  let daysLeft = 0;
  if (goal.targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetD = new Date(goal.targetDate);
    targetD.setHours(0, 0, 0, 0);
    const diffTime = targetD - today;
    daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#EAE3FA] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center text-[#5B3F91]">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">{goal.title}</h3>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#FAF9FF] text-[#5B3F91] border border-[#EAE3FA]">
                {goal.category || "General"}
              </span>
            </div>
          </div>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Done
            </span>
          )}
        </div>

        {/* Progress Display */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-bold text-gray-900 text-lg">₹{saved.toLocaleString()}</span>
            <span className="text-gray-500 font-medium">/ ₹{target.toLocaleString()}</span>
          </div>

          <div className="w-full bg-[#FAF9FF] rounded-full h-3 border border-[#EAE3FA] overflow-hidden p-0.5">
            <div
              className="bg-[#5B3F91] h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 font-medium pt-1">
            <span>{isCompleted ? "Target Achieved!" : `₹${remaining.toLocaleString()} remaining`}</span>
            <span className="font-semibold text-[#5B3F91]">{progress}%</span>
          </div>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-5">
          {!isCompleted && (
            <div className="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 font-medium">
              {daysLeft > 0 ? `${daysLeft} days left` : "Due today"}
            </div>
          )}
          {goal.streak > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {goal.streak} day saving streak
            </div>
          )}
        </div>
      </div>

      {/* Footer Link */}
      <Link
        href={`/goals/${goal.id}`}
        className="w-full py-2.5 px-4 bg-[#FAF9FF] hover:bg-[#EAE3FA] border border-[#EAE3FA] rounded-xl text-[#5B3F91] font-semibold text-sm flex items-center justify-center gap-2 transition-colors group"
      >
        <span>View Goal</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
