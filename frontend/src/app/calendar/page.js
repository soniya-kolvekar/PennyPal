"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flame,
  Target,
  Repeat,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  Utensils,
  Car,
  Tv,
  CheckCircle2,
  Wallet,
  Zap,
  Activity,
  Home,
  User
} from "lucide-react";

// Helper to format daily spent amount concisely for calendar cells
function formatCompactAmount(amount) {
  if (!amount) return "";
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `₹${amount}`;
}

// Category Icon Mapping (Zero Emojis)
function getCategoryIcon(category) {
  switch (category) {
    case "Food":
      return <Utensils className="w-4 h-4 text-orange-500" />;
    case "Shopping":
      return <ShoppingBag className="w-4 h-4 text-purple-500" />;
    case "Transport":
      return <Car className="w-4 h-4 text-blue-500" />;
    case "Subscriptions":
      return <Tv className="w-4 h-4 text-indigo-500" />;
    case "Bills":
      return <Zap className="w-4 h-4 text-amber-500" />;
    case "Healthcare":
      return <Activity className="w-4 h-4 text-emerald-500" />;
    case "Rent":
      return <Home className="w-4 h-4 text-violet-500" />;
    case "Personal":
      return <User className="w-4 h-4 text-teal-500" />;
    default:
      return <Wallet className="w-4 h-4 text-[#8064C8]" />;
  }
}

// Sample Data for September 2026
const SEPTEMBER_2026_DATA = {
  1: { spent: 450, expenses: [{ desc: "Swiggy Food Delivery", cat: "Food", amount: 450 }] },
  2: { spent: 800, expenses: [{ desc: "Amazon Essentials", cat: "Shopping", amount: 800 }] },
  4: { spent: 200, expenses: [{ desc: "Local Grocery", cat: "Food", amount: 200 }] },
  7: { spent: 300, expenses: [{ desc: "Uber Auto Ride", cat: "Transport", amount: 300 }] },
  9: { spent: 1200, expenses: [{ desc: "Laptop Stand", cat: "Shopping", amount: 1200 }] },
  12: { spent: 600, expenses: [{ desc: "Weekend Movie Ticket", cat: "Entertainment", amount: 600 }] },
  15: { spent: 450, expenses: [{ desc: "Zomato Gourmet Lunch", cat: "Food", amount: 450 }] },
  18: { spent: 300, expenses: [{ desc: "Pharmacy Medicine", cat: "Healthcare", amount: 300 }] },
  21: {
    spent: 300,
    expenses: [{ desc: "Artisan Coffee", cat: "Food", amount: 300 }],
    challenge: { title: "No Food Delivery Challenge", xp: 50, status: "Completed ✓" }
  },
  22: { spent: 700, expenses: [{ desc: "Dinner with Friends", cat: "Food", amount: 700 }] },
  23: { spent: 250, expenses: [{ desc: "Metro Recharge", cat: "Transport", amount: 250 }] },
  24: {
    spent: 2498,
    expenses: [
      { desc: "Amazon India", cat: "Shopping", amount: 1200 },
      { desc: "Swiggy", cat: "Food", amount: 450 },
      { desc: "Uber Ride", cat: "Transport", amount: 199 },
      { desc: "Netflix Subscription", cat: "Subscriptions", amount: 649, isRecurring: true }
    ],
    pennyCheckIn: {
      question: "How are we doing this week?",
      options: ["I'm doing good", "I need help"]
    }
  },
  27: {
    goal: { title: "Laptop Goal", savedAmount: 20000, progressPct: 50 }
  },
  30: {
    income: 50000,
    incomeDetails: [{ desc: "Monthly Salary Credit", cat: "Salary", amount: 50000 }],
    spent: 1200,
    expenses: [{ desc: "Electricity Utility Bill", cat: "Bills", amount: 1200 }]
  }
};

// Sample Data for October 2026
const OCTOBER_2026_DATA = {
  3: { spent: 550, expenses: [{ desc: "Cinema Movie & Snacks", cat: "Entertainment", amount: 550 }] },
  8: { spent: 1450, expenses: [{ desc: "Autumn Wear Shopping", cat: "Shopping", amount: 1450 }] },
  14: { spent: 320, expenses: [{ desc: "City Cab Ride", cat: "Transport", amount: 320 }] },
  20: { spent: 850, expenses: [{ desc: "Dinner Buffet", cat: "Food", amount: 850 }] },
  24: {
    spent: 649,
    expenses: [{ desc: "Netflix Subscription", cat: "Subscriptions", amount: 649, isRecurring: true }]
  },
  28: { goal: { title: "Vacation Savings Goal", savedAmount: 15000, progressPct: 40 } },
  31: {
    income: 55000,
    incomeDetails: [{ desc: "Monthly Salary Credit", cat: "Salary", amount: 55000 }]
  }
};

