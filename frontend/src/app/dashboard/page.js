"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PieChart,
  TrendingUp,
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
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  LayoutGrid,
  X
} from "lucide-react";

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

// Mock Transactions Data
const INITIAL_TRANSACTIONS = [
  { id: "1", type: "expense", category: "Food", amount: 4250, desc: "Swiggy & Restaurant Dining", date: "Sep 18" },
  { id: "2", type: "expense", category: "Shopping", amount: 3100, desc: "Amazon Clothes & Tech", date: "Sep 16" },
  { id: "3", type: "expense", category: "Transport", amount: 1850, desc: "Uber & Petrol Cab Fares", date: "Sep 15" },
  { id: "4", type: "expense", category: "Entertainment", amount: 1200, desc: "Movies & Event Tickets", date: "Sep 14" },
  { id: "5", type: "expense", category: "Bills", amount: 950, desc: "Electricity & Water Bill", date: "Sep 12" },
  { id: "6", type: "expense", category: "Subscriptions", amount: 799, desc: "Netflix & Spotify Premium", date: "Sep 10" },
  { id: "7", type: "expense", category: "Food", amount: 1200, desc: "Organic Grocery Store", date: "Sep 08" },
  { id: "8", type: "expense", category: "Personal", amount: 650, desc: "Salon & Grooming", date: "Sep 05" },
  { id: "9", type: "expense", category: "Healthcare", amount: 450, desc: "Pharmacy Medicine", date: "Sep 03" },
  { id: "10", type: "income", category: "Salary", amount: 55000, desc: "Monthly Salary Credit", date: "Sep 01" }
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

  // Spending Category Breakdown Logic
  const categoryBreakdown = useMemo(() => {
    // 1. Filter expense transactions
    const expenses = INITIAL_TRANSACTIONS.filter((t) => t.type === "expense");

    // 2. Group by category and calculate total
    const map = {};
    CANONICAL_CATEGORIES.forEach((cat) => {
      map[cat] = 0;
    });

    expenses.forEach((t) => {
      if (map[t.category] !== undefined) {
        map[t.category] += t.amount;
      } else {
        map["Other"] += t.amount;
      }
    });

    // 3. Convert to array and filter non-zero items
    const list = Object.keys(map)
      .map((cat) => ({
        category: cat,
        amount: map[cat]
      }))
      .filter((item) => item.amount > 0);

    // 4. Sort highest spending -> lowest spending
    list.sort((a, b) => b.amount - a.amount);

    // 5. Max amount for relative progress calculation
    const maxAmount = list[0]?.amount || 1;

    return {
      all: list,
      top5: list.slice(0, 5),
      maxAmount
    };
  }, []);

  const totalExpenseSum = useMemo(() => {
    return INITIAL_TRANSACTIONS.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  }, []);

  const topCategory = categoryBreakdown.top5[0];

  // Filtered transactions for selected category modal
  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return INITIAL_TRANSACTIONS.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Soft Background Lavender & Pink Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />
      <div className="absolute top-2/3 left-0 w-[450px] h-[450px] bg-[#F6C9D5] rounded-full blur-3xl opacity-30 pointer-events-none -translate-x-1/3" />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF9FF]/90 border-b border-[#EAE3FA]/80 px-6 sm:px-12 py-2 transition-all">
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
            <Link href="/dashboard" className="text-[#8064C8] transition-colors">
              Dashboard
            </Link>
            <Link href="/upload" className="hover:text-[#8064C8] transition-colors">
              Upload
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#EAE3FA] shadow-xs">
              <Calendar className="w-4 h-4 text-[#8064C8]" />
              <span className="text-xs sm:text-sm font-bold text-[#5B3F91]">September 2026</span>
            </div>
          </div>
        </div>
      </nav>

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
              Track your spending breakdown, habits, and financial health.
            </p>
          </div>
        </div>

        {/* METRICS SUMMARY ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5B3F91]/70">Total Spent</p>
              <h3 className="text-2xl font-extrabold text-[#5B3F91]">₹{totalExpenseSum.toLocaleString("en-IN")}</h3>
            </div>
          </div>

          <div className="p-5 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-[#8064C8] rounded-2xl flex items-center justify-center shrink-0">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5B3F91]/70">Monthly Budget</p>
              <h3 className="text-2xl font-extrabold text-[#5B3F91]">₹20,000</h3>
            </div>
          </div>

          <div className="p-5 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5B3F91]/70">Income This Month</p>
              <h3 className="text-2xl font-extrabold text-emerald-600">₹55,000</h3>
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

              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="px-3.5 py-1.5 bg-[#FAF9FF] hover:bg-[#EAE3FA] text-[#8064C8] text-xs font-bold rounded-full border border-[#C9B9F2] transition-colors shrink-0"
              >
                {showAllCategories ? "Show Top 5" : "View All"}
              </button>
            </div>

            {/* Ranked Category List */}
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
                  {topCategory ? (
                    <span>
                      &quot;You spent the most on <strong className="text-[#8064C8]">{topCategory.category}</strong> (₹{topCategory.amount.toLocaleString("en-IN")}) this month! That&apos;s {Math.round((topCategory.amount / totalExpenseSum) * 100)}% of your total expenses.&quot;
                    </span>
                  ) : (
                    <span>No expenses recorded yet! Add expenses to get insights.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Privacy Reminder */}
            <div className="p-4 bg-white/70 rounded-2xl border border-[#EAE3FA] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#8064C8] shrink-0" />
              <p className="text-xs font-medium text-[#5B3F91]/80">
                Your financial data stays local on your device.
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
              Click any category card below to see all transactions under that category
            </p>
          </div>

          {/* Grid of 12 Canonical Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CANONICAL_CATEGORIES.map((cat) => {
              const meta = getCategoryMeta(cat);
              const IconComp = meta.icon;
              const catTxs = INITIAL_TRANSACTIONS.filter((t) => t.category === cat && t.type === "expense");
              const catSum = catTxs.reduce((acc, t) => acc + t.amount, 0);

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
                    Showing all transactions under {selectedCategory}
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
                  No transactions recorded under <strong className="text-[#8064C8]">{selectedCategory}</strong> yet.
                </div>
              ) : (
                selectedCategoryTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA] flex items-center justify-between gap-3 hover:border-[#C9B9F2] transition-colors"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#5B3F91]">{tx.desc}</p>
                      <p className="text-[11px] text-[#5B3F91]/70 font-semibold">{tx.date}</p>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-[#5B3F91]">
                      - ₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#EAE3FA]">
              <span className="text-xs font-bold text-[#8064C8]">
                Total Spent: ₹{selectedCategoryTransactions.reduce((acc, t) => acc + t.amount, 0).toLocaleString("en-IN")}
              </span>
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
            <Link href="/upload" className="hover:text-[#8064C8]">Upload</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
