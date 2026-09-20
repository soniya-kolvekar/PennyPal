"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import AppNavbar from "../../components/AppNavbar";
import { db } from "../../../lib/db";
import { getVaultId } from "../../../lib/vault";
import { useLiveQuery } from "dexie-react-hooks";
import {
  PieChart,
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Tv,
  Gamepad2,
  Activity,
  GraduationCap,
  Home,
  Plane,
  User,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  UploadCloud,
  Scale,
  Swords,
  Trophy,
  ArrowRight
} from "lucide-react";
import { computeBossSpent } from "../../../lib/boss";

// The 12 Canonical Backend Categories
const CANONICAL_CATEGORIES = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Subscriptions",
  "Entertainment",
  "Healthcare",
  "Education",
  "Rent",
  "Travel",
  "Personal",
  "Other"
];

// Category Icon & Color Mapping
function getCategoryMeta(category) {
  switch (category) {
    case "Food":
      return { icon: Utensils, bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" };
    case "Shopping":
      return { icon: ShoppingBag, bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" };
    case "Transport":
      return { icon: Car, bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" };
    case "Bills":
      return { icon: Zap, bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200" };
    case "Subscriptions":
      return { icon: Tv, bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-200" };
    case "Entertainment":
      return { icon: Gamepad2, bg: "bg-pink-100", text: "text-pink-600", border: "border-pink-200" };
    case "Healthcare":
      return { icon: Activity, bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200" };
    case "Education":
      return { icon: GraduationCap, bg: "bg-cyan-100", text: "text-cyan-600", border: "border-cyan-200" };
    case "Rent":
      return { icon: Home, bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-200" };
    case "Travel":
      return { icon: Plane, bg: "bg-sky-100", text: "text-sky-600", border: "border-sky-200" };
    case "Personal":
      return { icon: User, bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-200" };
    case "Other":
    default:
      return { icon: Wallet, bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
  }
}

export default function DashboardPage() {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Month navigation state (defaults to current month)
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNameYear = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  // Calculate start and end strings for the selected month
  const startStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endStr = `${year}-${String(month + 1).padStart(2, "0")}-31`;

  // Fetch live active & reconciled transactions from Dexie scoped to user vault
  const liveTransactions = useLiveQuery(
    async () => {
      try {
        const vaultId = getVaultId();
        const records = await db.transactions
          .where("date")
          .between(startStr, endStr, true, true)
          .toArray();
        return records.filter(
          (tx) =>
            (!tx.vaultId || tx.vaultId === vaultId) &&
            (tx.status === "active" || tx.status === "reconciled")
        );
      } catch {
        return [];
      }
    },
    [startStr, endStr]
  );

  const transactions = useMemo(() => liveTransactions || [], [liveTransactions]);

  // Expenses and Income totals
  const totalExpenseSum = useMemo(() => {
    return transactions
      .filter((t) => t.type?.toLowerCase() === "expense")
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  }, [transactions]);

  const totalIncomeSum = useMemo(() => {
    return transactions
      .filter((t) => t.type?.toLowerCase() === "income")
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  }, [transactions]);

  const netSavings = totalIncomeSum - totalExpenseSum;

  // Live query active boss for user vault
  const activeBoss = useLiveQuery(
    async () => {
      try {
        const vaultId = getVaultId();
        if (!db || !db.bosses) return null;
        const allBosses = await db.bosses.toArray();
        const userBosses = allBosses.filter((b) => !b.vaultId || b.vaultId === vaultId);
        return userBosses.find((b) => b.status === "active") || userBosses[0] || null;
      } catch {
        return null;
      }
    },
    []
  );

  const bossSpent = useMemo(() => {
    if (!activeBoss) return 0;
    return computeBossSpent(activeBoss, transactions);
  }, [activeBoss, transactions]);

  // Spending Category Breakdown Logic
  const categoryBreakdown = useMemo(() => {
    const expenses = transactions.filter((t) => t.type?.toLowerCase() === "expense");

    const map = {};
    CANONICAL_CATEGORIES.forEach((cat) => {
      map[cat] = 0;
    });

    expenses.forEach((t) => {
      const cat = t.category || "Other";
      if (map[cat] !== undefined) {
        map[cat] += Number(t.amount || 0);
      } else {
        map["Other"] += Number(t.amount || 0);
      }
    });

    const list = Object.keys(map)
      .map((cat) => ({
        category: cat,
        amount: map[cat]
      }))
      .filter((item) => item.amount > 0);

    list.sort((a, b) => b.amount - a.amount);
    const maxAmount = list[0]?.amount || 1;

    return {
      all: list,
      top5: list.slice(0, 5),
      maxAmount
    };
  }, [transactions]);

  const topCategory = categoryBreakdown.top5[0];

  // Map category to its transactions for fast grid and modal lookup
  const categoryTransactionsMap = useMemo(() => {
    const map = {};
    CANONICAL_CATEGORIES.forEach((c) => {
      map[c] = [];
    });

    transactions
      .filter((t) => t.type?.toLowerCase() === "expense")
      .forEach((t) => {
        const cat = t.category || "Other";
        if (map[cat]) {
          map[cat].push(t);
        } else {
          map["Other"].push(t);
        }
      });

    return map;
  }, [transactions]);

  // Filtered transactions for selected category modal
  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return categoryTransactionsMap[selectedCategory] || [];
  }, [selectedCategory, categoryTransactionsMap]);

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Soft Background Lavender & Pink Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />
      <div className="absolute top-2/3 left-0 w-[450px] h-[450px] bg-[#F6C9D5] rounded-full blur-3xl opacity-30 pointer-events-none -translate-x-1/3" />

      {/* NAVBAR */}
      <AppNavbar />

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-12 py-8 flex flex-col gap-8">
        
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91]">
                My Money Dashboard
              </h1>
              <Image
                src="/heart.png"
                alt="Heart"
                width={28}
                height={28}
                style={{ width: "auto", height: "auto" }}
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="text-sm sm:text-base text-[#5B3F91]/80 font-medium">
              Live spending breakdown, habits, and financial health for {monthNameYear}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Month Navigation */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-2xl border border-[#EAE3FA] shadow-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-[#FAF9FF] text-[#5B3F91] rounded-lg transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#8064C8]" />
                <span className="text-xs sm:text-sm font-bold text-[#5B3F91] whitespace-nowrap">
                  {monthNameYear}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-[#FAF9FF] text-[#5B3F91] rounded-lg transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 bg-[#EAE3FA] hover:bg-[#C9B9F2] text-[#8064C8] text-xs font-bold rounded-full transition-colors hidden sm:block"
            >
              This Month
            </button>

            <Link
              href="/calendar"
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FAF9FF] text-[#8064C8] text-xs sm:text-sm font-bold rounded-full border border-[#EAE3FA] shadow-xs transition-all hover:scale-105"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Day-by-Day Calendar</span>
            </Link>

            <Link
              href="/upload"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all hover:scale-105"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Statement</span>
            </Link>
          </div>
        </div>

        {/* METRICS SUMMARY ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Spent */}
          <div className="p-5 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5B3F91]/70">Total Spent ({monthNameYear})</p>
              <h3 className="text-2xl font-extrabold text-[#5B3F91]">
                ₹{totalExpenseSum.toLocaleString("en-IN")}
              </h3>
            </div>
          </div>

          {/* Income This Month */}
          <div className="p-5 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5B3F91]/70">Income This Month</p>
              <h3 className="text-2xl font-extrabold text-emerald-600">
                ₹{totalIncomeSum.toLocaleString("en-IN")}
              </h3>
            </div>
          </div>

          {/* Net Savings / Balance */}
          <div className="p-5 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${netSavings >= 0 ? "bg-purple-100 text-[#8064C8]" : "bg-amber-100 text-amber-600"} rounded-2xl flex items-center justify-center shrink-0`}>
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5B3F91]/70">Net Savings</p>
              <h3 className={`text-2xl font-extrabold ${netSavings >= 0 ? "text-[#5B3F91]" : "text-amber-700"}`}>
                {netSavings < 0 ? "-" : ""}₹{Math.abs(netSavings).toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        </div>

        {/* MAIN FEATURE GRID: "WHERE YOU SPEND THE MOST" + PENNY INSIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: "WHERE YOU SPEND THE MOST" CARD */}
          <div className="lg:col-span-8 p-6 sm:p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-lg">
            
            {/* Section Header */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-[#EAE3FA]/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-[#EAE3FA] text-[#8064C8] rounded-xl flex items-center justify-center">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <h2 className="font-handwritten text-3xl sm:text-4xl font-bold text-[#5B3F91]">
                    Where You Spend the Most
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#5B3F91]/70 font-medium">
                  See your biggest spending categories this month
                </p>
              </div>

              {categoryBreakdown.all.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="px-3.5 py-1.5 bg-[#FAF9FF] hover:bg-[#EAE3FA] text-[#8064C8] text-xs font-bold rounded-full border border-[#C9B9F2] transition-colors shrink-0"
                >
                  {showAllCategories ? "Show Top 5" : "View All"}
                </button>
              )}
            </div>

            {/* Ranked Category List */}
            {categoryBreakdown.all.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF9FF] rounded-2xl border border-dashed border-[#EAE3FA] flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-[#EAE3FA] rounded-2xl flex items-center justify-center text-[#8064C8]">
                  <PieChart className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#5B3F91] mb-1">
                    No expenses recorded for {monthNameYear}
                  </h4>
                  <p className="text-xs text-[#5B3F91]/70 font-medium max-w-sm mb-4">
                    Upload your bank statement or add transactions to see your personalized spending breakdown.
                  </p>
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs font-bold rounded-full transition-all hover:scale-105"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Bank Statement</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {(showAllCategories ? categoryBreakdown.all : categoryBreakdown.top5).map((item, index) => {
                  const meta = getCategoryMeta(item.category);
                  const IconComponent = meta.icon;

                  // Relative bar percentage based on #1 highest category
                  const relativeWidthPct = Math.round((item.amount / categoryBreakdown.maxAmount) * 100);

                  return (
                    <div
                      key={item.category}
                      onClick={() => setSelectedCategory(item.category)}
                      className="flex flex-col gap-1.5 group cursor-pointer p-2 rounded-2xl hover:bg-[#FAF9FF] transition-all"
                    >
                      {/* Top Info Row */}
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          {/* Rank Badge */}
                          <span className="w-6 text-center font-extrabold text-xs text-[#8064C8]">
                            {index + 1}
                          </span>

                          {/* Category Icon & Title */}
                          <div className={`p-2 rounded-xl border ${meta.bg} ${meta.border} ${meta.text}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <span className="font-bold text-[#5B3F91] group-hover:text-[#8064C8] transition-colors">
                            {item.category}
                          </span>
                        </div>

                        {/* Amount */}
                        <span className="font-extrabold text-[#5B3F91]">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Relative Progress Bar Track */}
                      <div className="pl-9 w-full">
                        <div className="w-full h-3 bg-[#FAF9FF] rounded-full overflow-hidden border border-[#EAE3FA] p-0.5">
                          <div
                            className="h-full bg-[#8064C8] rounded-full transition-all duration-500 group-hover:bg-[#6F53B7]"
                            style={{ width: `${relativeWidthPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* RIGHT: PENNY AI INSIGHT & PRIVACY */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Penny AI Companion Speech Bubble */}
            <div className="p-6 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-md flex flex-col items-center text-center">
              {/* Character Video */}
              <div className="relative w-36 h-40 mb-3">
                <video
                  src="/hugging_coin.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>

              <div className="bg-[#FAF9FF] p-4 rounded-2xl border border-[#EAE3FA] text-left w-full">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#8064C8] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Penny&apos;s Spending Insight</span>
                </div>
                <p className="text-xs sm:text-sm text-[#5B3F91] font-semibold leading-relaxed">
                  {topCategory && totalExpenseSum > 0 ? (
                    <span>
                      &quot;You spent the most on <strong className="text-[#8064C8]">{topCategory.category}</strong> (₹{topCategory.amount.toLocaleString("en-IN")}) this month! That&apos;s {Math.round((topCategory.amount / totalExpenseSum) * 100)}% of your total spending.&quot;
                    </span>
                  ) : (
                    <span>No expenses recorded yet for {monthNameYear}! Upload your bank statement to see smart automated insights.</span>
                  )}
                </p>

                <Link
                  href="/chat"
                  className="mt-3.5 w-full py-2 px-3 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Talk with Penny about this →</span>
                </Link>
              </div>
            </div>

            {/* Active Boss Battle Card */}
            {activeBoss ? (
              <div className="p-6 bg-gradient-to-br from-white via-[#FAF9FF] to-[#F6EEFA] rounded-3xl border border-[#EAE3FA] shadow-md flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center p-1 overflow-hidden shrink-0">
                      <Image
                        src="/villain.png"
                        alt={activeBoss.name || "CASHpaw"}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8064C8] block">
                        ACTIVE BOSS BATTLE
                      </span>
                      <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
                        {activeBoss.name || "CASHpaw Challenge"}
                      </h4>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    activeBoss.status === "victory"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : bossSpent > Number(activeBoss.targetLimit)
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : "bg-[#EAE3FA] text-[#5B3F91] border-[#C9B9F2]"
                  }`}>
                    {activeBoss.status === "victory" ? "DEFEATED" : bossSpent > Number(activeBoss.targetLimit) ? "OVER LIMIT" : "IN PROGRESS"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-900">₹{bossSpent.toLocaleString()} spent</span>
                    <span className="text-gray-500">/ ₹{Number(activeBoss.targetLimit || 1).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5 border border-[#EAE3FA] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeBoss.status === "victory"
                          ? "bg-emerald-500"
                          : bossSpent > Number(activeBoss.targetLimit)
                          ? "bg-rose-500"
                          : "bg-[#5B3F91]"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((bossSpent / Number(activeBoss.targetLimit || 1)) * 100))}%`
                      }}
                    />
                  </div>
                </div>

                <Link
                  href={`/boss/${activeBoss.id}`}
                  className="w-full py-2.5 px-3 bg-[#5B3F91] hover:bg-[#4A3277] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02]"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Fight Boss Arena →</span>
                </Link>
              </div>
            ) : (
              <div className="p-5 bg-white/90 rounded-3xl border border-[#EAE3FA] shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center p-1 shrink-0">
                    <Image src="/villain.png" alt="CASHpaw" width={32} height={32} className="object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Fight CASHpaw</h4>
                    <p className="text-[11px] text-gray-500">Set a spending target & defeat the boss</p>
                  </div>
                </div>
                <Link
                  href="/boss/create"
                  className="px-3 py-1.5 bg-[#5B3F91] hover:bg-[#4A3277] text-white text-xs font-bold rounded-xl shrink-0 transition-colors flex items-center gap-1"
                >
                  <Swords className="w-3 h-3" />
                  <span>Battle</span>
                </Link>
              </div>
            )}

            {/* Quick Privacy Reminder */}
            <div className="p-4 bg-white/70 rounded-2xl border border-[#EAE3FA] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#8064C8] shrink-0" />
              <p className="text-xs font-medium text-[#5B3F91]/80">
                Your financial data stays local on your device inside your encrypted vault.
              </p>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* CATEGORIES GRID SECTION */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-lg flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-[#EAE3FA] text-[#8064C8] rounded-xl flex items-center justify-center">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <h2 className="font-handwritten text-3xl sm:text-4xl font-bold text-[#5B3F91]">
                All Spending Categories
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5B3F91]/70 font-medium">
              Click any category card below to see all transactions under that category for {monthNameYear}
            </p>
          </div>

          {/* Grid of 12 Canonical Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CANONICAL_CATEGORIES.map((cat) => {
              const meta = getCategoryMeta(cat);
              const IconComp = meta.icon;
              const catTxs = categoryTransactionsMap[cat] || [];
              const catSum = catTxs.reduce((acc, t) => acc + Number(t.amount || 0), 0);

              return (
                <div
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="p-4 bg-[#FAF9FF] hover:bg-white rounded-2xl border border-[#EAE3FA] hover:border-[#8064C8] shadow-xs hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${meta.bg} ${meta.border} ${meta.text}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#8064C8] bg-[#EAE3FA]/80 px-2 py-0.5 rounded-full">
                      {catTxs.length} {catTxs.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#5B3F91] group-hover:text-[#8064C8] transition-colors mb-0.5">
                      {cat}
                    </h4>
                    <p className="text-xs font-extrabold text-[#5B3F91]">
                      ₹{catSum.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* CATEGORY TRANSACTIONS MODAL */}
      {/* ========================================================================= */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 bg-[#5B3F91]/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EAE3FA] shadow-2xl p-6 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE3FA]">
              <div className="flex items-center gap-3">
                {(() => {
                  const meta = getCategoryMeta(selectedCategory);
                  const IconComp = meta.icon;
                  return (
                    <div className={`p-2.5 rounded-xl border ${meta.bg} ${meta.border} ${meta.text}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-handwritten text-2xl sm:text-3xl font-bold text-[#5B3F91]">
                    {selectedCategory} Expenses
                  </h3>
                  <p className="text-xs text-[#5B3F91]/70 font-semibold">
                    Showing all transactions under {selectedCategory} for {monthNameYear}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="p-1.5 hover:bg-[#EAE3FA] text-[#5B3F91] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transactions List */}
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1 mb-4">
              {selectedCategoryTransactions.length === 0 ? (
                <div className="p-8 text-center text-[#5B3F91]/60 font-semibold text-sm bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA]">
                  No transactions recorded under <strong className="text-[#8064C8]">{selectedCategory}</strong> for {monthNameYear}.
                </div>
              ) : (
                selectedCategoryTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA] flex items-center justify-between gap-3 hover:border-[#C9B9F2] transition-colors"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#5B3F91]">
                        {tx.merchant || tx.desc || "Expense"}
                      </p>
                      <p className="text-[11px] text-[#5B3F91]/70 font-semibold">{tx.date}</p>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-[#5B3F91]">
                      - ₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#EAE3FA]">
              <span className="text-xs font-bold text-[#8064C8]">
                Total Spent: ₹{selectedCategoryTransactions.reduce((acc, t) => acc + Number(t.amount || 0), 0).toLocaleString("en-IN")}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/categories/${encodeURIComponent(selectedCategory || "Shopping")}`}
                  className="px-4 py-2 bg-[#FAF9FF] hover:bg-[#EAE3FA] border border-[#EAE3FA] text-[#5B3F91] text-xs font-bold rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Category Boss →</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="px-5 py-2 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 bg-white border-t border-[#EAE3FA] py-6 px-6 sm:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logoo.png"
              alt="PennyPal Logo"
              width={130}
              height={40}
              style={{ width: "auto", height: "auto" }}
              className="h-8 object-contain"
            />
          </div>
          <p className="text-xs font-semibold text-[#5B3F91]/60 flex items-center gap-1">
            <span>© {new Date().getFullYear()} PennyPal. All rights reserved. Your friendly AI money buddy.</span>
          </p>
          <div className="flex gap-6 text-xs font-semibold text-[#5B3F91]">
            <Link href="/" className="hover:text-[#8064C8]">Home</Link>
            <Link href="/dashboard" className="hover:text-[#8064C8]">Dashboard</Link>
            <Link href="/calendar" className="hover:text-[#8064C8]">Calendar</Link>
            <Link href="/upload" className="hover:text-[#8064C8]">Upload</Link>
            <Link href="/settings" className="hover:text-[#8064C8]">Settings</Link>
            <Link href="/chat" className="hover:text-[#8064C8]">Chat</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
