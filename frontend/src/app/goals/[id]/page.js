"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "../../../../lib/db";
import { getVaultId } from "../../../../lib/vault";
import { updateGoalProgress, deleteGoal, fetchGoalAdvice } from "../../../../lib/goals";
import { useLiveQuery } from "dexie-react-hooks";
import GoalProgress from "@/components/goals/GoalProgress";
import GoalRoadmap from "@/components/goals/GoalRoadmap";
import MilestoneCard from "@/components/goals/MilestoneCard";
import GoalCelebrationModal from "@/components/goals/GoalCelebrationModal";
import PennyLoader from "@/components/PennyLoader";
import {
  ArrowLeft,
  Flame,
  Sparkles,
  Trophy,
  Plus,
  Heart,
  CheckCircle2,
  Trash2,
  Loader2
} from "lucide-react";

export default function GoalDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const goalId = params?.id;

  const router = useRouter();
  const [addAmountInput, setAddAmountInput] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationType, setCelebrationType] = useState("completed");
  const [pennyAdvice, setPennyAdvice] = useState("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const vaultId = typeof window !== "undefined" ? getVaultId() : "default_vault";

  // Fetch single goal live from Dexie DB
  const goal = useLiveQuery(
    async () => {
      if (!db || !db.goals || !goalId) return null;
      const found = await db.goals.get(goalId);
      if (found) return found;
      // Fallback search in array
      const all = await db.goals.toArray();
      return all.find((g) => g.id === goalId) || null;
    },
    [goalId]
  );

  // Fetch dynamic AI coaching advice from Penny whenever goal loads or progress updates
  useEffect(() => {
    let isMounted = true;
    if (goal) {
      setIsLoadingAdvice(true);
      fetchGoalAdvice(goal)
        .then((adviceText) => {
          if (isMounted && adviceText) {
            setPennyAdvice(adviceText);
          }
        })
        .catch((err) => {
          console.warn("Could not load goal advice:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingAdvice(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [goal?.id, goal?.savedAmount]);

  const handleAddSavings = async (amount) => {
    const num = Number(amount);
    if (!num || num <= 0 || !goal) return;

    const newSaved = (Number(goal.savedAmount) || 0) + num;
    const target = Number(goal.targetAmount) || 1;
    const isNowCompleted = newSaved >= target;

    try {
      await updateGoalProgress(goal.id, {
        savedAmount: newSaved,
        streak: (goal.streak || 0) + 1,
        status: isNowCompleted ? "completed" : goal.status || "active"
      });

      setToastMessage(`Added ₹${num.toLocaleString("en-IN")} to ${goal.title}!`);
      setTimeout(() => setToastMessage(null), 3000);
      setShowAddModal(false);
      setAddAmountInput("");

      if (isNowCompleted) {
        setCelebrationType("completed");
        setShowCelebrationModal(true);
      }
    } catch (err) {
      console.error("Failed to update savings in Dexie:", err);
    }
  };

  const handleDeleteGoal = async () => {
    if (!confirm(`Are you sure you want to delete "${goal?.title}"?`)) return;
    try {
      setIsDeleting(true);
      await deleteGoal(goal.id);
      router.push("/goals");
    } catch (err) {
      alert("Failed to delete goal: " + err.message);
      setIsDeleting(false);
    }
  };

  if (goal === undefined) {
    return <PennyLoader message="Loading your money quest..." />;
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans">
        <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF9FF]/90 border-b border-[#EAE3FA]/80 px-6 sm:px-12 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logoo.png"
                alt="PennyPal Logo"
                width={160}
                height={50}
                style={{ width: "auto", height: "auto" }}
                className="h-9 sm:h-10 object-contain"
                priority
              />
            </Link>
          </div>
        </nav>

        <main className="max-w-4xl w-full mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold font-handwritten mb-4">Goal not found</h2>
          <p className="text-gray-500 mb-6">The requested money quest does not exist.</p>
          <Link
            href="/goals"
            className="px-6 py-3 bg-[#5B3F91] text-white font-bold rounded-2xl shadow-md inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Goals</span>
          </Link>
        </main>
      </div>
    );
  }

  const target = Number(goal.targetAmount) || 1;
  const saved = Number(goal.savedAmount) || 0;
  const isCompleted = saved >= target || goal.status === "completed";

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Soft Background Lavender & Pink Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />
      <div className="absolute top-2/3 left-0 w-[450px] h-[450px] bg-[#F6C9D5] rounded-full blur-3xl opacity-30 pointer-events-none -translate-x-1/3" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#5B3F91] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF9FF]/90 border-b border-[#EAE3FA]/80 px-6 sm:px-12 py-2 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logoo.png"
              alt="PennyPal Logo"
              width={160}
              height={50}
              style={{ width: "auto", height: "auto" }}
              className="h-9 sm:h-10 object-contain"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-base font-bold text-[#5B3F91]">
            <Link href="/" className="hover:text-[#8064C8] transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="hover:text-[#8064C8] transition-colors">
              Dashboard
            </Link>
            <Link href="/calendar" className="hover:text-[#8064C8] transition-colors">
              Calendar
            </Link>
            <Link href="/goals" className="text-[#8064C8] transition-colors font-extrabold">
              Goals
            </Link>
            <Link href="/upload" className="hover:text-[#8064C8] transition-colors">
              Upload
            </Link>
            <Link href="/settings" className="hover:text-[#8064C8] transition-colors">
              Settings
            </Link>
            <Link href="/chat" className="hover:text-[#8064C8] transition-colors">
              Chat
            </Link>
          </div>

          <Link
            href="/goals"
            className="px-4 py-2 bg-white border border-[#EAE3FA] text-[#5B3F91] hover:bg-[#FAF9FF] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Goals</span>
          </Link>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-6 sm:px-12 py-8 flex flex-col gap-8 flex-1">
        {/* Navigation Breadcrumb & Delete Action */}
        <div className="flex items-center justify-between w-full">
          <Link
            href="/goals"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5B3F91] hover:text-[#8064C8] transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#EAE3FA]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Goals</span>
          </Link>

          <button
            type="button"
            onClick={handleDeleteGoal}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors disabled:opacity-50"
            title="Delete this goal"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete Goal"}</span>
          </button>
        </div>

        {/* 100% Celebration Screen Banner if Completed */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-400">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0">
                <Trophy className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                  100% Completed
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">Goal Completed! You did it!</h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                  You successfully saved ₹{target.toLocaleString()} for {goal.title}!
                </p>
              </div>
            </div>
            <Link
              href="/goals"
              className="py-3 px-6 bg-white text-emerald-800 font-extrabold rounded-2xl shadow-md hover:bg-emerald-50 transition-colors text-sm shrink-0"
            >
              Start Next Quest
            </Link>
          </div>
        )}

        {/* Hero Progress Card */}
        <GoalProgress goal={goal} onAddSavings={() => setShowAddModal(true)} />

        {/* Milestone Card */}
        <MilestoneCard goal={goal} onAddSavings={handleAddSavings} />

        {/* Grid: Roadmap Timeline & Penny Motivation / Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Savings Roadmap */}
          <div className="lg:col-span-2">
            <GoalRoadmap targetAmount={target} savedAmount={saved} />
          </div>

          {/* Right 1 Col: Penny Motivation & 7-Day Saving Streak */}
          <div className="space-y-6">
            {/* 7-Day Saving Streak Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#EAE3FA] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                  <Flame className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-handwritten">Saving Streak</h3>
                  <p className="text-xs text-amber-700 font-semibold">
                    {goal.streak || 0} Day Saving Streak!
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Consistency is key! Adding money or recording no-spend days builds your streak multiplier.
              </p>
            </div>

            {/* Penny Motivation Video Card with Dynamic AI Advice */}
            <div className="bg-gradient-to-br from-[#FAF9FF] to-[#EAE3FA]/50 rounded-3xl p-6 border border-[#EAE3FA] shadow-sm text-center">
              <div className="w-28 h-28 mx-auto relative mb-3">
                <video
                  src="/hugging_coin.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#5B3F91] bg-white px-3 py-1 rounded-full border border-[#EAE3FA] mb-2 shadow-2xs">
                <Image src="/heart.png" alt="Heart" width={14} height={14} className="inline" />
                <span>Penny&apos;s AI Advice</span>
              </div>
              {isLoadingAdvice && !pennyAdvice ? (
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-[#8064C8] font-semibold animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Penny is writing tailored advice...</span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#5B3F91] font-medium leading-relaxed">
                  {pennyAdvice || `"You're doing fantastic on your ${goal.title} quest! Every small deposit brings you closer to your dream."`}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Savings Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE3FA]">
            <h3 className="text-xl font-bold text-gray-900 font-handwritten mb-2">Add Savings</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter amount to deposit into <span className="font-semibold text-[#5B3F91]">{goal.title}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={addAmountInput}
                  onChange={(e) => setAddAmountInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] text-base text-gray-900 font-bold"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmountInput(amt.toString())}
                    className="flex-1 py-2 bg-[#FAF9FF] border border-[#EAE3FA] text-[#5B3F91] hover:bg-[#EAE3FA] rounded-xl text-xs font-bold transition-colors"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSavings(addAmountInput)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#5B3F91] hover:bg-[#4A3277] text-white font-bold text-sm shadow-md"
                >
                  Confirm Deposit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PENNY GOAL CELEBRATION MODAL */}
      <GoalCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        goal={goal}
        type={celebrationType}
      />
    </div>
  );
}
