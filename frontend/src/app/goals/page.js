"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "../../../lib/db";
import { getVaultId } from "../../../lib/vault";
import { useLiveQuery } from "dexie-react-hooks";
import GoalCard from "@/components/goals/GoalCard";
import CreateGoalModal from "@/components/goals/CreateGoalModal";
import GoalCelebrationModal from "@/components/goals/GoalCelebrationModal";
import { createGoal, deleteGoal } from "../../../lib/goals";
import {
  Target,
  Plus,
  Flame,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Award
} from "lucide-react";

export default function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "active" | "completed"
  const [toastMessage, setToastMessage] = useState(null);
  const [celebrationGoal, setCelebrationGoal] = useState(null);
  const [celebrationType, setCelebrationType] = useState("created");
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const vaultId = typeof window !== "undefined" ? getVaultId() : "default_vault";

  // Live Query from Dexie DB
  const rawGoals = useLiveQuery(
    async () => {
      try {
        if (!db || !db.goals) return [];
        const items = await db.goals.toArray();
        return items.filter((item) => !item.vaultId || item.vaultId === vaultId);
      } catch {
        return [];
      }
    },
    [vaultId]
  );

  // Seed default sample goals if database is completely empty for demo
  useEffect(() => {
    async function seedInitialGoals() {
      try {
        if (!db || !db.goals) return;
        const count = await db.goals.count();
        if (count === 0) {
          const defaults = [
            {
              id: "1",
              vaultId,
              title: "New Laptop",
              description: "Saving up for a high performance laptop",
              category: "Purchase",
              targetAmount: 50000,
              savedAmount: 32500,
              targetDate: "2026-12-15",
              streak: 7,
              status: "active",
              createdAt: new Date().toISOString()
            },
            {
              id: "2",
              vaultId,
              title: "Goa Weekend Trip",
              description: "Beach vacation with friends",
              category: "Travel",
              targetAmount: 15000,
              savedAmount: 9000,
              targetDate: "2026-10-30",
              streak: 4,
              status: "active",
              createdAt: new Date().toISOString()
            },
            {
              id: "3",
              vaultId,
              title: "Emergency Fund",
              description: "Safety net for unexpected expenses",
              category: "Savings",
              targetAmount: 100000,
              savedAmount: 45000,
              targetDate: "2027-03-31",
              streak: 12,
              status: "active",
              createdAt: new Date().toISOString()
            }
          ];
          await db.goals.bulkAdd(defaults);
        }
      } catch (err) {
        console.error("Failed to seed initial goals:", err);
      }
    }
    seedInitialGoals();
  }, [vaultId]);

  const goals = rawGoals || [];

  // Filter goals
  const filteredGoals = goals.filter((g) => {
    const isCompleted = g.savedAmount >= g.targetAmount || g.status === "completed";
    if (activeTab === "active") return !isCompleted;
    if (activeTab === "completed") return isCompleted;
    return true;
  });

  // Calculate summary stats
  const totalSaved = goals.reduce((acc, g) => acc + (Number(g.savedAmount) || 0), 0);
  const totalTarget = goals.reduce((acc, g) => acc + (Number(g.targetAmount) || 0), 0);
  const activeGoalsCount = goals.filter(
    (g) => (Number(g.savedAmount) || 0) < (Number(g.targetAmount) || 1) && g.status !== "completed"
  ).length;
  const maxStreak = goals.reduce((acc, g) => Math.max(acc, g.streak || 0), 0);

  const handleSaveNewGoal = async (newGoalData) => {
    try {
      const created = await createGoal(newGoalData);
      setCelebrationGoal(created);
      setCelebrationType(created.status === "completed" ? "completed" : "created");
      setShowCelebrationModal(true);
    } catch (err) {
      console.error("Error saving goal:", err);
      setToastMessage(err.message || "Failed to create goal.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

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

          {/* Right spacer to keep nav items centered in the middle */}
          <div className="hidden md:block w-40" />
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-12 py-8 flex flex-col gap-8 flex-1">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-[#EAE3FA] text-[#8064C8] rounded-2xl flex items-center justify-center border border-[#C9B9F2]">
                <Target className="w-6 h-6" />
              </div>
              <h1 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91]">
                My Goals
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#5B3F91]/80 font-medium">
              Turn your plans into money quests.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="py-3 px-6 bg-[#5B3F91] hover:bg-[#4A3277] text-white font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Goal</span>
          </button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#EAE3FA] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center text-[#5B3F91]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Total Saved</span>
                <p className="text-xl font-black text-gray-900">
                  ₹{totalSaved.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    / ₹{totalTarget.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#EAE3FA] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center text-[#5B3F91]">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Active Quests</span>
                <p className="text-xl font-black text-gray-900">{activeGoalsCount} Goals</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#EAE3FA] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Longest Savings Streak</span>
                <p className="text-xl font-black text-amber-700">{maxStreak} Days</p>
              </div>
            </div>
          </div>
        )}

        {/* TABS & FILTER BAR */}
        <div className="flex items-center justify-between border-b border-[#EAE3FA] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "all"
                  ? "bg-[#5B3F91] text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-[#FAF9FF] border border-gray-200"
              }`}
            >
              All Goals ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "active"
                  ? "bg-[#5B3F91] text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-[#FAF9FF] border border-gray-200"
              }`}
            >
              Active ({activeGoalsCount})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "completed"
                  ? "bg-[#5B3F91] text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-[#FAF9FF] border border-gray-200"
              }`}
            >
              Completed ({goals.length - activeGoalsCount})
            </button>
          </div>
        </div>

        {/* GOALS GRID / EMPTY STATE */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 border border-[#EAE3FA] text-center flex flex-col items-center justify-center my-8 shadow-sm">
            <div className="w-24 h-24 relative mb-4">
              <video
                src="/hugging_coin.webm"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-handwritten mb-2">
              No money quests found!
            </h2>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              {activeTab === "completed"
                ? "You haven't completed any goals yet. Keep saving to hit your targets!"
                : "Create your first savings goal to track your progress and build your streak."}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-3 px-6 bg-[#5B3F91] hover:bg-[#4A3277] text-white font-bold rounded-2xl shadow-md transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Create Goal</span>
            </button>
          </div>
        )}
      </main>

      {/* CREATE GOAL MODAL */}
      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNewGoal}
      />

      {/* PENNY GOAL CELEBRATION MODAL */}
      <GoalCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        goal={celebrationGoal}
        type={celebrationType}
      />
    </div>
  );
}
