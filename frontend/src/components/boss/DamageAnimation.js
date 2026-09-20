"use client";

import { ShoppingBag, Zap, ArrowDownRight } from "lucide-react";

export default function DamageAnimation({ transactions = [], activeDamage = null }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE3FA] shadow-sm relative overflow-hidden">
      {/* Active Floating Damage FX Overlay */}
      {activeDamage && (
        <div className="absolute top-4 right-6 z-20 animate-in fade-in zoom-in slide-in-from-bottom-3 duration-300">
          <div className="bg-rose-600 text-white font-black px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-base animate-bounce">
            <span>💥 -₹{Number(activeDamage.amount).toLocaleString()}</span>
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded-lg">{activeDamage.merchant}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h3 className="text-lg font-bold text-gray-900 font-handwritten">Recent Damage Log</h3>
        </div>
        <span className="text-xs font-semibold text-gray-500">
          {transactions.length} Purchases Recorded
        </span>
      </div>

      {transactions.length > 0 ? (
        <div className="space-y-2.5">
          {transactions.slice(0, 5).map((tx, idx) => (
            <div
              key={tx.id || idx}
              className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-between text-xs sm:text-sm font-semibold transition-all hover:border-[#C9B9F2]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE3FA] flex items-center justify-center text-rose-500 font-bold shrink-0">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{tx.merchant || tx.desc || "Expense"}</h4>
                  <span className="text-[11px] font-normal text-gray-500">
                    {tx.date || "Today"} • {tx.category || "Shopping"}
                  </span>
                </div>
              </div>

              <span className="font-black text-rose-600 text-base">
                -₹{Number(tx.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-gray-400 font-medium">
          No recent spending damage recorded yet! Keep it up!
        </div>
      )}
    </div>
  );
}
