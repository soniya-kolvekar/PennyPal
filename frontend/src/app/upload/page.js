"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AppNavbar from "../../components/AppNavbar";
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
  Heart,
  AlertTriangle,
  Loader2,
  Database,
  Link2
} from "lucide-react";
import { extractTextFromFile } from "../../../lib/statementExtractor";
import { getAuthToken } from "../../../lib/auth";
import { db } from "../../../lib/db";
import {
  stageImportBatch,
  confirmImportBatch,
  cancelImportBatch,
  detectPossibleDuplicates,
  getTransactions,
  getVaultId,
  bulkUpdateTransactionCategories,
  predictCategory
} from "../../../lib/vault";


const CATEGORIES = [
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

const SOURCES = [
  { value: "bank_statement", label: "Bank Statement" },
  { value: "manual_entry", label: "Manual Entry" },
  { value: "upi", label: "UPI (Google Pay / PhonePe)" },
  { value: "credit_card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" }
];

function getCategoryIcon(category) {
  switch (category) {
    case "Food":
      return <Utensils className="w-5 h-5 text-orange-500" />;
    case "Shopping":
      return <ShoppingBag className="w-5 h-5 text-purple-500" />;
    case "Transport":
      return <Car className="w-5 h-5 text-blue-500" />;
    case "Bills":
      return <Zap className="w-5 h-5 text-amber-500" />;
    case "Subscriptions":
      return <Tv className="w-5 h-5 text-indigo-500" />;
    case "Entertainment":
      return <Tv className="w-5 h-5 text-pink-500" />;
    case "Healthcare":
      return <Heart className="w-5 h-5 text-emerald-500" />;
    case "Education":
      return <FileText className="w-5 h-5 text-cyan-500" />;
    case "Rent":
      return <Building2 className="w-5 h-5 text-violet-500" />;
    case "Travel":
      return <Car className="w-5 h-5 text-sky-500" />;
    case "Personal":
      return <Sparkles className="w-5 h-5 text-teal-500" />;
    case "Other":
    default:
      return <Wallet className="w-5 h-5 text-[#8064C8]" />;
  }
}

export default function UploadPage() {
  const [step, setStep] = useState("upload"); // 'upload' | 'analyzing' | 'review' | 'success'
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentBatchId, setCurrentBatchId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("Extracting statement text...");
  const [duplicateMatches, setDuplicateMatches] = useState({});
  const [isConfirming, setIsConfirming] = useState(false);
  const [activeVaultTransactions, setActiveVaultTransactions] = useState([]);
  const [showActiveVaultDrawer, setShowActiveVaultDrawer] = useState(false);

  const loadActiveTransactions = () => {
    getTransactions({ status: "active" })
      .then((active) => {
        setActiveVaultTransactions(active || []);
      })
      .catch(() => {
        setActiveVaultTransactions([]);
      });
  };

  useEffect(() => {
    let isSubscribed = true;
    getTransactions({ status: "active" })
      .then((active) => {
        if (isSubscribed) {
          setActiveVaultTransactions(active || []);
        }
      })
      .catch(() => { });

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Modals
  const [editingTx, setEditingTx] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split("T")[0],
    desc: "",
    amount: "",
    type: "Expense",
    category: "Other",
    source: "manual_entry"
  });

  const fileInputRef = useRef(null);

  // Real client-side extraction and Express backend processing
  const handleFileSelect = async (file) => {
    if (!file) return;
    setFileName(file.name || "statement.pdf");
    setErrorMessage("");

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("Please sign in first so your transactions can be securely saved to your local vault.");
      setStep("upload");
      return;
    }

    setStep("analyzing");
    setProgress(15);
    setStatusMessage("Extracting text locally in browser...");

    try {
      // 1. Client-side extraction (PDF.js / FileReader)
      const extractedText = await extractTextFromFile(file);
      setProgress(40);
      setStatusMessage("Sending to secure processing gateway...");

      // 2. Call Express backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

      const res = await fetch(`${backendUrl}/api/analyze/statement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: extractedText,
          fileName: file.name,
        }),
      });

      const data = await res.json();
      setProgress(75);
      setStatusMessage("Saving candidates into local IndexedDB...");

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to analyze bank statement.");
      }

      const candidateTransactions = data.transactions || [];
      const batch = data.batch || { id: crypto.randomUUID(), fileName: file.name };
      setCurrentBatchId(batch.id);


      // 4. Run duplicate detection against active transactions in IndexedDB
      const duplicateScores = await detectPossibleDuplicates(candidateTransactions);
      const dupMap = {};
      duplicateScores.forEach((d) => {
        if (d.isDuplicateCandidate && d.possibleDuplicate) {
          dupMap[d.candidate.id] = d;
        }
      });
      setDuplicateMatches(dupMap);

      // Format for the review UI
      const formattedForUI = candidateTransactions.map((tx) => ({
        id: tx.id,
        date: tx.date,
        desc: tx.merchant || tx.originalDescription || "Unknown Transaction",
        amount: Math.abs(Number(tx.amount)),
        type: tx.type === "income" ? "Income" : "Expense",
        category: tx.category || "Other",
        source: tx.source || "bank_statement",
      }));

      setTransactions(formattedForUI);
      setProgress(100);
      setTimeout(() => setStep("review"), 500);
    } catch (err) {
      console.error("Upload & analysis error:", err);
      setErrorMessage(err.message || "Something went wrong while processing your statement.");
      setStep("upload");
    }
  };

  // Confirm import: Promote pending transactions to active in IndexedDB, then run hybrid categorization
  const handleConfirmImport = async () => {
    try {
      setIsConfirming(true);
      const canonical = transactions.map((t) => ({
        id: t.id,
        date: t.date,
        merchant: t.desc,
        amount: Number(t.amount),
        type: t.type.toLowerCase() === "income" ? "income" : "expense",
        category: t.category || "Other",
        source: t.source || "bank_statement",
        reconciledWith: t.reconciledWith || null,
      }));

      const batchId = currentBatchId || crypto.randomUUID();

      // 1. Commit confirmed transactions to local Dexie vault
      await confirmImportBatch(batchId, canonical);

      // 2. Run post-import hybrid AI & deterministic categorization
      const token = getAuthToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

      if (token) {
        try {
          const catRes = await fetch(`${backendUrl}/api/analyze/categorize`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              transactions: canonical
            })
          });

          if (catRes.ok) {
            const catData = await catRes.json();
            if (catData.success && Array.isArray(catData.transactions)) {
              // Update local IndexedDB records with the smart categorized categories
              await bulkUpdateTransactionCategories(catData.transactions);

              // Update in-memory state so dashboard and success view reflect categories immediately
              setTransactions(catData.transactions.map((ctx) => ({
                id: ctx.id,
                date: ctx.date,
                desc: ctx.merchant,
                amount: ctx.amount,
                type: ctx.type === "income" ? "Income" : "Expense",
                category: ctx.category,
                source: ctx.source,
                reconciledWith: ctx.reconciledWith,
              })));
            }
          }
        } catch (catErr) {
          console.warn("Post-import categorization network notification:", catErr);
          // Transactions are safely saved in local vault, proceed seamlessly
        }
      }

      await loadActiveTransactions();
      setStep("success");
    } catch (err) {
      console.error("Confirm import error:", err);
      alert("Failed to confirm import: " + err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  // Cancel import: Cleanly remove pending candidates from IndexedDB
  const handleCancelImport = async () => {
    try {
      if (currentBatchId) {
        await cancelImportBatch(currentBatchId);
      }
      setTransactions([]);
      setDuplicateMatches({});
      setCurrentBatchId(null);
      setStep("upload");
    } catch (err) {
      console.error("Cancel import error:", err);
      setStep("upload");
    }
  };

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

  const handleDelete = async (id) => {
    try {
      await db.transactions.delete(id);
    } catch { }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setDuplicateMatches((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleReconcile = (candidateId, matchedActiveId) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === candidateId
          ? { ...t, reconciledWith: matchedActiveId, isReconciled: true }
          : t
      )
    );
  };

  const handleDismissDuplicate = (candidateId) => {
    setDuplicateMatches((prev) => {
      const next = { ...prev };
      delete next[candidateId];
      return next;
    });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.desc || !newTx.amount) return;

    const batchId = currentBatchId || crypto.randomUUID();
    if (!currentBatchId) {
      setCurrentBatchId(batchId);
      // Removed staging here since we only stage on confirm now
    }

    const trimmedDesc = newTx.desc.trim();
    let assignedCategory = newTx.category || "Other";

    // Auto-predict category for manual entries if still set to 'Other' or uncategorized
    if (!assignedCategory || assignedCategory === "Other") {
      const predicted = predictCategory(trimmedDesc);
      if (predicted && predicted !== "Other") {
        assignedCategory = predicted;
      }
    }

    const created = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      date: newTx.date || new Date().toISOString().split("T")[0],
      desc: trimmedDesc,
      amount: parseFloat(newTx.amount) || 0,
      type: newTx.type,
      category: assignedCategory,
      source: newTx.source || "manual_entry",
      importBatchId: batchId,
    };


    const updatedList = [created, ...transactions];
    setTransactions(updatedList);

    // Run reconciliation & duplicate detection against active transactions + batch
    try {
      const candidatesForDetection = updatedList.map((t) => ({
        id: t.id,
        date: t.date,
        merchant: t.desc,
        amount: t.amount,
        type: t.type.toLowerCase(),
        category: t.category,
        source: t.source,
      }));

      const dupChecks = await detectPossibleDuplicates(candidatesForDetection);
      const dupMap = {};
      dupChecks.forEach((d) => {
        if (d.isDuplicateCandidate && d.possibleDuplicate) {
          dupMap[d.candidate.id] = d;
        }
      });
      setDuplicateMatches(dupMap);
    } catch (err) {
      console.warn("Duplicate check error:", err);
    }

    setShowAddModal(false);
    setNewTx({
      date: new Date().toISOString().split("T")[0],
      desc: "",
      amount: "",
      type: "Expense",
      category: "Other",
      source: "manual_entry"
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Background Soft Lavender Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#F6C9D5] rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* NAVBAR */}
      <AppNavbar />

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
            <p className="text-base sm:text-lg text-[#5B3F91]/80 max-w-xl font-medium mb-6">
              Upload your bank statement and Penny will turn it into an easy-to-understand spending history.
            </p>

            {errorMessage && (
              <div className="w-full max-w-xl mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-semibold shadow-xs animate-fade-in">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <p className="flex-1 text-left">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => setErrorMessage("")}
                  className="p-1 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Layout Grid: Upload Card + Penny Companion */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Left Column: Big Cute Upload Card */}
              <div className="lg:col-span-8 flex flex-col items-center">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-8 sm:p-12 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center text-center shadow-lg hover:shadow-xl ${isDragging
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

            <h3 className="font-handwritten text-3xl font-bold text-[#5B3F91] mb-1">
              Penny is reading your statement...
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[#8064C8] mb-5 animate-pulse">
              {statusMessage}
            </p>

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-handwritten text-3xl sm:text-4xl font-bold text-[#5B3F91]">
                    Penny found these transactions
                  </h1>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#5B3F91]/70">
                  {transactions.length} transactions found from <span className="text-[#8064C8] font-bold">{fileName || "Manual Entry"}</span>
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

            {/* Active Vault Ledger Drawer (Explains why duplicates match) */}
            {activeVaultTransactions.length > 0 && (
              <div className="mb-6 p-4 bg-white/90 rounded-2xl border border-[#EAE3FA] shadow-xs">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setShowActiveVaultDrawer(!showActiveVaultDrawer)}
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-[#8064C8]" />
                    <span className="text-xs sm:text-sm font-bold text-[#5B3F91]">
                      Your Vault has {activeVaultTransactions.length} existing active transaction{activeVaultTransactions.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <button type="button" className="text-xs text-[#8064C8] font-bold flex items-center gap-1">
                    <span>{showActiveVaultDrawer ? "Hide" : "View"}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${showActiveVaultDrawer ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                </div>

                {showActiveVaultDrawer && (
                  <div className="mt-3 pt-3 border-t border-[#EAE3FA] grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {activeVaultTransactions.map((atx) => (
                      <div
                        key={atx.id}
                        className="p-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-[#5B3F91] truncate">{atx.merchant}</p>
                          <p className="text-[11px] text-[#5B3F91]/70">
                            {atx.date} • <span className="uppercase text-[10px] font-bold text-[#8064C8]">{atx.source || "manual"}</span>
                          </p>
                        </div>
                        <span className="font-extrabold text-[#5B3F91] shrink-0">
                          ₹{Number(atx.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 bg-[#EAE3FA] rounded-2xl flex items-center justify-center shrink-0">
                        {getCategoryIcon(tx.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-[#5B3F91] truncate">{tx.desc}</p>
                          {tx.source && (
                            <span className="px-2 py-0.5 bg-[#EAE3FA] text-[#5B3F91] text-[10px] font-bold rounded-md uppercase tracking-wider">
                              {tx.source.replace("_", " ")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#5B3F91]/70 font-medium mt-0.5">
                          {tx.date} • <span className="text-[#8064C8] font-semibold">{tx.category}</span>
                        </p>

                        {/* Reconciled Badge */}
                        {tx.isReconciled ? (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold truncate">
                              Reconciled with active record &quot;{duplicateMatches[tx.id]?.possibleDuplicate?.merchant}&quot;
                            </span>
                          </div>
                        ) : duplicateMatches[tx.id] ? (
                          <div className="mt-2.5 p-2.5 bg-amber-50/90 rounded-xl border border-amber-200 text-xs text-amber-900 flex flex-col gap-2 shadow-2xs">
                            <div className="flex items-start gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-amber-950">
                                  {duplicateMatches[tx.id].matchType === "reconciliation"
                                    ? "🔗 Reconciliation Opportunity"
                                    : duplicateMatches[tx.id].matchType === "batch_duplicate"
                                      ? "⚠️ Duplicate within Batch"
                                      : `⚠️ ${duplicateMatches[tx.id].duplicateScore}% Match with Active Record`}
                                </p>
                                <p className="text-amber-900 text-[11px] font-medium mt-0.5 leading-snug">
                                  {duplicateMatches[tx.id].reason}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1.5 border-t border-amber-200/80 flex-wrap">
                              {duplicateMatches[tx.id].matchType === "reconciliation" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReconcile(tx.id, duplicateMatches[tx.id].possibleDuplicate.id)
                                  }
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all text-[11px] flex items-center gap-1 shadow-2xs"
                                >
                                  <Link2 className="w-3 h-3" />
                                  <span>Reconcile & Merge</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(tx.id)}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-all text-[11px] flex items-center gap-1 shadow-2xs"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Discard Duplicate</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDismissDuplicate(tx.id)}
                                className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 font-semibold rounded-lg border border-amber-300 transition-colors text-[11px]"
                              >
                                Keep as Separate
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-sm font-extrabold ${tx.type === "Income" ? "text-emerald-600" : "text-[#5B3F91]"
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
                    Everything looks good? Once confirmed, these transactions will be safely stored in your local vault.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancelImport}
                  className="flex-1 sm:flex-none px-4 py-3 bg-[#FAF9FF] hover:bg-[#EAE3FA] text-[#5B3F91] text-xs sm:text-sm font-bold rounded-full border border-[#EAE3FA] transition-colors"
                >
                  ← Re-upload
                </button>
                <button
                  type="button"
                  disabled={isConfirming || transactions.length === 0}
                  onClick={handleConfirmImport}
                  className="flex-1 sm:flex-none px-6 py-3 bg-[#8064C8] hover:bg-[#6F53B7] disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-[#8064C8]/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Penny is categorizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Import</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
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

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-[#8064C8] hover:bg-[#6F53B7] text-white font-bold text-base rounded-full shadow-xl shadow-[#8064C8]/30 flex items-center justify-center gap-3 transition-all hover:scale-105"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setTransactions([]);
                  setCurrentBatchId(null);
                  setDuplicateMatches({});
                  setStep("upload");
                }}
                className="w-full sm:w-auto px-6 py-4 bg-[#FAF9FF] hover:bg-[#EAE3FA] text-[#5B3F91] font-bold text-base rounded-full border border-[#EAE3FA] transition-colors"
              >
                Upload Another Statement
              </button>
            </div>

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

              <div>
                <label className="block text-xs font-bold text-[#5B3F91] mb-1">Source</label>
                <select
                  value={editingTx.source || "bank_statement"}
                  onChange={(e) => setEditingTx({ ...editingTx, source: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                >
                  {SOURCES.map((src) => (
                    <option key={src.value} value={src.value}>
                      {src.label}
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
                  type="date"
                  required
                  value={newTx.date}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B3F91] mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Amazon, Uber, Salary"
                  required
                  value={newTx.desc}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoCat = predictCategory(val);
                    setNewTx((prev) => ({
                      ...prev,
                      desc: val,
                      category: autoCat !== "Other" ? autoCat : (prev.category === "Other" ? autoCat : prev.category)
                    }));
                  }}
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

              <div>
                <label className="block text-xs font-bold text-[#5B3F91] mb-1">Source</label>
                <select
                  value={newTx.source || "manual_entry"}
                  onChange={(e) => setNewTx({ ...newTx, source: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] rounded-xl border border-[#EAE3FA] text-sm text-[#5B3F91] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8064C8]"
                >
                  {SOURCES.map((src) => (
                    <option key={src.value} value={src.value}>
                      {src.label}
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
