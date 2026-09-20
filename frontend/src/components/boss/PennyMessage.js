"use client";

import Image from "next/image";
import { Sparkles, Heart } from "lucide-react";

export function getPennyCoachAdvice(status, ratio) {
  if (status === "victory") {
    return "WE DID IT! You defeated CASHpaw and stayed under budget! Incredible discipline!";
  }
  if (status === "defeat" || ratio > 1) {
    return "CASHpaw won this round, but don't worry! You're still learning and improving!";
  }
  if (ratio >= 0.9) {
    return "Careful! We're getting super close to your target limit! Hold the line!";
  }
  if (ratio >= 0.75) {
    return "CASHpaw is getting nervous! Let's pause extra spending to stay safe.";
  }
  if (ratio >= 0.5) {
    return "You're doing great! Keep CASHpaw worried by keeping your spending low.";
  }
  return "Nice! Keep going! You're completely in control of your spending quest!";
}

export default function PennyMessage({ status, ratio }) {
  const advice = getPennyCoachAdvice(status, ratio);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE3FA] shadow-sm flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center shrink-0 p-1 overflow-hidden">
        <Image src="/friend.png" alt="Penny" width={40} height={40} className="w-full h-full object-contain" />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B3F91]">
          <Image src="/heart.png" alt="Heart" width={14} height={14} className="inline" />
          <span>Penny says...</span>
        </div>
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
          "{advice}"
        </p>
      </div>
    </div>
  );
}
