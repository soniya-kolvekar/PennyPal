"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  Check,
  CheckCircle2,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Utensils,
  Car,
  Tv,
  Zap,
  TrendingUp,
  Wallet,
  X,
  ChevronDown,
  FileSpreadsheet,
  Building2,
  Heart
} from "lucide-react";

const INITIAL_TRANSACTIONS = [
  { id: "1", date: "Sep 01", desc: "SWIGGY FOOD DELIVERY", amount: 450, type: "Expense", category: "Food & Dining" },
  { id: "2", date: "Sep 02", desc: "AMAZON INDIA", amount: 1800, type: "Expense", category: "Shopping" },
  { id: "3", date: "Sep 03", desc: "MONTHLY SALARY CREDIT", amount: 50000, type: "Income", category: "Salary" },
  { id: "4", date: "Sep 04", desc: "UBER RIDE", amount: 320, type: "Expense", category: "Travel" },
  { id: "5", date: "Sep 05", desc: "STARBUCKS COFFEE", amount: 280, type: "Expense", category: "Food & Dining" },
  { id: "6", date: "Sep 06", desc: "NETFLIX SUBSCRIPTION", amount: 499, type: "Expense", category: "Entertainment" },
  { id: "7", date: "Sep 08", desc: "GROCERY SUPERMARKET", amount: 2450, type: "Expense", category: "Groceries" },
  { id: "8", date: "Sep 10", desc: "ELECTRICITY BILL", amount: 1650, type: "Expense", category: "Utilities" },
  { id: "9", date: "Sep 12", desc: "ZOMATO GOURMET", amount: 620, type: "Expense", category: "Food & Dining" },
  { id: "10", date: "Sep 14", desc: "FREELANCE DESIGN FEE", amount: 12500, type: "Income", category: "Income" },
  { id: "11", date: "Sep 16", desc: "BOOKMYSHOW MOVIES", amount: 750, type: "Expense", category: "Entertainment" },
  { id: "12", date: "Sep 18", desc: "PHARMACY MEDICAL", amount: 430, type: "Expense", category: "Health" }
];

const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Groceries",
  "Travel",
  "Entertainment",
  "Utilities",
  "Health",
  "Salary",
  "Income",
  "Other"
];

function getCategoryIcon(category) {
  switch (category) {
    case "Food & Dining":
      return <Utensils className="w-5 h-5 text-[#8064C8]" />;
    case "Shopping":
      return <ShoppingBag className="w-5 h-5 text-[#8064C8]" />;
    case "Travel":
      return <Car className="w-5 h-5 text-[#8064C8]" />;
    case "Entertainment":
      return <Tv className="w-5 h-5 text-[#8064C8]" />;
    case "Salary":
    case "Income":
      return <TrendingUp className="w-5 h-5 text-emerald-600" />;
    case "Utilities":
    case "Groceries":
    case "Health":
    default:
      return <Wallet className="w-5 h-5 text-[#8064C8]" />;
  }
}

