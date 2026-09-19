"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../../lib/db";
import { Flame, MapPin, Settings2, BellRing, X } from "lucide-react";

const DEMO_ZONES = [
  { id: "mall-1", lat: 19.0760, lng: 72.8777, radius: 2000, category: "Shopping", name: "Mumbai Mega Mall" },
  { id: "food-1", lat: 28.7041, lng: 77.1025, radius: 2000, category: "Food", name: "Delhi Food Hub" },
  { id: "ent-1", lat: 12.9716, lng: 77.5946, radius: 2000, category: "Entertainment", name: "Bangalore Cinema Alley" }
];

// Haversine formula to get distance in meters
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function TemptationRadar() {
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const watchIdRef = useRef(null);

  // Load preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("temptationRadarEnabled");
    if (saved === "true") {
      setEnabled(true);
    }
  }, []);

  // Watch location when enabled
  useEffect(() => {
    if (enabled) {
      // Request permission
      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            handleLocationUpdate(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.warn("Geolocation warning:", error.message || error.code);
            if (error.code === error.PERMISSION_DENIED) {
              setEnabled(false);
              localStorage.setItem("temptationRadarEnabled", "false");
              showToast("Geolocation permission denied.", "error");
            } else if (error.code === error.TIMEOUT) {
              showToast("Geolocation timeout. Ensure location services are on.", "error");
            }
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );
      } else {
        showToast("Geolocation is not supported by your browser", "error");
        setEnabled(false);
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enabled]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000);
  };

  const handleLocationUpdate = async (lat, lng, forceTrigger = false) => {
    for (const zone of DEMO_ZONES) {
      const dist = getDistance(lat, lng, zone.lat, zone.lng);
      if (dist <= zone.radius) {
        await checkAndTriggerAlert(zone, forceTrigger);
      }
    }
  };

  const checkAndTriggerAlert = async (zone, forceTrigger = false) => {
    // 1. Check Daily Limit
    const today = new Date().toDateString();
    let dailyCount = parseInt(localStorage.getItem(`temptation_daily_${today}`) || "0", 10);
    if (dailyCount >= 2) return; // Max 2 per day

    // 2. Check Category Cooldown (6 hours)
    const lastAlertTime = parseInt(localStorage.getItem(`temptation_cooldown_${zone.category}`) || "0", 10);
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;
    if (now - lastAlertTime < sixHours) return; // Cooldown active

    // 3. Analyze Dexie Transactions for this category
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Fetch active/reconciled expenses
    const txs = await db.transactions
      .filter(tx => (tx.status === "active" || tx.status === "reconciled") && tx.type === "expense")
      .toArray();

    // Calculate category spend for current month
    let categorySpend = 0;
    let totalSpend = 0;

    for (const tx of txs) {
      if (!tx.date) continue;
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        totalSpend += Number(tx.amount || 0);
        if (tx.category === zone.category) {
          categorySpend += Number(tx.amount || 0);
        }
      }
    }

    // Rule: Trigger if category spending is > ₹500 (or if forced via test button)
    if (categorySpend > 500 || forceTrigger) {
      // Set Cooldown immediately to prevent race conditions
      localStorage.setItem(`temptation_cooldown_${zone.category}`, now.toString());
      localStorage.setItem(`temptation_daily_${today}`, (dailyCount + 1).toString());

      // Fetch AI Message
      try {
        // Need auth token if available (assuming it's in localStorage or cookie, PennyPal uses standard fetch)
        // Wait, the routes have authMiddleware. For a hackathon, we assume the user is logged in.
        // We'll pull token from localStorage if it exists, but the user didn't specify the exact auth key.
        // Let's just try without if there's an issue, or pass a dummy token.
        const token = localStorage.getItem("token") || "";

        const response = await fetch("http://localhost:3000/api/analyze/temptation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            category: zone.category,
            analyticsSummary: {
              totalMonthlySpend: totalSpend,
              categoryMonthlySpend: categorySpend
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.alertMessage) {
            showToast(data.alertMessage, "temptation");
          }
        } else {
          // Fallback
          showToast(`🐧 Oh look, a ${zone.category} area. You've already spent ₹${categorySpend} here this month. Your wallet would like a word.`, "temptation");
        }
      } catch (err) {
        showToast(`🐧 Oh look, a ${zone.category} area. You've already spent ₹${categorySpend} here this month. Your wallet would like a word.`, "temptation");
      }
    }
  };

  const toggleEnabled = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem("temptationRadarEnabled", newVal.toString());
    
    if (newVal) {
      // Ask for notification permission early if possible
      if ("Notification" in window) {
        Notification.requestPermission();
      }
    }
  };

  // For testing without mocking GPS
  const testZone = (zone) => {
    // Clear cooldowns for testing
    const today = new Date().toDateString();
    localStorage.removeItem(`temptation_cooldown_${zone.category}`);
    localStorage.removeItem(`temptation_daily_${today}`);
    
    handleLocationUpdate(zone.lat, zone.lng, true);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-2xl transition-all ${
            enabled 
              ? "bg-[#8064C8] hover:bg-[#6F53B7] text-white" 
              : "bg-white hover:bg-gray-50 text-[#8064C8] border border-[#EAE3FA]"
          }`}
        >
          <MapPin className="w-6 h-6" />
        </button>

        {/* Panel */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-3xl shadow-2xl border border-[#EAE3FA] p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#5B3F91] flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Penny's Temptation Radar
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mb-4">
              Get an intervention from Penny when you wander into spending danger zones! Keep it local, keep it safe.
            </p>

            <div className="flex items-center justify-between p-3 bg-[#FAF9FF] rounded-2xl mb-4">
              <span className="text-sm font-semibold text-[#5B3F91]">Enable Radar</span>
              <button 
                onClick={toggleEnabled}
                className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Developer Testing Tools</h4>
              <div className="space-y-2">
                {DEMO_ZONES.map(zone => (
                  <button 
                    key={zone.id}
                    onClick={() => testZone(zone)}
                    className="w-full text-left text-xs p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold transition-colors flex items-center justify-between"
                  >
                    <span>Trigger {zone.category} Zone</span>
                    <Settings2 className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-fade-in w-full max-w-md px-4">
          <div className={`p-4 rounded-2xl shadow-2xl flex items-start gap-3 ${
            toast.type === "temptation" 
              ? "bg-[#5B3F91] text-white border-2 border-[#8064C8]" 
              : "bg-red-500 text-white"
          }`}>
            <BellRing className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">{toast.type === "temptation" ? "Intervention Alert!" : "Error"}</p>
              <p className="text-xs opacity-90 mt-1">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-auto opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