// Sample Data for August 2026
const AUGUST_2026_DATA = {
  5: { spent: 900, expenses: [{ desc: "Summer Event Pass", cat: "Entertainment", amount: 900 }] },
  12: { spent: 2100, expenses: [{ desc: "Running Sneakers", cat: "Shopping", amount: 2100 }] },
  18: { spent: 450, expenses: [{ desc: "Swiggy Dinner", cat: "Food", amount: 450 }] },
  24: {
    spent: 649,
    expenses: [{ desc: "Netflix Subscription", cat: "Subscriptions", amount: 649, isRecurring: true }]
  },
  31: {
    income: 50000,
    incomeDetails: [{ desc: "Monthly Salary Credit", cat: "Salary", amount: 50000 }]
  }
};

// Helper to compute dynamic color heat map style for a calendar day cell
function getCellHeatMapStyle(dayData, isSelected, isToday) {
  if (isSelected) {
    return "bg-[#EAE3FA]/90 border-[#8064C8] shadow-md scale-[1.02] ring-2 ring-[#8064C8]/40";
  }

  const spent = dayData?.spent || 0;
  const income = dayData?.income || 0;

  // 1. Heavy Expenses Day (> ₹1,500): Darker red tint
  if (spent > 1500) {
    return "bg-rose-100/90 border-rose-300 hover:bg-rose-200/90 text-rose-900 shadow-xs";
  }

  // 2. Light / Moderate Expenses Day (> 0 && <= ₹1,500): Light red tint
  if (spent > 0) {
    return "bg-rose-50/80 border-rose-200 hover:bg-rose-100/80 text-rose-700 shadow-xs";
  }

  // 3. Passed / Recorded Day with 0 Expenses or Income Only: Nice soft green tint!
  if (income > 0 || (dayData && spent === 0)) {
    return "bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/80 text-emerald-800 shadow-xs";
  }

  // Default clean day style
  if (isToday) {
    return "bg-[#FAF9FF] border-[#8064C8] shadow-xs";
  }

  return "bg-[#FAF9FF] border-[#EAE3FA] hover:border-[#C9B9F2] hover:bg-white";
}

