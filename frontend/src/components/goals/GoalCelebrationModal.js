"use client";

import { X, Sparkles, Trophy, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function GoalCelebrationModal({ isOpen, onClose, goal, type = "created" }) {
  if (!isOpen || !goal) return null;

  const isCompletedType = type === "completed";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE3FA] relative text-center animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Penny Video Companion Header */}
        <div className="w-28 h-28 mx-auto relative mb-3">
          <video
            src={isCompletedType ? "/landingpenguin.webm" : "/hugging_coin.webm"}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold mb-3 border shadow-xs bg-amber-50 text-amber-700 border-amber-200">
          {isCompletedType ? (
            <>
              <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>QUEST MASTERED!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>QUEST ACTIVATED!</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 font-handwritten mb-2">
          {isCompletedType ? `Goal "${goal.title}" Completed!` : `Quest "${goal.title}" Begun!`}
        </h2>

        {/* Message */}
        <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
          {isCompletedType
            ? `Penny is super proud of you! You successfully saved ₹${Number(goal.targetAmount).toLocaleString()}!`
            : `Penny is cheering for you! Your target of ₹${Number(goal.targetAmount).toLocaleString()} is now set.`}
        </p>

        {/* Rewards Card */}
        <div className="bg-[#FAF9FF] rounded-2xl p-4 border border-[#EAE3FA] mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5B3F91]">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{isCompletedType ? "Victory Bonus" : "Quest Reward"}</span>
          </div>
          <span className="text-sm font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-xl">
            {isCompletedType ? "+1,000 XP" : "+50 XP"}
          </span>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-[#5B3F91] hover:bg-[#4A3277] text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm hover:scale-105"
        >
          <span>{isCompletedType ? "Celebrate Victory!" : "Let's Start Saving!"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
