"use client";

import Link from "next/link";
import Image from "next/image";
import { getBossPersonaName, getBossStateMeta } from "./BossCharacter";
import { computeBossSpent } from "../../../lib/boss";
import { ArrowRight, Trophy, Flame, Swords, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function BossCard({ boss, transactions = [] }) {
  const target = Number(boss?.targetLimit) || 1;
  const spent = transactions.length > 0
    ? computeBossSpent(boss, transactions)
    : (Number(boss?.spentAmount) || 0);
  const remaining = target - spent;
  const progress = Math.min(100, Math.round((spent / target) * 100));
  const isVictory = boss?.status === "victory";
  const isDefeat = boss?.status === "defeat" || spent > target;

  const personaName = getBossPersonaName(boss.category);
  const meta = getBossStateMeta(boss.status, spent / target);

  // Days left calculation
  let daysLeft = 0;
  if (boss.endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endD = new Date(boss.endDate);
    endD.setHours(0, 0, 0, 0);
    const diffTime = endD - today;
    daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EAE3FA] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center p-1 overflow-hidden">
              <Image
                src="/villain.png"
                alt={personaName}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 leading-snug">{personaName}</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF9FF] text-[#5B3F91] border border-[#EAE3FA]">
                {boss.category} Battle
              </span>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full border ${meta.badgeBg}`}>
            {isVictory ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : isDefeat ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <Swords className="w-3.5 h-3.5 text-[#5B3F91]" />
            )}
            <span>{isVictory ? "DEFEATED" : isDefeat ? "SURVIVED" : "ACTIVE"}</span>
          </span>
        </div>

        {/* Progress Display */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-extrabold text-gray-900 text-lg">₹{spent.toLocaleString()}</span>
            <span className="text-gray-500 font-semibold">/ ₹{target.toLocaleString()} limit</span>
          </div>

          <div className="w-full bg-[#FAF9FF] rounded-full h-3 border border-[#EAE3FA] overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isVictory
                  ? "bg-emerald-500"
                  : isDefeat
                  ? "bg-rose-500"
                  : "bg-[#5B3F91]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs font-bold pt-1">
            <span className={isDefeat ? "text-rose-600" : "text-gray-500"}>
              {isDefeat
                ? `₹${Math.abs(remaining).toLocaleString()} Over Target`
                : isVictory
                ? "Beat Target!"
                : `₹${remaining.toLocaleString()} remaining`}
            </span>
            <span className="text-[#5B3F91]">{progress}%</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 mb-5">
          {!isVictory && !isDefeat && (
            <div className="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              {daysLeft > 0 ? `${daysLeft} days left` : "Final Day"}
            </div>
          )}
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>+250 XP Reward</span>
          </div>
        </div>
      </div>

      <Link
        href={`/boss/${boss.id}`}
        className="w-full py-2.5 px-4 bg-[#FAF9FF] hover:bg-[#EAE3FA] border border-[#EAE3FA] rounded-xl text-[#5B3F91] font-bold text-sm flex items-center justify-center gap-2 transition-colors group"
      >
        <span>Continue Battle</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
