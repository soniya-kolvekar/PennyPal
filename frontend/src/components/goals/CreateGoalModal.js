"use client";

import { useState } from "react";
import { X, Target, Calendar, Calculator, Sparkles } from "lucide-react";

export default function CreateGoalModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Purchase");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("0");
  const [targetDate, setTargetDate] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    return nextMonth.toISOString().split("T")[0];
  });
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  // Real-time calculations
  const target = parseFloat(targetAmount) || 0;
  const saved = parseFloat(savedAmount) || 0;
  const remaining = Math.max(0, target - saved);

  let daysLeft = 1;
  if (targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetD = new Date(targetDate);
    targetD.setHours(0, 0, 0, 0);
    const diffTime = targetD - today;
    daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const requiredPerDay = remaining > 0 ? Math.round(remaining / daysLeft) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || target <= 0) return;

    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      category,
      targetAmount: target,
      savedAmount: saved,
      targetDate,
      description: description.trim(),
      streak: 0,
      status: saved >= target ? "completed" : "active",
      createdAt: new Date().toISOString()
    });

    // Reset state
    setTitle("");
    setCategory("Purchase");
    setTargetAmount("");
    setSavedAmount("0");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE3FA] relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9FF] border border-[#EAE3FA] flex items-center justify-center text-[#5B3F91]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-handwritten">Create a New Goal</h2>
              <p className="text-xs text-gray-500">What are you saving for next?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Goal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. New Laptop, Goa Trip, Emergency Fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] focus:border-transparent text-sm text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] focus:border-transparent text-sm text-gray-900 bg-white"
              >
                <option value="Purchase">Purchase</option>
                <option value="Travel">Travel</option>
                <option value="Education">Education</option>
                <option value="Savings">Savings</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Date</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] focus:border-transparent text-sm text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Amount (₹) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] focus:border-transparent text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Already Saved (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={savedAmount}
                onChange={(e) => setSavedAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] focus:border-transparent text-sm text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Motivation / Notes (Optional)</label>
            <input
              type="text"
              placeholder="Why are you saving for this?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B3F91] focus:border-transparent text-sm text-gray-900"
            />
          </div>

          {/* Savings Calculation Summary Box */}
          {target > 0 && (
            <div className="bg-[#FAF9FF] rounded-2xl p-4 border border-[#EAE3FA] flex items-start gap-3">
              <Calculator className="w-5 h-5 text-[#5B3F91] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700 space-y-1">
                <p className="font-semibold text-[#5B3F91]">Daily Savings Plan:</p>
                <p>
                  To reach <span className="font-bold text-gray-900">₹{target.toLocaleString()}</span> in{" "}
                  <span className="font-bold text-gray-900">{daysLeft} days</span>, you need to save{" "}
                  <span className="font-bold text-[#5B3F91]">₹{requiredPerDay.toLocaleString()}/day</span>.
                </p>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#5B3F91] hover:bg-[#4A3277] text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Goal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
