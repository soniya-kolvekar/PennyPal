"use client";

import { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import { db } from "../../../../lib/db";
import { getVaultId } from "../../../../lib/vault";
import { useLiveQuery } from "dexie-react-hooks";
import CreateBossModal from "@/components/boss/CreateBossModal";
import BossCard from "@/components/boss/BossCard";
import PennyLoader from "@/components/PennyLoader";
import {
  ArrowLeft,
  Swords,
  ShoppingBag,
  TrendingDown,
  Calendar,
  Sparkles,
  Utensils,
  Car,
  Tv,
  Zap,
  Activity,
  GraduationCap,
  Home,
  Plane,
  User,
  Wallet
} from "lucide-react";

import { calculateLastMonthSpending } from "../../../../lib/boss";

export function getCategoryIcon(category) {
  switch (category) {
    case "Food":
      return Utensils;
    case "Shopping":
      return ShoppingBag;
    case "Transport":
      return Car;
    case "Subscriptions":
      return Tv;
    case "Bills":
      return Zap;
    case "Healthcare":
      return Activity;
    case "Education":
      return GraduationCap;
    case "Rent":
      return Home;
    case "Travel":
      return Plane;
    case "Personal":
      return User;
    default:
      return Wallet;
  }
}

export default function CategoryDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const categoryId = decodeURIComponent(params?.categoryId || "Shopping");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const vaultId = typeof window !== "undefined" ? getVaultId() : "default_vault";

  // Live Query transactions for this category
  const transactions = useLiveQuery(
    async () => {
      try {
        if (!db || !db.transactions) return [];
        const items = await db.transactions.toArray();
        return items.filter(
          (t) => (!t.vaultId || t.vaultId === vaultId) && (t.category === categoryId || categoryId === "All")
        );
      } catch {
        return [];
      }
    },
    [categoryId, vaultId]
  );

  // Live Query bosses for this category
  const existingBoss = useLiveQuery(
    async () => {
      try {
        if (!db || !db.bosses) return null;
        const items = await db.bosses.toArray();
        return items.find((b) => (!b.vaultId || b.vaultId === vaultId) && b.category === categoryId && b.status === "active") || null;
      } catch {
        return null;
      }
    },
    [categoryId, vaultId]
  );

  // Initial seed demo boss for Shopping category if empty
  useEffect(() => {
    async function seedDemoBoss() {
      try {
        if (!db || !db.bosses) return;
        const count = await db.bosses.count();
        if (count === 0) {
          await db.bosses.add({
            id: "boss-shopping-1",
            vaultId,
            name: "CASHpaw Shopzilla",
            category: "Shopping",
            targetLimit: 3000,
            spentAmount: 1850,
            lastMonthSpending: 5000,
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: "active",
            rewardXP: 250,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Failed to seed demo boss:", err);
      }
    }
    seedDemoBoss();
  }, [vaultId]);

  if (transactions === undefined) {
    return <PennyLoader message="Loading category details..." />;
  }

  const txList = transactions || [];
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthSpent = txList
    .filter((t) => t.type !== "income" && t.status !== "deleted" && t.date && t.date.startsWith(currentMonthPrefix))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const lastMonthSpent = calculateLastMonthSpending(categoryId, txList);

  const IconComp = getCategoryIcon(categoryId);

  const handleSaveBoss = async (newBoss) => {
    try {
      await db.bosses.add({ ...newBoss, vaultId });
      setToastMessage(`Boss ${newBoss.name} created!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save boss:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Soft Background Lavender & Pink Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#5B3F91] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* NAVBAR */}
      <AppNavbar />

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-6 sm:px-12 py-8 flex flex-col gap-8 flex-1">
        {/* Navigation Link */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5B3F91] hover:text-[#8064C8] transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#EAE3FA]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3FA] shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center text-[#5B3F91]">
              <IconComp className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF9FF] text-[#5B3F91] border border-[#EAE3FA]">
                Category Details
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{categoryId}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#FAF9FF] p-4 rounded-2xl border border-[#EAE3FA]">
            <div>
              <span className="text-xs text-gray-500 font-semibold block">This Month</span>
              <span className="text-xl font-extrabold text-gray-900">₹{thisMonthSpent.toLocaleString()}</span>
            </div>
            <div className="h-8 w-[1px] bg-[#EAE3FA]" />
            <div>
              <span className="text-xs text-gray-500 font-semibold block">Last Month</span>
              <span className="text-xl font-extrabold text-gray-400">₹{lastMonthSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* BOSS SECTION */}
        {existingBoss ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#5B3F91]" />
              <h2 className="text-xl font-extrabold text-gray-900 font-handwritten">ACTIVE BATTLE</h2>
            </div>
            <BossCard boss={existingBoss} transactions={transactions || []} />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3FA] shadow-sm text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center p-2 overflow-hidden">
              <Image src="/friend.png" alt="Penny" width={50} height={50} className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-handwritten">
                Want to challenge yourself?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mt-1">
                Create a <span className="font-bold text-[#5B3F91]">{categoryId} Boss</span> and set your own spending limit to defeat CASHpaw!
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-3 px-6 bg-[#5B3F91] hover:bg-[#4A3277] text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm hover:scale-105"
            >
              <Swords className="w-5 h-5" />
              <span>Create Boss</span>
            </button>
          </div>
        )}

        {/* Category Transactions List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3FA] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 font-handwritten mb-4">
            {categoryId} Transactions ({txList.length})
          </h3>

          {txList.length > 0 ? (
            <div className="space-y-2.5">
              {txList.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-between text-xs sm:text-sm font-semibold"
                >
                  <div>
                    <h4 className="font-bold text-gray-900">{tx.merchant || tx.desc || "Expense"}</h4>
                    <span className="text-[11px] text-gray-500">{tx.date}</span>
                  </div>
                  <span className="font-extrabold text-[#5B3F91]">
                    ₹{Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-medium text-center py-6">
              No transactions recorded under {categoryId} yet.
            </p>
          )}
        </div>
      </main>

      {/* CREATE BOSS MODAL */}
      <CreateBossModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={categoryId}
        lastMonthSpending={lastMonthSpent}
        onSave={handleSaveBoss}
      />
    </div>
  );
}
