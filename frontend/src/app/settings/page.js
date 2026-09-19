"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  FileText,
  X,
  Database,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { db } from "../../../lib/db";
import { getVaultId, exportVaultData, restoreVaultData, clearLocalVaultData } from "../../../lib/vault";
import { encryptVaultPayload, decryptVaultPayload } from "../../../lib/vaultCrypto";
import { useLiveQuery } from "dexie-react-hooks";

export default function SettingsPage() {
  // Live vault stats
  const vaultId = typeof window !== "undefined" ? getVaultId() : "guest_vault";

  const transactions = useLiveQuery(
    () => db.transactions.where("vaultId").equals(vaultId).toArray(),
    [vaultId]
  ) || [];

  const goals = useLiveQuery(
    () => db.goals.where("vaultId").equals(vaultId).toArray(),
    [vaultId]
  ) || [];

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import Modal & Wizard State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState("file"); // "file" | "password" | "preview" | "done"
  const [selectedFile, setSelectedFile] = useState(null);
  const [importPassword, setImportPassword] = useState("");
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [importError, setImportError] = useState("");
  const [decryptedPayload, setDecryptedPayload] = useState(null);
  const [restoreMode, setRestoreMode] = useState("merge"); // "merge" | "replace"
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSummary, setRestoreSummary] = useState(null);

  // Delete / Wipe Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // Clear notifications after timeout
  useEffect(() => {
    if (exportSuccess) {
      const timer = setTimeout(() => setExportSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [exportSuccess]);

  // =========================================================================
  // EXPORT HANDLER
  // =========================================================================
  const handleExportSubmit = async (e) => {
    e.preventDefault();
    setExportError("");

    if (!exportPassword || exportPassword.length < 6) {
      setExportError("Password must be at least 6 characters long.");
      return;
    }
    if (exportPassword !== confirmPassword) {
      setExportError("Passwords do not match. Please re-enter.");
      return;
    }

    try {
      setIsExporting(true);
      // 1. Collect vault records from IndexedDB
      const rawData = await exportVaultData();

      // 2. Encrypt using Web Crypto API (PBKDF2 + AES-GCM 256-bit)
      const encryptedJsonString = await encryptVaultPayload(rawData, exportPassword);

      // 3. Trigger native file download (.finpal)
      const blob = new Blob([encryptedJsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const todayStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `pennypal-backup-${todayStr}.finpal`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setShowExportModal(false);
      setExportPassword("");
      setConfirmPassword("");
      setExportSuccess(true);
    } catch (err) {
      setIsExporting(false);
      setExportError(err.message || "Failed to generate encrypted backup.");
    }
  };

  // =========================================================================
  // IMPORT HANDLERS
  // =========================================================================
  const handleFilePicked = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setImportError("");
    setImportStep("password");
  };

  const handleDecryptFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    if (!importPassword) {
      setImportError("Please enter the backup password.");
      return;
    }

    try {
      setIsDecrypting(true);
      setImportError("");
      const fileText = await selectedFile.text();

      // Decrypt and validate AES-GCM payload
      const payload = await decryptVaultPayload(fileText, importPassword);

      setDecryptedPayload(payload);
      setIsDecrypting(false);
      setImportStep("preview");
    } catch (err) {
      setIsDecrypting(false);
      setImportError(err.message || "Could not decrypt backup. Please check your password.");
    }
  };

  const handleConfirmRestore = async () => {
    if (!decryptedPayload) return;

    try {
      setIsRestoring(true);
      setImportError("");
      const summary = await restoreVaultData(decryptedPayload, { mode: restoreMode });
      setRestoreSummary(summary);
      setIsRestoring(false);
      setImportStep("done");
    } catch (err) {
      setIsRestoring(false);
      setImportError(err.message || "Failed to restore backup data into IndexedDB.");
    }
  };

  const resetImportFlow = () => {
    setShowImportModal(false);
    setImportStep("file");
    setSelectedFile(null);
    setImportPassword("");
    setDecryptedPayload(null);
    setImportError("");
    setRestoreSummary(null);
  };

  // =========================================================================
  // DELETE VAULT HANDLER
  // =========================================================================
  const handleDeleteLocalData = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
      return;
    }

    try {
      setIsDeleting(true);
      await clearLocalVaultData();
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmationText("");
      setDeleteSuccess(true);
    } catch (err) {
      setIsDeleting(false);
      alert("Failed to delete local vault: " + err.message);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col font-sans overflow-x-hidden selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Background soft ambient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />
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
            <Link href="/calendar" className="hover:text-[#8064C8] transition-colors">
              Calendar
            </Link>
            <Link href="/upload" className="hover:text-[#8064C8] transition-colors">
              Upload
            </Link>
            <Link href="/settings" className="text-[#8064C8] transition-colors">
              Settings
            </Link>
            <Link href="/chat" className="hover:text-[#8064C8] transition-colors">
              Chat
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-1.5 bg-[#EAE3FA] hover:bg-[#C9B9F2] text-[#8064C8] text-xs font-bold rounded-full transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 sm:px-12 py-10 flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#EAE3FA]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 bg-[#EAE3FA] text-[#8064C8] rounded-2xl flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="font-handwritten text-4xl sm:text-5xl font-bold text-[#5B3F91]">
                Privacy & Data
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#5B3F91]/80 font-medium max-w-xl">
              Your financial records live strictly on this browser inside your local IndexedDB. You can export an encrypted backup to switch browsers or devices anytime.
            </p>
          </div>

          {/* Current Local Vault Status Pill */}
          <div className="bg-white/90 backdrop-blur-sm border border-[#EAE3FA] rounded-2xl px-4 py-3 shadow-xs flex items-center gap-3 shrink-0">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8064C8]">
                Active Local Vault
              </p>
              <p className="text-xs font-bold text-[#5B3F91]">
                {transactions.length} {transactions.length === 1 ? "Transaction" : "Transactions"} Stored
              </p>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {exportSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold shadow-xs animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="flex-1">Encrypted backup (.finpal) generated and downloaded successfully!</p>
            <button type="button" onClick={() => setExportSuccess(false)}>
              <X className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        )}

        {deleteSuccess && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-bold shadow-xs animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="flex-1">All local ledger records have been wiped from this device.</p>
            <button type="button" onClick={() => setDeleteSuccess(false)}>
              <X className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        )}

        {/* 3 CORE PRIVACY ACTIONS */}
        <div className="space-y-6">

          {/* 1. BACKUP DATA (EXPORT) */}
          <div className="p-6 sm:p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#C9B9F2] transition-all">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-[#EAE3FA] text-[#8064C8] rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <Download className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-bold text-[#5B3F91]">
                    Backup your data
                  </h3>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-[#8064C8] text-[10px] font-extrabold rounded-full">
                    AES-GCM 256-bit
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#5B3F91]/70 font-medium max-w-md">
                  Download an encrypted <code className="bg-[#FAF9FF] px-1.5 py-0.5 rounded text-[#8064C8] font-bold">.finpal</code> snapshot of all transactions, categories, and goals protected with your password.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setExportError("");
                setShowExportModal(true);
              }}
              className="w-full md:w-auto px-6 py-3 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-sm font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all hover:scale-105 shrink-0 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>

          {/* 2. RESTORE DATA (IMPORT) */}
          <div className="p-6 sm:p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-[#EAE3FA] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#C9B9F2] transition-all">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-bold text-[#5B3F91]">
                    Restore your data
                  </h3>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full">
                    Switch Browsers
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#5B3F91]/70 font-medium max-w-md">
                  Import an encrypted <code className="bg-[#FAF9FF] px-1.5 py-0.5 rounded text-[#8064C8] font-bold">.finpal</code> file from another device. Preview contents and merge or replace your local ledger seamlessly.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setImportError("");
                setImportStep("file");
                setShowImportModal(true);
              }}
              className="w-full md:w-auto px-6 py-3 bg-white hover:bg-[#FAF9FF] text-[#8064C8] border border-[#8064C8] text-sm font-bold rounded-full shadow-xs transition-all hover:scale-105 shrink-0 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import Data</span>
            </button>
          </div>

          {/* 3. DELETE LOCAL DATA (WIPE) */}
          <div className="p-6 sm:p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-rose-200/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-rose-300 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-bold text-rose-950">
                    Delete local data
                  </h3>
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-extrabold rounded-full">
                    Destructive
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#5B3F91]/70 font-medium max-w-md">
                  Permanently remove all financial data, statement batches, and transactions stored in this browser.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeleteConfirmationText("");
                setShowDeleteModal(true);
              }}
              className="w-full md:w-auto px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-bold rounded-full transition-all hover:scale-105 shrink-0 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Local Data</span>
            </button>
          </div>

        </div>

        {/* PRIVACY GUARANTEE BANNER */}
        <div className="p-6 bg-[#EAE3FA]/40 rounded-3xl border border-[#EAE3FA] flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#8064C8] shadow-xs shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="text-xs sm:text-sm text-[#5B3F91]">
            <p className="font-extrabold text-[#8064C8] mb-0.5">Zero-Knowledge Architecture</p>
            <p className="font-medium">
              PennyPal never transmits your financial records to the cloud. When moving between computers or browsers, the <code className="font-bold text-[#8064C8]">.finpal</code> file is encrypted with your private key before saving to your disk.
            </p>
          </div>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* EXPORT MODAL */}
      {/* ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-[#5B3F91]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE3FA] shadow-2xl p-6 sm:p-8 animate-scale-up">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EAE3FA]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#EAE3FA] text-[#8064C8] rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#5B3F91]">Export Encrypted Backup</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-[#EAE3FA] text-[#5B3F91] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExportSubmit} className="space-y-4">
              <div className="p-3 bg-[#FAF9FF] border border-[#EAE3FA] rounded-2xl text-xs text-[#5B3F91]/80 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#8064C8] shrink-0" />
                <span>Exporting <strong>{transactions.length}</strong> transactions and goals.</span>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#5B3F91] mb-1">
                  Create Backup Password
                </label>
                <div className="relative">
                  <input
                    type={showExportPassword ? "text" : "password"}
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 bg-[#FAF9FF] border border-[#EAE3FA] rounded-xl text-sm font-semibold text-[#5B3F91] focus:outline-none focus:border-[#8064C8] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowExportPassword(!showExportPassword)}
                    className="absolute right-3 top-2.5 text-[#5B3F91]/50 hover:text-[#8064C8]"
                  >
                    {showExportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#5B3F91] mb-1">
                  Confirm Backup Password
                </label>
                <input
                  type={showExportPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] border border-[#EAE3FA] rounded-xl text-sm font-semibold text-[#5B3F91] focus:outline-none focus:border-[#8064C8]"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-[11px] text-amber-800 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Remember this password! It encrypts your file using AES-GCM. PennyPal cannot recover or reset this password for you.
                </p>
              </div>

              {exportError && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {exportError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5B3F91] hover:bg-[#FAF9FF] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExporting}
                  className="px-6 py-2.5 bg-[#8064C8] hover:bg-[#6F53B7] disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all flex items-center gap-2"
                >
                  {isExporting ? "Encrypting..." : "Download .finpal Backup"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT MODAL (WIZARD) */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-[#5B3F91]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EAE3FA] shadow-2xl p-6 sm:p-8 animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EAE3FA]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#5B3F91]">Restore Vault Backup</h3>
              </div>
              <button
                type="button"
                onClick={resetImportFlow}
                className="p-1 hover:bg-[#EAE3FA] text-[#5B3F91] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: SELECT FILE */}
            {importStep === "file" && (
              <div className="space-y-4">
                <p className="text-xs text-[#5B3F91]/80 font-medium">
                  Select your encrypted <code className="text-[#8064C8] font-bold">.finpal</code> file downloaded from your other browser or device.
                </p>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-[#C9B9F2] hover:border-[#8064C8] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#FAF9FF] hover:bg-white transition-all text-center"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFilePicked(e.target.files[0])}
                    accept=".finpal,.json"
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-[#EAE3FA] text-[#8064C8] rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#5B3F91]">Click to choose .finpal file</p>
                    <p className="text-xs text-[#5B3F91]/60 font-medium mt-0.5">Supports AES-GCM encrypted FinPal containers</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ENTER BACKUP PASSWORD */}
            {importStep === "password" && (
              <form onSubmit={handleDecryptFile} className="space-y-4">
                <div className="p-3 bg-[#FAF9FF] border border-[#EAE3FA] rounded-2xl flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#8064C8] shrink-0" />
                  <div className="text-xs overflow-hidden text-ellipsis">
                    <p className="font-bold text-[#5B3F91] truncate">{selectedFile?.name}</p>
                    <p className="text-[#5B3F91]/60 font-medium">{Math.round((selectedFile?.size || 0) / 1024)} KB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#5B3F91] mb-1">
                    Enter Backup Password
                  </label>
                  <div className="relative">
                    <input
                      type={showImportPassword ? "text" : "password"}
                      value={importPassword}
                      onChange={(e) => setImportPassword(e.target.value)}
                      placeholder="Password used during export"
                      className="w-full px-4 py-2.5 bg-[#FAF9FF] border border-[#EAE3FA] rounded-xl text-sm font-semibold text-[#5B3F91] focus:outline-none focus:border-[#8064C8] pr-10"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowImportPassword(!showImportPassword)}
                      className="absolute right-3 top-2.5 text-[#5B3F91]/50 hover:text-[#8064C8]"
                    >
                      {showImportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {importError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    {importError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setImportStep("file")}
                    className="px-4 py-2 text-xs font-bold text-[#5B3F91] hover:bg-[#FAF9FF] rounded-full"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isDecrypting}
                    className="px-6 py-2.5 bg-[#8064C8] hover:bg-[#6F53B7] disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all flex items-center gap-2"
                  >
                    {isDecrypting ? "Decrypting..." : "Unlock & Preview"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PREVIEW & RESTORE OPTIONS */}
            {importStep === "preview" && decryptedPayload && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-extrabold text-emerald-900">Backup Successfully Decrypted!</p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Created on: {decryptedPayload.exportedAt
                        ? new Date(decryptedPayload.exportedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Recent Backup"}
                    </p>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA]">
                    <span className="text-[10px] font-extrabold text-[#8064C8] uppercase">Transactions</span>
                    <p className="text-xl font-extrabold text-[#5B3F91]">
                      {decryptedPayload.vault?.transactions?.length || 0}
                    </p>
                  </div>
                  <div className="p-3.5 bg-[#FAF9FF] rounded-2xl border border-[#EAE3FA]">
                    <span className="text-[10px] font-extrabold text-[#8064C8] uppercase">Goals & Batches</span>
                    <p className="text-xl font-extrabold text-[#5B3F91]">
                      {(decryptedPayload.vault?.goals?.length || 0) + (decryptedPayload.vault?.importBatches?.length || 0)}
                    </p>
                  </div>
                </div>

                {/* Strategy Selection */}
                <div>
                  <label className="block text-xs font-extrabold text-[#5B3F91] mb-2">
                    Choose Restore Strategy
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        restoreMode === "merge"
                          ? "border-[#8064C8] bg-[#EAE3FA]/40 ring-1 ring-[#8064C8]/40"
                          : "border-[#EAE3FA] bg-[#FAF9FF] hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="restoreMode"
                        value="merge"
                        checked={restoreMode === "merge"}
                        onChange={() => setRestoreMode("merge")}
                        className="mt-1 text-[#8064C8] focus:ring-[#8064C8]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#5B3F91]">
                          Merge with existing (Recommended)
                        </p>
                        <p className="text-[11px] text-[#5B3F91]/70 font-medium">
                          Keep your current local transactions and append new imported records without creating duplicates.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        restoreMode === "replace"
                          ? "border-rose-400 bg-rose-50/50 ring-1 ring-rose-400/40"
                          : "border-[#EAE3FA] bg-[#FAF9FF] hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="restoreMode"
                        value="replace"
                        checked={restoreMode === "replace"}
                        onChange={() => setRestoreMode("replace")}
                        className="mt-1 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-rose-900">
                          Replace all local data
                        </p>
                        <p className="text-[11px] text-rose-700/80 font-medium">
                          Wipe all existing data on this browser and restore the exact state of this backup snapshot.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {importError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    {importError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setImportStep("password")}
                    className="px-4 py-2 text-xs font-bold text-[#5B3F91] hover:bg-[#FAF9FF] rounded-full"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRestore}
                    disabled={isRestoring}
                    className="px-6 py-2.5 bg-[#8064C8] hover:bg-[#6F53B7] disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all flex items-center gap-2"
                  >
                    {isRestoring ? "Writing to Vault..." : "Confirm & Restore"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: RESTORE DONE */}
            {importStep === "done" && restoreSummary && (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#5B3F91]">FinPal Vault Restored!</h4>
                  <p className="text-xs text-[#5B3F91]/80 font-medium mt-1">
                    Successfully imported <strong>{restoreSummary.importedTxCount}</strong> transactions
                    {restoreSummary.skippedTxCount > 0 && ` (${restoreSummary.skippedTxCount} duplicate transactions skipped)`}.
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/dashboard"
                    className="px-6 py-2.5 bg-[#8064C8] hover:bg-[#6F53B7] text-white text-xs font-bold rounded-full shadow-md shadow-[#8064C8]/25 transition-all flex items-center gap-1.5"
                  >
                    <span>View Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={resetImportFlow}
                    className="px-5 py-2.5 bg-[#FAF9FF] text-[#5B3F91] hover:bg-[#EAE3FA] text-xs font-bold rounded-full transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE / WIPE MODAL */}
      {/* ========================================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#5B3F91]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl p-6 sm:p-8 animate-scale-up">
            
            <div className="flex items-center gap-3 pb-3 mb-4 border-b border-rose-100 text-rose-600">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-rose-950">Wipe Local Ledger?</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#5B3F91]/80 font-medium mb-4 leading-relaxed">
              This action will permanently delete all <strong>{transactions.length}</strong> transactions and goals stored inside this browser&apos;s IndexedDB. This cannot be undone unless you have an exported <code className="font-bold text-[#8064C8]">.finpal</code> backup.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-[#5B3F91] mb-1">
                Type <strong className="text-rose-600">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 bg-rose-50/50 border border-rose-200 rounded-xl text-sm font-bold text-rose-900 focus:outline-none focus:border-rose-400 uppercase"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#5B3F91] hover:bg-[#FAF9FF] rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLocalData}
                disabled={deleteConfirmationText.trim().toUpperCase() !== "DELETE" || isDeleting}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-full shadow-md shadow-rose-600/25 transition-all"
              >
                {isDeleting ? "Wiping..." : "Permanently Delete"}
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
            <span>© {new Date().getFullYear()} PennyPal. All rights reserved. Zero-knowledge local ledger.</span>
          </p>
          <div className="flex gap-6 text-xs font-semibold text-[#5B3F91]">
            <Link href="/" className="hover:text-[#8064C8]">Home</Link>
            <Link href="/dashboard" className="hover:text-[#8064C8]">Dashboard</Link>
            <Link href="/calendar" className="hover:text-[#8064C8]">Calendar</Link>
            <Link href="/upload" className="hover:text-[#8064C8]">Upload</Link>
            <Link href="/settings" className="hover:text-[#8064C8]">Settings</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
