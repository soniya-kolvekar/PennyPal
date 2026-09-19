"use client";

import { CheckCircle2, Circle, Radio, Trophy, Rocket } from "lucide-react";

export default function GoalRoadmap({ targetAmount = 50000, savedAmount = 0 }) {
  const target = Math.max(1, Number(targetAmount));
  const saved = Number(savedAmount);

  // Generate 4-5 milestone steps (e.g., 20%, 40%, 60%, 80%, 100%)
  const steps = [0.2, 0.4, 0.6, 0.8, 1.0].map((ratio) => {
    const amount = Math.round(target * ratio);
    let state = "future"; // "completed" | "current" | "future"

    if (saved >= amount) {
      state = "completed";
    }
    return {
      ratio,
      amount,
      percentage: Math.round(ratio * 100),
      state
    };
  });

  // Mark the first uncompleted step as "current"
  let currentFound = false;
  const milestones = steps.map((step) => {
    if (step.state === "completed") return step;
    if (!currentFound) {
      currentFound = true;
      return { ...step, state: "current" };
    }
    return step;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3FA] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center text-[#5B3F91]">
          <Rocket className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-handwritten">Savings Roadmap</h2>
          <p className="text-xs text-gray-500">Track your milestone journey</p>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EAE3FA]">
        {/* Start Node */}
        <div className="relative flex items-center gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-[#5B3F91] text-white flex items-center justify-center ring-4 ring-white text-xs font-bold">
            0
          </div>
          <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#EAE3FA] flex-1 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-[#5B3F91]">START</span>
              <p className="text-sm font-semibold text-gray-900">Journey Began (₹0)</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#5B3F91]" />
          </div>
        </div>

        {/* Dynamic Milestones */}
        {milestones.map((m, idx) => {
          const isCompleted = m.state === "completed";
          const isCurrent = m.state === "current";

          return (
            <div key={idx} className="relative flex items-center gap-4">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                  isCompleted
                    ? "bg-[#5B3F91] text-white"
                    : isCurrent
                    ? "bg-[#8064C8] text-white ring-purple-100 animate-pulse"
                    : "bg-gray-100 text-gray-400 border border-gray-300"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Radio className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>

              {/* Milestone Box */}
              <div
                className={`p-4 rounded-2xl border flex-1 flex items-center justify-between transition-all ${
                  isCompleted
                    ? "bg-[#FAF9FF] border-[#EAE3FA]"
                    : isCurrent
                    ? "bg-purple-50/70 border-[#8064C8] shadow-sm"
                    : "bg-white border-gray-100 opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? "bg-[#5B3F91] text-white"
                          : isCurrent
                          ? "bg-[#8064C8] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {m.percentage}% Milestone
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B3F91] bg-purple-100 px-2 py-0.5 rounded-full">
                        Next Goal
                      </span>
                    )}
                  </div>
                  <p className="text-base font-bold text-gray-900 mt-1">
                    ₹{m.amount.toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  {isCompleted ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Reached ✓
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-500">
                      ₹{Math.max(0, m.amount - saved).toLocaleString()} to go
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Final Goal Trophy Node */}
        <div className="relative flex items-center gap-4">
          <div
            className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${
              saved >= target
                ? "bg-emerald-600 text-white ring-emerald-100"
                : "bg-amber-100 text-amber-600 border border-amber-300"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div
            className={`p-4 rounded-2xl border flex-1 flex items-center justify-between ${
              saved >= target
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50/50 border-amber-200 text-amber-900"
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wide">Final Target</span>
              <p className="text-base font-extrabold">₹{target.toLocaleString()}</p>
            </div>
            {saved >= target && (
              <span className="text-xs font-extrabold px-3 py-1 bg-emerald-600 text-white rounded-full">
                VICTORY!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