export default function UploadPage() {
  const [step, setStep] = useState("upload"); // 'upload' | 'analyzing' | 'review' | 'success'
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [isDragging, setIsDragging] = useState(false);
  
  // Modals
  const [editingTx, setEditingTx] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({
    date: "Sep 20",
    desc: "",
    amount: "",
    type: "Expense",
    category: "Shopping"
  });

  const fileInputRef = useRef(null);

  // Trigger file simulation
  const handleFileSelect = (file) => {
    if (!file) return;
    setFileName(file.name || "September_Statement.pdf");
    setStep("analyzing");
    setProgress(0);
  };

  // Simulate analysis progress
  useEffect(() => {
    if (step === "analyzing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep("review"), 500);
            return 100;
          }
          return prev + 12;
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Transaction editing handlers
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingTx) return;
    setTransactions((prev) =>
      prev.map((t) => (t.id === editingTx.id ? editingTx : t))
    );
    setEditingTx(null);
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTx.desc || !newTx.amount) return;
    const created = {
      id: Date.now().toString(),
      date: newTx.date || "Sep 20",
      desc: newTx.desc,
      amount: parseFloat(newTx.amount) || 0,
      type: newTx.type,
      category: newTx.category
    };
    setTransactions((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewTx({
      date: "Sep 20",
      desc: "",
      amount: "",
      type: "Expense",
      category: "Shopping"
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Background Soft Lavender Patches */}
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
            <Link href="/upload" className="text-[#8064C8] transition-colors">
              Upload
            </Link>
            <a href="#how-it-works" className="hover:text-[#8064C8] transition-colors">
              How It Works
            </a>
          </div>

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

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 sm:px-12 py-10 flex flex-col justify-center">
        
        {/* ========================================================================= */}
        {/* STEP 1: UPLOAD STATE */}
        {/* ========================================================================= */}
        {step === "upload" && (
          <div className="flex flex-col items-center text-center animate-fade-in">
            {/* Heading */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91]">
                Let&apos;s get your money organized.
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
            <p className="text-base sm:text-lg text-[#5B3F91]/80 max-w-xl font-medium mb-8">
              Upload your bank statement and Penny will turn it into an easy-to-understand spending history.
            </p>

            {/* Layout Grid: Upload Card + Penny Companion */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Big Cute Upload Card */}
              <div className="lg:col-span-8 flex flex-col items-center">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-8 sm:p-12 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center text-center shadow-lg hover:shadow-xl ${
                    isDragging
                      ? "border-[#8064C8] bg-[#EAE3FA]/40 scale-[1.01]"
                      : "border-[#C9B9F2] hover:border-[#8064C8]"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    accept=".pdf,.csv,.xlsx,.xls"
                    className="hidden"
                  />

                  <div className="w-16 h-16 bg-[#EAE3FA] rounded-2xl flex items-center justify-center text-[#8064C8] mb-4 shadow-sm">
                    <FileText className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-[#5B3F91] mb-1">
                    Drop your statement here
                  </h3>
                  <p className="text-sm font-semibold text-[#8064C8] mb-4">
                    or
                  </p>

                  <button
                    type="button"
                    className="px-6 py-3 bg-[#8064C8] hover:bg-[#6F53B7] text-white font-bold text-sm rounded-full shadow-md shadow-[#8064C8]/25 transition-all hover:scale-105 mb-5"
                  >
                    Browse Files
                  </button>

                  <div className="flex items-center gap-2 text-xs font-bold text-[#5B3F91]/70 bg-[#FAF9FF] px-4 py-1.5 rounded-full border border-[#EAE3FA]">
                    <span>PDF supported</span>
                    <span>•</span>
                    <span>Excel supported</span>
                  </div>
                </div>

                {/* Local-first Privacy Guarantee */}
                <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#5B3F91]/80 bg-white/60 px-4 py-2 rounded-full border border-[#EAE3FA] shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#8064C8]" />
                  <span>Your statement stays on your device.</span>
                </div>

                {/* Direct Manual Entry Banner */}
                <div className="mt-5 w-full p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#EAE3FA] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#EAE3FA] rounded-xl flex items-center justify-center text-[#8064C8] shrink-0">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#5B3F91]">Don&apos;t have a statement document?</p>
                      <p className="text-xs text-[#5B3F91]/70 font-medium">Add transactions directly by hand.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFileName("Manual Entry");
                      setStep("review");
                      setShowAddModal(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#FAF9FF] hover:bg-[#EAE3FA] text-[#8064C8] font-bold text-xs sm:text-sm rounded-full border border-[#C9B9F2] shadow-xs transition-all hover:scale-105 shrink-0"
                  >
                    Add Expenses Manually →
                  </button>
                </div>
              </div>

              {/* Right Column: Penny Companion holding document */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center">
                <div className="relative flex flex-col items-center">
                  {/* Penny Speech Bubble */}
                  <div className="bg-white px-5 py-3 rounded-2xl border border-[#EAE3FA] shadow-md text-xs sm:text-sm font-bold text-[#5B3F91] mb-3 relative animate-bounce">
                    <span>Give me your statement! I&apos;l take a look.</span>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-[#EAE3FA] transform rotate-45" />
                  </div>

                  {/* Penguin Video Container */}
                  <div className="relative w-65 h-69 sm:w-89 sm:h-80">
                    <video
                      src="/hugging_coin.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain filter drop-shadow-md"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ANALYZING STATE */}
        {/* ========================================================================= */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center text-center max-w-lg mx-auto w-full animate-fade-in">
            {/* Cute Thinking Penguin */}
            <div className="relative w-52 h-56 sm:w-60 sm:h-64 mb-4">
              <video
                src="/hugging_coin.webm"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>

            {/* Selected File Card */}
            <div className="w-full p-4 bg-white rounded-2xl border border-[#EAE3FA] shadow-sm flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EAE3FA] text-[#8064C8] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#5B3F91]">{fileName}</p>
                  <p className="text-xs text-[#5B3F91]/70 font-medium">Bank Statement PDF</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-[#8064C8]">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-[#EAE3FA] rounded-full overflow-hidden mb-6 shadow-inner">
              <div
                className="h-full bg-[#8064C8] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <h3 className="font-handwritten text-3xl font-bold text-[#5B3F91] mb-4">
              Penny is reading your statement...
            </h3>

            {/* Analysis Checklist */}
            <div className="w-full p-6 bg-white/80 rounded-2xl border border-[#EAE3FA] shadow-md flex flex-col gap-3 text-left">
              <div className="flex items-center gap-3">
                {progress >= 25 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#C9B9F2] shrink-0" />
                )}
                <span className={`text-sm font-bold ${progress >= 25 ? "text-[#5B3F91]" : "text-[#5B3F91]/50"}`}>
                  Finding transactions
                </span>
              </div>

              <div className="flex items-center gap-3">
                {progress >= 50 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#C9B9F2] shrink-0" />
                )}
                <span className={`text-sm font-bold ${progress >= 50 ? "text-[#5B3F91]" : "text-[#5B3F91]/50"}`}>
                  Reading dates & amounts
                </span>
              </div>

              <div className="flex items-center gap-3">
                {progress >= 75 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#C9B9F2] shrink-0" />
                )}
                <span className={`text-sm font-bold ${progress >= 75 ? "text-[#5B3F91]" : "text-[#5B3F91]/50"}`}>
                  Categorizing expenses
                </span>
              </div>

              <div className="flex items-center gap-3">
                {progress >= 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#C9B9F2] shrink-0 animate-pulse" />
                )}
                <span className={`text-sm font-bold ${progress >= 100 ? "text-[#5B3F91]" : "text-[#5B3F91]/50"}`}>
                  Organizing transactions
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: REVIEW & EDIT STATE */}
        {/* ========================================================================= */}
        {step === "review" && (
          <div className="flex flex-col w-full animate-fade-in">
            
            {/* Review Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-handwritten text-3xl sm:text-4xl font-bold text-[#5B3F91]">
                    Penny found these transactions
                  </h1>
                 
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#5B3F91]/70">
                  {transactions.length} transactions found from <span className="text-[#8064C8] font-bold">{fileName || "September_Statement.pdf"}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-[#8064C8]/25 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add missing transaction</span>
              </button>
            </div>

            {/* Transaction Cards List Grid */}
            {transactions.length === 0 ? (
              <div className="p-10 bg-white/90 rounded-3xl border border-[#EAE3FA] text-center flex flex-col items-center justify-center mb-8 shadow-sm">
                <div className="w-14 h-14 bg-[#EAE3FA] text-[#8064C8] rounded-2xl flex items-center justify-center mb-3">
                  <Edit3 className="w-7 h-7" />
                </div>
                <h3 className="font-handwritten text-3xl font-bold text-[#5B3F91] mb-1">
                  No transactions added yet
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-[#5B3F91]/70 mb-5">
                  Click below to start entering your expenses manually!
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-[#8064C8]/25 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Transaction</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-8">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 bg-white/95 rounded-2xl border border-[#EAE3FA] shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 bg-[#EAE3FA] rounded-2xl flex items-center justify-center shrink-0">
                        {getCategoryIcon(tx.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#5B3F91] truncate">{tx.desc}</p>
                        <p className="text-xs text-[#5B3F91]/70 font-medium">
                          {tx.date} • <span className="text-[#8064C8] font-semibold">{tx.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-sm font-extrabold ${
                          tx.type === "Income" ? "text-emerald-600" : "text-[#5B3F91]"
                        }`}
                      >
                        {tx.type === "Income" ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                      </span>

                      <div className="flex items-center gap-1 opacity-90 sm:opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setEditingTx({ ...tx })}
                          className="p-1.5 hover:bg-[#EAE3FA] text-[#8064C8] rounded-lg transition-colors"
                          title="Edit transaction"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Confirmation Footer Bar */}
            <div className="p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-[#EAE3FA] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center gap-4 text-left">
                <div className="relative w-20 h-20 shrink-0 hidden sm:block">
                  <video
                    src="/hugging_coin.webm"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain filter drop-shadow-xs"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-0.5 bg-[#EAE3FA] text-[#8064C8] text-xs font-extrabold rounded-full">
                      {transactions.length} transactions ready to import
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5B3F91]/80 font-medium">
                    Everything looks good? Once confirmed, these transactions will be added to your history.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  className="flex-1 sm:flex-none px-4 py-3 bg-[#FAF9FF] hover:bg-[#EAE3FA] text-[#5B3F91] text-xs sm:text-sm font-bold rounded-full border border-[#EAE3FA] transition-colors"
                >
                  ← Re-upload
                </button>
                <button
                  type="button"
                  onClick={() => setStep("success")}
                  className="flex-1 sm:flex-none px-6 py-3 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-[#8064C8]/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Confirm Import</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: CELEBRATION / SUCCESS STATE */}
        {/* ========================================================================= */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center max-w-md mx-auto w-full animate-fade-in py-8">
            
            {/* Celebrating Penguin Video */}
            <div className="relative w-64 h-68 sm:w-72 sm:h-76 mb-4">
              <video
                src="/landingpenguin.webm"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#EAE3FA] text-[#8064C8] rounded-full text-xs font-extrabold mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Import Successful</span>
            </div>

            <h1 className="font-handwritten text-5xl font-bold text-[#5B3F91] mb-2">
              You&apos;re all set!
            </h1>

            <p className="text-base font-semibold text-[#5B3F91]/80 mb-6 flex items-center justify-center gap-2">
              <span>{transactions.length} transactions added</span>
              <span>•</span>
              <span className="text-[#8064C8] font-bold">+120 XP earned</span>
              <Image
                src="/heart.png"
                alt="Heart"
                width={20}
                height={20}
                style={{ width: "auto", height: "auto" }}
                className="inline-block h-5 w-auto object-contain"
              />
            </p>

            <Link
              href="/"
              className="px-8 py-4 bg-[#8064C8] hover:bg-[#6F53B7] text-white font-bold text-base rounded-full shadow-xl shadow-[#8064C8]/30 flex items-center gap-3 transition-all hover:scale-105"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT TRANSACTION */}
      {/* ========================================================================= */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-[#5B3F91]/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE3FA] shadow-2xl p-6 animate-scale-up">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91]">
                Edit Transaction
              </h3>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="p-1 hover:bg-[#EAE3FA] text-[#5B3F91] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5B3F91] mb-1">Date</label>
                <input
                  type="text"
                  value={editingTx.date}
                  onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B3F91] mb-1">Description</label>
                <input
                  type="text"
                  value={editingTx.desc}
                  onChange={(e) => setEditingTx({ ...editingTx, desc: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5B3F91] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={editingTx.amount}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B3F91] mb-1">Type</label>
                  <select
                    value={editingTx.type}
                    onChange={(e) => setEditingTx({ ...editingTx, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B3F91] mb-1">Category</label>
                <select
                  value={editingTx.category}
                  onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-5 py-2.5 bg-[#FAF9FF] hover:bg-[#EAE3FA] text-[#5B3F91] text-xs font-bold rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD MISSING TRANSACTION */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#5B3F91]/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE3FA] shadow-2xl p-6 animate-scale-up">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-handwritten text-2xl font-bold text-[#5B3F91]">
                Add Transaction
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-[#EAE3FA] text-[#5B3F91] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5B3F91] mb-1">Date</label>
                <input
                  type="text"
                  placeholder="e.g. Sep 20"
                  value={newTx.date}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B3F91] mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Amazon, Salary"
                  required
                  value={newTx.desc}
                  onChange={(e) => setNewTx({ ...newTx, desc: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5B3F91] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    required
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B3F91] mb-1">Type</label>
                  <select
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B3F91] mb-1">Category</label>
                <select
                  value={newTx.category}
                  onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-[#FAF9FF] hover:bg-[#EAE3FA] text-[#5B3F91] text-xs font-bold rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all"
                >
                  Add Transaction
                </button>
              </div>
            </form>

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
            <span>© {new Date().getFullYear()} PennyPal. All rights reserved. Your statement stays local.</span>
          </p>
          <div className="flex gap-6 text-xs font-semibold text-[#5B3F91]">
            <Link href="/" className="hover:text-[#8064C8]">Home</Link>
            <Link href="/upload" className="hover:text-[#8064C8]">Upload</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