export default function CalendarPage() {
  // Current view date (Default: September 1, 2026)
  const [viewDate, setViewDate] = useState(new Date(2026, 8, 1));
  const [selectedDay, setSelectedDay] = useState(24);
  const [pennyCheckInResponse, setPennyCheckInResponse] = useState(null);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  const handleToday = () => {
    setViewDate(new Date(2026, 8, 1)); // Sep 2026
    setSelectedDay(24);
  };

  // Dynamic Month & Year string (e.g. "September 2026")
  const monthNameYear = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  // Calculate Real Calendar Grid Cells
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const { gridCells, monthData } = useMemo(() => {
    // 1. Determine dataset for view month
    let dataForMonth = {};
    if (year === 2026 && month === 8) dataForMonth = SEPTEMBER_2026_DATA;
    else if (year === 2026 && month === 9) dataForMonth = OCTOBER_2026_DATA;
    else if (year === 2026 && month === 7) dataForMonth = AUGUST_2026_DATA;
    else {
      // Dynamic fallback data generator for any other month
      for (let d = 1; d <= 31; d++) {
        if (d % 6 === 0) {
          dataForMonth[d] = {
            spent: d * 35,
            expenses: [{ desc: `Day ${d} Coffee & Snacks`, cat: "Food", amount: d * 35 }]
          };
        }
        if (d === 24) {
          dataForMonth[d] = {
            spent: 649,
            expenses: [{ desc: "Netflix Subscription", cat: "Subscriptions", amount: 649, isRecurring: true }]
          };
        }
        if (d === 28) {
          dataForMonth[d] = {
            income: 50000,
            incomeDetails: [{ desc: "Salary Deposit", cat: "Salary", amount: 50000 }]
          };
        }
      }
    }

    // 2. Real Calendar Grid calculation
    const firstDayOfMonth = new Date(year, month, 1);
    // Day of week: 0 = Sun, 1 = Mon ... 6 = Sat -> Convert to 0 = Mon ... 6 = Sun
    let firstDayIndex = firstDayOfMonth.getDay() - 1;
    if (firstDayIndex === -1) firstDayIndex = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month padding cells
    const prevCells = Array.from({ length: firstDayIndex }, (_, i) => ({
      dayNum: daysInPrevMonth - firstDayIndex + 1 + i,
      isCurrentMonth: false,
      isPrevMonth: true
    }));

    // Current month cells
    const currentCells = Array.from({ length: daysInMonth }, (_, i) => ({
      dayNum: i + 1,
      isCurrentMonth: true
    }));

    // Next month padding cells (make total grid multiple of 7)
    const totalSoFar = prevCells.length + currentCells.length;
    const nextCount = totalSoFar % 7 === 0 ? 0 : 7 - (totalSoFar % 7);
    const nextCells = Array.from({ length: nextCount }, (_, i) => ({
      dayNum: i + 1,
      isCurrentMonth: false,
      isNextMonth: true
    }));

    return {
      gridCells: [...prevCells, ...currentCells, ...nextCells],
      monthData: dataForMonth
    };
  }, [year, month]);

  // Selected Day Data
  const selectedData = monthData[selectedDay] || null;
  const totalDailySpent = selectedData?.spent || 0;
  const totalDailyIncome = selectedData?.income || 0;

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Soft Background Lavender & Pink Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#F6C9D5] rounded-full blur-3xl opacity-30 pointer-events-none" />

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
            <Link href="/dashboard" className="hover:text-[#8064C8] transition-colors">
              Dashboard
            </Link>
            <Link href="/calendar" className="text-[#8064C8] transition-colors">
              Calendar
            </Link>
            <Link href="/upload" className="hover:text-[#8064C8] transition-colors">
              Upload
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToday}
              className="px-4 py-1.5 bg-[#EAE3FA] hover:bg-[#C9B9F2] text-[#8064C8] text-xs font-bold rounded-full transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-6 sm:px-12 py-8 flex flex-col gap-8">
        
        {/* 1. HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 bg-[#EAE3FA] text-[#8064C8] rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h1 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91]">
                Calendar
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#5B3F91]/80 font-medium">
              Track your spending day by day
            </p>
          </div>

          {/* Dynamic Month Navigation & Today Button */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#EAE3FA] shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[#FAF9FF] text-[#5B3F91] rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-extrabold text-[#5B3F91] min-w-[140px] text-center">
              {monthNameYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-[#FAF9FF] text-[#5B3F91] rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="h-4 w-[1px] bg-[#EAE3FA]" />

            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs font-bold rounded-full transition-all hover:scale-105"
            >
              Today
            </button>
          </div>
        </div>

        {/* 2. REAL CALENDAR GRID */}
        <div className="p-6 bg-white/95 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-lg">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
              <div key={day} className="text-xs font-extrabold text-[#8064C8] tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Dynamic Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {gridCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                // Non-current month padding cells
                return (
                  <div
                    key={`pad-${idx}`}
                    className="h-20 sm:h-24 p-2 bg-[#FAF9FF]/40 rounded-2xl border border-dashed border-[#EAE3FA]/60 text-[#5B3F91]/30 text-xs font-bold"
                  >
                    {cell.dayNum}
                  </div>
                );
              }

              // Current Month Cell
              const dayNum = cell.dayNum;
              const dayData = monthData[dayNum];
              const isSelected = selectedDay === dayNum;
              const isToday = year === 2026 && month === 8 && dayNum === 24;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`relative h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${getCellHeatMapStyle(
                    dayData,
                    isSelected,
                    isToday
                  )}`}
                >
                  {/* Top Row: Date Number & Special Event Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                        isToday
                          ? "bg-[#8064C8] text-white"
                          : isSelected
                          ? "text-[#8064C8] font-black"
                          : "text-[#5B3F91]"
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Indicator Badges (Zero Emojis - Lucide Icons) */}
                    <div className="flex items-center gap-1">
                      {dayData?.income && (
                        <span title="Income Day" className="p-0.5 bg-emerald-100 text-emerald-600 rounded-md shadow-xs">
                          <TrendingUp className="w-3 h-3" />
                        </span>
                      )}
                      {dayData?.expenses?.some((e) => e.isRecurring) && (
                        <span title="Recurring Expense" className="p-0.5 bg-indigo-100 text-indigo-600 rounded-md shadow-xs">
                          <Repeat className="w-3 h-3" />
                        </span>
                      )}
                      {dayData?.challenge && (
                        <span title="Challenge Active" className="p-0.5 bg-orange-100 text-orange-600 rounded-md shadow-xs">
                          <Flame className="w-3 h-3" />
                        </span>
                      )}
                      {dayData?.goal && (
                        <span title="Goal Milestone" className="p-0.5 bg-pink-100 text-pink-600 rounded-md shadow-xs">
                          <Target className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Daily Total Amount Display */}
                  <div className="mt-auto text-right">
                    {dayData?.income && (
                      <p className="text-[10px] sm:text-xs font-extrabold text-emerald-700">
                        +{formatCompactAmount(dayData.income)}
                      </p>
                    )}
                    {dayData?.spent && (
                      <p className={`text-[10px] sm:text-xs font-extrabold ${
                        dayData.spent > 1500 ? "text-rose-900 font-black" : "text-rose-700"
                      }`}>
                        {formatCompactAmount(dayData.spent)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SPENDING COLOR LEGEND BAR */}
          <div className="flex flex-wrap items-center justify-end gap-4 text-xs font-semibold text-[#5B3F91]/80 mt-4 pt-3 border-t border-[#EAE3FA]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-emerald-50 border border-emerald-300 rounded-md shadow-2xs" />
              <span>No Expense / Good Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-rose-50 border border-rose-200 rounded-md shadow-2xs" />
              <span>Light Expense (&le; ₹1,500)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-rose-100 border border-rose-300 rounded-md shadow-2xs" />
              <span>Heavy Expense (&gt; ₹1,500)</span>
            </div>
          </div>

        </div>

        {/* 3. SELECTED DATE DETAILS PANEL */}
        <div className="p-6 sm:p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-lg flex flex-col gap-6 animate-fade-in">
          
          {/* Header for Selected Date */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3FA]">
            <div>
              <span className="text-xs font-extrabold text-[#8064C8] uppercase tracking-wider">
                Day Breakdown
              </span>
              <h2 className="font-handwritten text-3xl sm:text-4xl font-bold text-[#5B3F91]">
                {viewDate.toLocaleDateString("en-US", { month: "long" })} {selectedDay}, {year}
              </h2>
            </div>

            {/* Daily Summary Totals */}
            <div className="flex items-center gap-4">
              {totalDailyIncome > 0 && (
                <div className="text-right">
                  <p className="text-xs font-bold text-[#5B3F91]/70">Total Income</p>
                  <p className="text-lg font-extrabold text-emerald-600">
                    +₹{totalDailyIncome.toLocaleString("en-IN")}
                  </p>
                </div>
              )}
              {totalDailySpent > 0 && (
                <div className="text-right">
                  <p className="text-xs font-bold text-[#5B3F91]/70">Total Spent</p>
                  <p className="text-lg font-extrabold text-[#5B3F91]">
                    ₹{totalDailySpent.toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* If No Activity Recorded for this Day */}
          {!selectedData && (
            <div className="p-8 text-center text-[#5B3F91]/60 font-semibold text-sm bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA]">
              No transactions or events recorded for {viewDate.toLocaleDateString("en-US", { month: "long" })} {selectedDay}. Click another date to view activity!
            </div>
          )}

          {/* Selected Day Content Sections */}
          {selectedData && (
            <div className="space-y-6">
              
              {/* INCOME SECTION (If Any) */}
              {selectedData.incomeDetails && selectedData.incomeDetails.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Income</span>
                  </h4>
                  <div className="space-y-2.5">
                    {selectedData.incomeDetails.map((inc, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#5B3F91]">{inc.desc}</p>
                            <p className="text-xs text-[#5B3F91]/70 font-semibold">{inc.cat}</p>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-emerald-600">
                          +₹{inc.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPENSES SECTION (If Any) */}
              {selectedData.expenses && selectedData.expenses.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-[#5B3F91]/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[#8064C8]" />
                    <span>Expenses</span>
                  </h4>
                  <div className="space-y-2.5">
                    {selectedData.expenses.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA] flex items-center justify-between gap-3 hover:border-[#C9B9F2] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#EAE3FA] rounded-xl flex items-center justify-center shrink-0">
                            {getCategoryIcon(exp.cat)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#5B3F91]">{exp.desc}</p>
                              {exp.isRecurring && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                                  <Repeat className="w-3 h-3" />
                                  <span>Recurring</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#5B3F91]/70 font-semibold">{exp.cat}</p>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-[#5B3F91]">
                          -₹{exp.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHALLENGES SECTION (If Any) */}
              {selectedData.challenge && (
                <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#5B3F91]">{selectedData.challenge.title}</p>
                      <p className="text-xs text-orange-600 font-bold">
                        +{selectedData.challenge.xp} XP • {selectedData.challenge.status}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              )}

              {/* GOAL MILESTONE SECTION (If Any) */}
              {selectedData.goal && (
                <div className="p-4 bg-pink-50/70 rounded-2xl border border-pink-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#5B3F91]">{selectedData.goal.title}</p>
                      <p className="text-xs text-[#5B3F91]/80 font-medium">
                        ₹{selectedData.goal.savedAmount.toLocaleString("en-IN")} saved • {selectedData.goal.progressPct}% of your goal reached
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </main>

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
          </div>
        </div>
      </footer>

    </div>
  );
}
