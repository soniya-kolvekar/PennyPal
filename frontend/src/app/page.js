"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
  Flame,
  Calendar as CalendarIcon,
  MessageSquare,
  Mic,
  MapPin,
  CheckCircle2,
  Check,
  ChevronRight,
  DollarSign,
  PieChart,
  FileText,
  Swords,
  Target,
  Trophy,
  Smile,
  Wallet,
  Search,
  Edit3,
  Utensils,
  ShoppingBag,
  Car,
  Gamepad2,
  Laptop,
  Lightbulb,
  Bot
} from "lucide-react";

export default function LandingPage() {
  const [selectedDay, setSelectedDay] = useState(11);
  const [chatMessage, setChatMessage] = useState("");

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      
      {/* Pretty Soft Background Purple & Blush Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-12 right-1/3 w-80 h-80 bg-[#F6C9D5] rounded-full blur-3xl opacity-35 pointer-events-none" />
      <div className="absolute top-1/6 right-0 w-[550px] h-[550px] bg-[#C9B9F2] rounded-full blur-3xl opacity-40 pointer-events-none translate-x-1/3" />
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#EAE3FA] rounded-full blur-3xl opacity-45 pointer-events-none -translate-x-1/4" />
      <div className="absolute top-1/2 right-1/4 w-[480px] h-[480px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none" />
      <div className="absolute top-5/12 left-1/3 w-72 h-72 bg-[#F6C9D5] rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-2/3 left-0 w-[520px] h-[520px] bg-[#EAE3FA] rounded-full blur-3xl opacity-50 pointer-events-none -translate-x-1/3" />
      <div className="absolute top-3/4 right-5 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-5/6 left-1/4 w-[450px] h-[450px] bg-[#F6C9D5] rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-[600px] h-[600px] bg-[#EAE3FA] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[650px] h-[650px] bg-[#C9B9F2] rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF9FF]/90 border-b border-[#EAE3FA]/80 px-6 sm:px-12 py-1.5 sm:py-2 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
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

          {/* Navigation Links (Public Landing Only) */}
          <div className="hidden md:flex items-center gap-8 text-base sm:text-lg font-bold text-[#5B3F91]">
            <a href="#features" className="hover:text-[#8064C8] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#8064C8] transition-colors">
              How It Works
            </a>
            <a href="#why-pennypal" className="hover:text-[#8064C8] transition-colors">
              Why PennyPal?
            </a>
          </div>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-base font-bold text-[#5B3F91] hover:text-[#8064C8] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-base font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all hover:scale-[1.02]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 pt-10 sm:pt-16 pb-16 sm:pb-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            
            

            {/* Main Heading (Handwriting Font) */}
            <div className="relative mb-4">
              <h1 className="font-handwritten text-5xl sm:text-6xl lg:text-7xl font-bold text-[#5B3F91] leading-[1.1] tracking-tight">
                Your Money Has <br className="hidden sm:inline" />
                <span className="text-[#8064C8] inline-flex items-center gap-2">
                  Feelings.
                  <Image
                    src="/heart.png"
                    alt="Heart"
                    width={36}
                    height={36}
                    style={{ width: "auto", height: "auto" }}
                    className="inline-block h-8 sm:h-12 w-auto object-contain"
                  />
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#5B3F91]/90 mb-8 max-w-xl font-medium leading-relaxed">
              Meet Penny - your personal finance buddy who helps you understand your spending, complete money challenges, and reach your goals.
            </p>

            {/* Hero Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="/signup"
                className="px-8 py-4 bg-[#8064C8] hover:bg-[#6F53B7] text-white font-bold rounded-full shadow-lg shadow-[#8064C8]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-base"
              >
                <span>Start My Journey</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white border border-[#EAE3FA] text-[#5B3F91] hover:bg-[#EAE3FA]/40 font-bold rounded-full shadow-sm flex items-center justify-center transition-all text-base text-center"
              >
                Explore PennyPal
              </a>
            </div>

          </div>

          {/* Hero Right Content: Waving Penguin Video */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            
            {/* Waving Penguin Video Only (Enlarged, no container box) */}
            <div className="relative z-10 w-96 h-96 sm:w-[480px] sm:h-[480px] flex items-end justify-center">
              {/* Floating Accent Hearts */}
              <div className="absolute top-2 right-2 animate-bounce z-20">
                <Image
                  src="/heart.png"
                  alt="Heart"
                  width={36}
                  height={36}
                  style={{ width: "auto", height: "auto" }}
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              </div>
              <div className="absolute top-16 -right-6 opacity-80 z-20">
                <Image
                  src="/heart.png"
                  alt="Heart"
                  width={28}
                  height={28}
                  style={{ width: "auto", height: "auto" }}
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="absolute bottom-10 -left-6 opacity-90 z-20">
                <Image
                  src="/heart.png"
                  alt="Heart"
                  width={32}
                  height={32}
                  style={{ width: "auto", height: "auto" }}
                  className="h-8 w-auto object-contain"
                />
              </div>

              <video
                src="/landingpenguin.webm"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>

            {/* Handwritten Underneath Tagline */}
            <div className="mt-4 font-handwritten text-2xl sm:text-3xl text-[#8064C8] flex items-center gap-2">
              <span>Penny is ready to help you</span>
              <Image
                src="/heart.png"
                alt="Heart"
                width={20}
                height={20}
                style={{ width: "auto", height: "auto" }}
                className="inline-block h-5 w-auto object-contain"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. MEET YOUR MONEY BUDDY */}
      <section id="why-pennypal" className="relative z-10 py-16 px-6 sm:px-12 bg-white/60 backdrop-blur-sm border-y border-[#EAE3FA]/80">
        <div className="max-w-7xl mx-auto text-center">
          
          <div className="inline-block font-handwritten text-2xl sm:text-3xl text-[#8064C8] mb-1 -rotate-2">
            Meet Penny
          </div>
          <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91] mb-4">
            Meet Your Money Buddy
          </h2>
          <p className="text-base sm:text-lg text-[#5B3F91]/80 max-w-2xl mx-auto mb-12 font-medium">
            She watches your spending, celebrates your wins, challenges your habits, and helps you get closer to your goals.
          </p>

          {/* 3 Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Coach Me */}
            <div className="bg-white p-8 rounded-3xl border border-[#EAE3FA] shadow-md shadow-purple-500/5 hover:shadow-xl hover:border-[#C9B9F2] transition-all group flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-2">Coach Me</h3>
              <p className="text-sm text-[#5B3F91]/80 font-medium leading-relaxed">
                Ask Penny anything about your finances, budgets, or savings strategies.
              </p>
            </div>

            {/* Card 2: Challenge Me */}
            <div className="bg-white p-8 rounded-3xl border border-[#EAE3FA] shadow-md shadow-purple-500/5 hover:shadow-xl hover:border-[#C9B9F2] transition-all group flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-2">Challenge Me</h3>
              <p className="text-sm text-[#5B3F91]/80 font-medium leading-relaxed">
                Turn impulse spending habits into fun, rewarding financial boss battles.
              </p>
            </div>

            {/* Card 3: Guide Me */}
            <div className="bg-white p-8 rounded-3xl border border-[#EAE3FA] shadow-md shadow-purple-500/5 hover:shadow-xl hover:border-[#C9B9F2] transition-all group flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-2">Guide Me</h3>
              <p className="text-sm text-[#5B3F91]/80 font-medium leading-relaxed">
                Get a step-by-step personalized roadmap toward your dream milestones.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 sm:px-12 bg-[#FAF9FF] border-b border-[#EAE3FA]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-4 py-1.5 rounded-full bg-[#EAE3FA] text-xs font-bold text-[#8064C8] uppercase tracking-wider inline-block mb-3">
              Simple 5-Step Journey
            </span>
            <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91] mb-4">
              HOW PENNYPAL WORKS
            </h2>
            <p className="text-base sm:text-lg text-[#5B3F91]/80 font-medium">
              From uploading your expenses to defeating spending bosses and hitting your dream goals.
            </p>
          </div>

          {/* Horizontal / Grid Journey Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 01 */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE3FA] shadow-md shadow-purple-500/5 hover:shadow-xl hover:border-[#C9B9F2] transition-all flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#8064C8] bg-[#EAE3FA] px-2.5 py-1 rounded-full">
                    01
                  </span>
                </div>
                <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-2">
                  Add Your Money
                </h3>
                <p className="text-xs text-[#5B3F91]/75 font-medium leading-relaxed mb-3">
                  Upload your bank statement, receipts, or manually add transactions. Penny organizes your spending for you.
                </p>
              </div>
              <div className="pt-3 border-t border-[#FAF9FF] text-[11px] font-bold text-[#8064C8]">
                Upload / Manual Entry
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE3FA] shadow-md shadow-purple-500/5 hover:shadow-xl hover:border-[#C9B9F2] transition-all flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#8064C8] bg-[#EAE3FA] px-2.5 py-1 rounded-full">
                    02
                  </span>
                </div>
                <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-2">
                  Understand Spending
                </h3>
                <p className="text-xs text-[#5B3F91]/75 font-medium leading-relaxed mb-3">
                  Penny finds your patterns — see where your money goes, top spending categories, and recurring expenses.
                </p>
              </div>
              <div className="pt-3 border-t border-[#FAF9FF] text-[11px] font-bold text-[#8064C8]">
                Spending Insights
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE3FA] shadow-md shadow-purple-500/5 hover:shadow-xl hover:border-[#C9B9F2] transition-all flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#8064C8] bg-[#EAE3FA] px-2.5 py-1 rounded-full">
                    03
                  </span>
                </div>
                <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-2">
                  Take on Your Quest
                </h3>
                <p className="text-xs text-[#5B3F91]/75 font-medium leading-relaxed mb-3">
                  Turn habits into challenges. E.g. <span className="font-bold">Food Boss:</span> Keep food under ₹3,500 this month. Earn XP & streaks!
                </p>
              </div>
              <div className="pt-3 border-t border-[#FAF9FF] text-[11px] font-bold text-[#8064C8]">
                Challenges & Bosses
              </div>
            </div>

            {/* Step 04 */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE3FA] shadow-md shadow-purple-500/5 hover:shadow-xl hover:border-[#C9B9F2] transition-all flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#8064C8] bg-[#EAE3FA] px-2.5 py-1 rounded-full">
                    04
                  </span>
                </div>
                <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-2">
                  Set Your Goal
                </h3>
                <p className="text-xs text-[#5B3F91]/75 font-medium leading-relaxed mb-3">
                  Tell Penny what you&apos;re saving for (e.g. Laptop ₹50,000). Penny crafts a personalized roadmap to reach it faster.
                </p>
              </div>
              <div className="pt-3 border-t border-[#FAF9FF] text-[11px] font-bold text-[#8064C8]">
                Savings Roadmap
              </div>
            </div>

            {/* Step 05 */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE3FA] shadow-md shadow-purple-500/5 hover:shadow-xl hover:border-[#C9B9F2] transition-all flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#8064C8] bg-[#EAE3FA] px-2.5 py-1 rounded-full">
                    05
                  </span>
                </div>
                <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-2">
                  Reach Your Goal
                </h3>
                <p className="text-xs text-[#5B3F91]/75 font-medium leading-relaxed mb-3">
                  Build better habits and level up: <span className="font-bold">XP → Streaks → Milestones → Goal</span>. Penny celebrates every win!
                </p>
              </div>
              <div className="pt-3 border-t border-[#FAF9FF] text-[11px] font-bold text-[#8064C8]">
                XP + Badges + Level Up
              </div>
            </div>

          </div>

          {/* Connected Flow Line Summary Tagline */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-[#EAE3FA] shadow-sm font-handwritten text-2xl text-[#8064C8]">
              <span>Penny guides you along the way</span>
              <Image
                src="/heart.png"
                alt="Heart"
                width={20}
                height={20}
                style={{ width: "auto", height: "auto" }}
                className="inline-block h-5 w-auto object-contain ml-1"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 5. UNDERSTAND YOUR MONEY & UPLOAD FLOW */}
      <section id="features" className="relative z-10 py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        
        {/* Experience 1: Understand Your Money */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE3FA] text-xs font-bold text-[#8064C8] mb-4">
              <PieChart className="w-3.5 h-3.5" />
              <span>Smart Dashboard</span>
            </div>
            <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91] mb-4 leading-tight">
              Understand Your Money
            </h2>
            <p className="text-base text-[#5B3F91]/80 font-medium mb-6 leading-relaxed">
              See where every rupee goes at a glance without complex spreadsheets. Penny calculates your income, expenses, and savings automatically.
            </p>

            <ul className="space-y-3">
              {['Real-time cash flow overview', 'Categorized monthly breakdown', 'Visual spending insights'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-[#5B3F91]">
                  <CheckCircle2 className="w-5 h-5 text-[#8064C8] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tiny Mock Dashboard Card */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3FA] shadow-lg shadow-purple-500/5">
              <div className="flex items-center justify-between border-b border-[#EAE3FA] pb-4 mb-6">
                <div>
                  <h4 className="text-sm font-bold text-[#5B3F91]">Monthly Overview</h4>
                  <p className="text-xs text-[#5B3F91]/60">September 2026</p>
                </div>
                <span className="px-3 py-1 bg-[#EAE3FA] text-[#8064C8] rounded-full text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  On Track
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3.5 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA]">
                  <span className="block text-[11px] font-bold text-[#5B3F91]/60">Income</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#5B3F91]">₹30,000</span>
                </div>
                <div className="p-3.5 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA]">
                  <span className="block text-[11px] font-bold text-[#5B3F91]/60">Spent</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#8064C8]">₹21,400</span>
                </div>
                <div className="p-3.5 bg-[#EAE3FA]/60 rounded-2xl border border-[#C9B9F2]">
                  <span className="block text-[11px] font-bold text-[#8064C8]">Saved</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#8064C8]">₹8,600</span>
                </div>
              </div>

              {/* Most Spent On List */}
              <div>
                <h5 className="text-xs font-bold text-[#5B3F91]/70 mb-3 uppercase tracking-wider">
                  Most Spent On
                </h5>
                <div className="space-y-2.5">
                  {[
                    { icon: Utensils, name: "Food", amount: "₹5,200", percent: "65%" },
                    { icon: ShoppingBag, name: "Shopping", amount: "₹3,400", percent: "40%" },
                    { icon: Car, name: "Travel", amount: "₹2,100", percent: "25%" }
                  ].map((cat, i) => {
                    const IconComp = cat.icon;
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#FAF9FF] rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-[#5B3F91]">{cat.name}</span>
                        </div>
                        <span className="text-sm font-extrabold text-[#5B3F91]">{cat.amount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Experience 2: Upload • Review • Confirm */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#EAE3FA] shadow-xl shadow-purple-500/5">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE3FA] text-xs font-bold text-[#8064C8] mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>Full Control</span>
            </div>
            <h3 className="font-handwritten text-3xl sm:text-4xl font-bold text-[#5B3F91] mb-3">
              Upload. Review. Confirm.
            </h3>
            <p className="text-sm sm:text-base text-[#5B3F91]/80 font-medium">
              Upload your bank statement or enter expenses manually. PennyPal organizes everything before adding it to your finances — you are always in control.
            </p>
          </div>

          {/* 4 Step Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {[
              { icon: FileText, title: "Upload Statement", desc: "PDF or CSV bank statements" },
              { icon: Search, title: "Penny Analyzes", desc: "AI categorizes transactions" },
              { icon: Edit3, title: "Review Items", desc: "Verify and adjust details" },
              { icon: CheckCircle2, title: "Confirm & Save", desc: "Added to your dashboard" }
            ].map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="p-6 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA] text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center mb-3">
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#8064C8] mb-1">Step 0{idx + 1}</span>
                  <h4 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-1">{step.title}</h4>
                  <p className="text-xs text-[#5B3F91]/70 font-medium">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* 6. DEFEAT YOUR SPENDING BOSSES */}
      <section className="relative z-10 py-20 px-6 sm:px-12 bg-[#FAF9FF] border-t border-[#EAE3FA]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-4 py-1.5 rounded-full bg-[#EAE3FA] text-xs font-bold text-[#8064C8] uppercase tracking-wider inline-block mb-3">
              Gamified Finance
            </span>
            <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91] mb-4 leading-tight">
              Defeat Your Spending Bosses
            </h2>
            <p className="text-base text-[#5B3F91]/80 font-medium">
              Penny identifies your biggest spending categories and turns them into boss fights. Reduce your spending to defeat the boss!
            </p>
          </div>

          {/* Bosses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Utensils, name: "FOOD BOSS", spent: "₹5,200 spent", hp: "80%", status: "I'm getting stronger...", bar: "w-[80%] bg-[#8064C8]" },
              { icon: ShoppingBag, name: "SHOPPING BOSS", spent: "₹3,400 spent", hp: "60%", status: "HP Weakened!", bar: "w-[60%] bg-[#A98FE3]" },
              { icon: Car, name: "TRAVEL BOSS", spent: "₹2,100 spent", hp: "40%", status: "Low Energy!", bar: "w-[40%] bg-[#8064C8]" },
              { icon: Gamepad2, name: "ENTERTAINMENT", spent: "₹1,500 spent", hp: "25%", status: "Almost Defeated!", bar: "w-[25%] bg-[#A98FE3]" }
            ].map((boss, idx) => {
              const BossIcon = boss.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-[#EAE3FA] shadow-md shadow-purple-500/5 hover:scale-[1.02] transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center">
                      <BossIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold text-[#8064C8] bg-[#EAE3FA] px-2.5 py-1 rounded-full">
                      {boss.hp} HP
                    </span>
                  </div>
                  <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91] mb-1">{boss.name}</h3>
                  <p className="text-xs font-semibold text-[#5B3F91]/60 mb-3">{boss.spent}</p>
                  
                  {/* Health Bar */}
                  <div className="w-full h-3 bg-[#EAE3FA] rounded-full overflow-hidden mb-3">
                    <div className={`h-full ${boss.bar} rounded-full transition-all`} />
                  </div>
                  <span className="text-[11px] font-bold text-[#8064C8] italic">
                    &quot;{boss.status}&quot;
                  </span>
                </div>
              );
            })}
          </div>

          {/* Victory Banner */}
          <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl border-2 border-[#8064C8]/30 shadow-lg text-center flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-handwritten text-3xl font-bold text-[#5B3F91]">BOSS DEFEATED!</h4>
              <p className="text-xs font-medium text-[#5B3F91]/80">You saved ₹1,400 this week on food delivery!</p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. GOALS BECOME QUESTS */}
      <section className="relative z-10 py-20 px-6 sm:px-12 bg-white border-t border-[#EAE3FA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5">
              <span className="px-3.5 py-1.5 rounded-full bg-[#EAE3FA] text-xs font-bold text-[#8064C8] uppercase tracking-wider inline-block mb-4">
                Milestone Quests
              </span>
              <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91] mb-4 leading-tight">
                Goals Become Quests
              </h2>
              <p className="text-base text-[#5B3F91]/80 font-medium mb-6 leading-relaxed">
                Don&apos;t just save money. Go on an exciting quest. Enter your dream milestone, and Penny analyzes your spending to craft the fastest path.
              </p>
              
              <div className="p-4 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA] flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-[#8064C8] shrink-0" />
                <p className="text-xs font-medium text-[#5B3F91]">
                  &quot;If you reduce food delivery by ₹700/month, you&apos;ll reach your goal 12 days sooner.&quot;
                </p>
              </div>
            </div>

            {/* Laptop Quest Mock Card */}
            <div className="lg:col-span-7">
              <div className="bg-[#FAF9FF] p-8 rounded-3xl border border-[#EAE3FA] shadow-lg">
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#8064C8] text-white rounded-2xl flex items-center justify-center">
                      <Laptop className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91]">LAPTOP QUEST</h3>
                      <p className="text-xs font-medium text-[#5B3F91]/60">New MacBook Air — ₹50,000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#F6C9D5] text-[#5B3F91] rounded-full text-xs font-extrabold">
                      XP +50
                    </span>
                    <span className="px-3 py-1 bg-[#EAE3FA] text-[#8064C8] rounded-full text-xs font-extrabold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>7 Day Streak</span>
                    </span>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                  <div className="p-3 bg-white rounded-xl border border-[#EAE3FA]">
                    <span className="block text-[10px] font-bold text-[#5B3F91]/60 uppercase">Goal</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#5B3F91]">₹50,000</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#EAE3FA]">
                    <span className="block text-[10px] font-bold text-[#5B3F91]/60 uppercase">Current</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#8064C8]">₹18,500</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#EAE3FA]">
                    <span className="block text-[10px] font-bold text-[#5B3F91]/60 uppercase">Remaining</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#5B3F91]">₹31,500</span>
                  </div>
                </div>

                {/* Quest Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-[#5B3F91] mb-1.5">
                    <span>Progress</span>
                    <span>37% Complete</span>
                  </div>
                  <div className="w-full h-4 bg-[#EAE3FA] rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-[#8064C8] rounded-full w-[37%]" />
                  </div>
                </div>

                {/* Next Milestone */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EAE3FA] text-xs font-bold text-[#5B3F91]">
                  <span>NEXT MILESTONE: ₹20,000</span>
                  <span className="text-[#8064C8]">Estimated time: 4 mos 12 days</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. YOUR MONEY HAS A CALENDAR */}
      <section className="relative z-10 py-20 px-6 sm:px-12 bg-[#FAF9FF] border-t border-[#EAE3FA]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3.5 py-1.5 rounded-full bg-[#EAE3FA] text-xs font-bold text-[#8064C8] uppercase tracking-wider inline-block mb-3">
              Visual Timeline
            </span>
            <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91] mb-3">
              Your Money Has a Calendar
            </h2>
            <p className="text-sm sm:text-base text-[#5B3F91]/80 font-medium">
              See where your money went — day by day. Color intensity represents spending output.
            </p>
          </div>

          {/* Interactive Calendar Mock */}
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3FA] shadow-xl shadow-purple-500/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91]">September 2026</h3>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Low</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Moderate</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> High</span>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#5B3F91]/60 mb-2">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (
                <div key={i} className="py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {[
                { day: 1, color: "bg-emerald-100 text-emerald-800" },
                { day: 2, color: "bg-emerald-100 text-emerald-800" },
                { day: 3, color: "bg-amber-100 text-amber-800" },
                { day: 4, color: "bg-rose-100 text-rose-800" },
                { day: 5, color: "bg-emerald-100 text-emerald-800" },
                { day: 6, color: "bg-amber-100 text-amber-800" },
                { day: 7, color: "bg-emerald-100 text-emerald-800" },
                { day: 8, color: "bg-emerald-100 text-emerald-800" },
                { day: 9, color: "bg-rose-100 text-rose-800" },
                { day: 10, color: "bg-emerald-100 text-emerald-800" },
                { day: 11, color: "bg-[#8064C8] text-white ring-2 ring-[#8064C8] shadow-md" },
                { day: 12, color: "bg-rose-100 text-rose-800" },
                { day: 13, color: "bg-amber-100 text-amber-800" },
                { day: 14, color: "bg-emerald-100 text-emerald-800" },
              ].map((item) => (
                <button
                  key={item.day}
                  onClick={() => setSelectedDay(item.day)}
                  className={`p-3 rounded-2xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${item.color}`}
                >
                  {item.day}
                </button>
              ))}
            </div>

            {/* Selected Day Info */}
            <div className="mt-6 p-4 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA] flex items-center justify-between text-xs font-bold text-[#5B3F91]">
              <span>Sept {selectedDay}, 2026 Details:</span>
              <span className="text-[#8064C8]">Spent: ₹420 (Lunch & Transit)</span>
            </div>
          </div>

        </div>
      </section>

      {/* 9. PENNY COACH & VOICE CHAT */}
      <section className="relative z-10 py-20 px-6 sm:px-12 bg-white border-t border-[#EAE3FA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5">
              <span className="px-3.5 py-1.5 rounded-full bg-[#EAE3FA] text-xs font-bold text-[#8064C8] uppercase tracking-wider inline-block mb-3">
                AI Companion
              </span>
              <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91] mb-4">
                Ask Penny
              </h2>
              <p className="text-base text-[#5B3F91]/80 font-medium mb-6 leading-relaxed">
                Got a money question? Just ask Penny. Whether typing or using speech-to-text, Penny provides instant guidance tailored to your habits.
              </p>

              <div className="flex items-center gap-3 p-4 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA]">
                <Mic className="w-6 h-6 text-[#8064C8]" />
                <div>
                  <h4 className="font-handwritten text-2xl font-bold text-[#5B3F91]">Talk to Penny</h4>
                  <p className="text-xs text-[#5B3F91]/70 font-medium">Type it. Say it. Ask Penny.</p>
                </div>
              </div>
            </div>

            {/* Fake Chat Widget */}
            <div className="lg:col-span-7">
              <div className="bg-[#FAF9FF] rounded-3xl border border-[#EAE3FA] shadow-xl p-6 sm:p-8 max-w-md mx-auto">
                <div className="flex items-center gap-3 border-b border-[#EAE3FA] pb-4 mb-6">
                  <div className="w-10 h-10 bg-[#8064C8] text-white rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-handwritten text-xl font-bold text-[#5B3F91]">Penny</h4>
                    <span className="text-[10px] text-emerald-600 font-semibold">Online & Ready to help</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-end">
                    <div className="bg-[#8064C8] text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-medium max-w-[80%] shadow-sm">
                      &quot;Why am I spending so much?&quot;
                    </div>
                  </div>
                  <div className="flex justify-start gap-2">
                    <div className="w-7 h-7 bg-[#EAE3FA] text-[#8064C8] rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-[#EAE3FA] text-xs font-medium text-[#5B3F91] max-w-[85%] shadow-sm leading-relaxed">
                      You spent ₹2,100 more on food this month. Want me to create a 7-day Food Boss challenge?
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask Penny anything..."
                    className="w-full pl-4 pr-10 py-3 bg-white rounded-full border border-[#EAE3FA] text-xs text-[#5B3F91] focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                  />
                  <button className="absolute right-3 text-[#8064C8] hover:scale-110 transition-transform">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. STREAKS + XP + ACHIEVEMENTS */}
      <section className="relative z-10 py-20 px-6 sm:px-12 bg-[#FAF9FF] border-t border-[#EAE3FA]">
        <div className="max-w-7xl mx-auto text-center">
          
          <span className="px-3.5 py-1.5 rounded-full bg-[#EAE3FA] text-xs font-bold text-[#8064C8] uppercase tracking-wider inline-block mb-3">
            Addictive Habits
          </span>
          <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91] mb-3">
            Streaks + XP + Achievements
          </h2>
          <p className="text-sm sm:text-base text-[#5B3F91]/80 font-medium max-w-xl mx-auto mb-12">
            Make good money habits addictive. Earn XP for every wise financial decision and unlock badges.
          </p>

          <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-[#EAE3FA] shadow-xl">
            {/* Level Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-[#EAE3FA] pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-handwritten text-2xl font-bold text-[#5B3F91]">12 DAY STREAK</h4>
                  <p className="text-xs text-[#5B3F91]/60 font-medium">Keep saving daily!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#8064C8] uppercase">LEVEL 07</span>
                <h4 className="font-handwritten text-2xl font-bold text-[#5B3F91]">Money Explorer</h4>
              </div>
            </div>

            {/* XP Bar */}
            <div className="mb-8 text-left">
              <div className="flex justify-between text-xs font-bold text-[#5B3F91] mb-1.5">
                <span>XP Progress</span>
                <span>820 / 1000 XP</span>
              </div>
              <div className="w-full h-3.5 bg-[#EAE3FA] rounded-full overflow-hidden">
                <div className="h-full bg-[#8064C8] rounded-full w-[82%]" />
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { icon: Trophy, title: "First ₹1,000 Saved" },
                { icon: Flame, title: "7 Day Streak" },
                { icon: Swords, title: "Boss Defeated" },
                { icon: Target, title: "First Quest Done" },
                { icon: Wallet, title: "Budget Master" }
              ].map((badge, idx) => {
                const BadgeIcon = badge.icon;
                return (
                  <div key={idx} className="p-3 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA] text-center flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-[#EAE3FA] text-[#8064C8] flex items-center justify-center mb-1.5">
                      <BadgeIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#5B3F91]">{badge.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 11. SMART NOTIFICATIONS */}
      <section className="relative z-10 py-16 px-6 sm:px-12 bg-white border-t border-[#EAE3FA]">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="p-8 bg-[#FAF9FF] rounded-3xl border border-[#EAE3FA] shadow-lg flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 bg-[#EAE3FA] text-[#8064C8] rounded-2xl flex items-center justify-center shrink-0">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold text-[#8064C8] uppercase tracking-wider">
                  Smart Notifications (Opt-in)
                </span>
              </div>
              <h3 className="font-handwritten text-2xl sm:text-3xl font-bold text-[#5B3F91] mb-1">
                Penny knows when to remind you.
              </h3>
              <p className="text-xs sm:text-sm text-[#5B3F91]/80 font-medium leading-relaxed">
                &quot;You&apos;re near your usual shopping area. You have ₹1,200 left in your shopping budget this month. Still want to spend?&quot;
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 12. FINAL CTA SECTION */}
      <section className="relative z-10 py-24 px-6 sm:px-12 bg-[#FAF9FF] border-t border-[#EAE3FA] text-center overflow-hidden">
        
        {/* Soft Lavender Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          
          {/* Animated Walking Penguin Track */}
          <div className="relative w-full max-w-md h-44 sm:h-52 overflow-hidden mb-4 flex items-end justify-center">
            {/* Soft purple hill backdrop */}
            <div className="absolute bottom-0 w-[120%] h-24 bg-[#EAE3FA]/80 rounded-[50%] blur-xs translate-y-6 pointer-events-none" />

            {/* Horizontal Walk Loop Track */}
            <div className="relative w-full h-full overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-full flex items-end animate-penguin-walk">
                <div className="relative w-36 h-40 sm:w-44 sm:h-48 shrink-0">
                  <video
                    src="/login_penguin.webm"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <h2 className="font-handwritten text-5xl sm:text-6xl font-bold text-[#5B3F91] mb-4 tracking-tight">
            Ready to meet your money buddy?
          </h2>

          <p className="text-lg text-[#5B3F91]/90 mb-8 font-medium flex items-center justify-center gap-2">
            <span>Your money journey starts here.</span>
            <Image
              src="/heart.png"
              alt="Heart"
              width={24}
              height={24}
              style={{ width: "auto", height: "auto" }}
              className="inline-block h-6 w-auto object-contain"
            />
          </p>

          <Link
            href="/signup"
            className="px-10 py-5 bg-[#8064C8] hover:bg-[#6F53B7] text-white font-bold rounded-full shadow-xl shadow-[#8064C8]/30 flex items-center gap-3 transition-all hover:scale-105 text-lg"
          >
            <span>Start My Journey</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-white border-t border-[#EAE3FA] py-8 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logoo.png"
              alt="PennyPal Logo"
              width={140}
              height={45}
              style={{ width: "auto", height: "auto" }}
              className="h-9 object-contain"
            />
          </div>
          <p className="text-xs font-semibold text-[#5B3F91]/60 flex items-center gap-1">
            <span>© {new Date().getFullYear()} PennyPal. All rights reserved. Your friendly AI money buddy.</span>
            <Image
              src="/heart.png"
              alt="Heart"
              width={16}
              height={16}
              style={{ width: "auto", height: "auto" }}
              className="inline-block h-4 w-auto object-contain"
            />
          </p>
          <div className="flex gap-6 text-xs font-semibold text-[#5B3F91]">
            <Link href="/signup" className="hover:text-[#8064C8]">Sign Up</Link>
            <Link href="/login" className="hover:text-[#8064C8]">Sign In</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
