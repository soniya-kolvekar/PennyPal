"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  RotateCcw,
  Sparkles,
  Heart,
  ShieldCheck,
  Smile,
  Coffee,
  ShoppingBag,
  PieChart,
  Lightbulb
} from "lucide-react";
import { db } from "../../../lib/db";
import { getVaultFinancialContext, getVaultId } from "../../../lib/vault";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const CONVERSATION_ID = "main";

function createMessageTimestamp() {
  return new Date().getTime();
}

const THERAPIST_CHIPS = [
  {
    icon: Smile,
    label: "I overspent & feel guilty",
    prompt: "I overspent recently and I'm feeling really guilty about it...",
    color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
  },
  {
    icon: Heart,
    label: "I'm anxious about my money",
    prompt: "I'm feeling anxious and overwhelmed about my finances right now...",
    color: "bg-purple-50 text-[#8064C8] border-[#EAE3FA] hover:bg-[#EAE3FA]"
  },
  {
    icon: ShoppingBag,
    label: "I want to impulse buy",
    prompt: "I really want to impulse buy something right now. Can you help me pause?",
    color: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
  },
  {
    icon: PieChart,
    label: "Gently show my spending",
    prompt: "Can you gently walk me through how much I've spent this month without any judgment?",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
  },
  {
    icon: Lightbulb,
    label: "Give me a calming money tip",
    prompt: "Can you share a gentle, realistic financial habit or tip to help me feel in control?",
    color: "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100"
  }
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history from local IndexedDB strictly for this vault
  useEffect(() => {
    let isMounted = true;
    async function fetchHistory() {
      try {
        const vaultId = getVaultId();
        const allMessages = await db.chatMessages.where("vaultId").equals(vaultId).toArray();
        const savedMessages = allMessages
          .filter((msg) => msg.conversationId === CONVERSATION_ID)
          .sort((a, b) => a.createdAt - b.createdAt);

        if (isMounted) {
          setMessages(savedMessages);
        }
      } catch (error) {
        console.error("❌ Failed to load chat history:", error);
      }
    }
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  // Send message to Penny backend with real IndexedDB financial context
  async function handleSendMessage(customPrompt = null) {
    const textToSend = (customPrompt || message).trim();
    if (!textToSend || loading) return;

    if (!customPrompt) {
      setMessage("");
    }
    setLoading(true);

    try {
      // 1. Get existing message history strictly for this user's vault
      const vaultId = getVaultId();
      const allMessages = await db.chatMessages.where("vaultId").equals(vaultId).toArray();
      const existingMessages = allMessages
        .filter(
          (msg) =>
            msg.conversationId === CONVERSATION_ID &&
            (msg.role === "user" || msg.role === "assistant") &&
            typeof msg.content === "string"
        )
        .sort((a, b) => a.createdAt - b.createdAt);

      const previousMessages = existingMessages.map((msg) => ({
        role: msg.role,
        content: msg.content
      }));

      // 2. Save user message locally with vaultId
      const userMessageObject = {
        vaultId,
        conversationId: CONVERSATION_ID,
        role: "user",
        content: textToSend,
        createdAt: createMessageTimestamp()
      };

      const userMessageId = await db.chatMessages.add(userMessageObject);
      const savedUserMessage = {
        ...userMessageObject,
        id: userMessageId
      };

      // Show immediately in UI
      setMessages((prev) => [...prev, savedUserMessage]);

      // 3. Extract lightweight financial context from local vault
      const context = await getVaultFinancialContext();

      // 4. Send request to backend
      const requestBody = {
        message: textToSend,
        history: previousMessages,
        context
      };

      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok || !data.response) {
        throw new Error(data.error || "Penny hit a snag.");
      }

      // 5. Save Penny's supportive response with vaultId
      const pennyMessageObject = {
        vaultId,
        conversationId: CONVERSATION_ID,
        role: "assistant",
        content: data.response,
        createdAt: createMessageTimestamp()
      };

      const pennyMessageId = await db.chatMessages.add(pennyMessageObject);
      const savedPennyMessage = {
        ...pennyMessageObject,
        id: pennyMessageId
      };

      setMessages((prev) => [...prev, savedPennyMessage]);
    } catch (error) {
      console.error("❌ Chat error:", error);
      // Gentle therapist fallback message
      setMessages((prev) => [
        ...prev,
        {
          conversationId: CONVERSATION_ID,
          role: "assistant",
          content:
            "Take a deep breath with me! 🐧 My connection wobbled for a second, but I'm right here in your pocket. Please give me another tap in a moment!",
          createdAt: createMessageTimestamp()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Clear chat history for the active user's vault only
  async function startNewChat() {
    try {
      const vaultId = getVaultId();
      const currentVaultMessages = await db.chatMessages.where("vaultId").equals(vaultId).toArray();
      const currentConversation = currentVaultMessages.filter(
        (msg) => msg.conversationId === CONVERSATION_ID
      );
      const ids = currentConversation.map((msg) => msg.id).filter(Boolean);

      if (ids.length > 0) {
        await db.chatMessages.bulkDelete(ids);
      }

      setMessages([]);
    } catch (error) {
      console.error("❌ Failed to clear chat:", error);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col justify-between overflow-x-hidden font-sans selection:bg-[#C9B9F2] selection:text-[#5B3F91]">
      {/* Background Soft Lavender & Pink Patches */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C9B9F2] rounded-full blur-3xl opacity-35 pointer-events-none translate-x-1/3" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#F6C9D5] rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF9FF]/90 border-b border-[#EAE3FA]/80 px-6 sm:px-12 py-2 transition-all shrink-0">
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
            <Link href="/settings" className="hover:text-[#8064C8] transition-colors">
              Settings
            </Link>
            <Link href="/chat" className="text-[#8064C8] transition-colors">
              Chat
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startNewChat}
              className="px-3.5 py-1.5 bg-white hover:bg-[#FAF9FF] border border-[#EAE3FA] text-[#5B3F91] hover:text-[#8064C8] font-bold text-xs rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8064C8]" />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CHAT AREA */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-4 max-w-5xl w-full mx-auto overflow-hidden">
        <div className="w-full h-[78vh] max-h-[800px] min-h-[520px] bg-white/90 backdrop-blur-md rounded-3xl border border-[#EAE3FA] shadow-xl shadow-[#8064C8]/5 p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Chat Header / Therapist Identity */}
          <div className="pb-3 border-b border-[#EAE3FA] flex items-center justify-between shrink-0 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EAE3FA] flex items-center justify-center overflow-hidden shadow-xs shrink-0 p-1">
                <Image
                  src="/boty.png"
                  alt="Penny Mascot"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-extrabold text-[#5B3F91]">
                    Penny
                  </h1>
                  <span className="px-2 py-0.5 bg-purple-100 text-[#8064C8] text-[10px] font-extrabold rounded-full">
                    Therapist & Companion
                  </span>
                </div>
                <p className="text-[11px] text-[#5B3F91]/70 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>A safe, zero-judgment space for your money feelings</span>
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#8064C8] bg-[#FAF9FF] px-3 py-1.5 rounded-full border border-[#EAE3FA]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8064C8]" />
              <span>100% Local & Private</span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar my-2">
            
            {/* Welcome Therapist Screen when Empty */}
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center p-4">
                <div className="max-w-lg flex flex-col items-center">
                  <div className="relative w-28 h-28 mb-3">
                    <video
                      src="/hugging_coin.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain filter drop-shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="font-handwritten text-3xl sm:text-4xl font-bold text-[#5B3F91]">
                      Take a deep breath with me.
                    </h2>
                    <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                  </div>

                  <p className="text-xs sm:text-sm text-[#5B3F91]/80 font-medium mb-6 max-w-md leading-relaxed">
                    Money can feel heavy, emotional, or anxiety-inducing, but you never have to carry it alone. I&apos;m your safe companion—no scolding, no guilt, just warm support. How is your heart feeling today?
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    {THERAPIST_CHIPS.map((chip, idx) => {
                      const IconComp = chip.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(chip.prompt)}
                          className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all hover:scale-105 shadow-2xs flex items-center gap-2 cursor-pointer ${chip.color}`}
                        >
                          <IconComp className="w-3.5 h-3.5 shrink-0" />
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={
                  msg.role === "user" ? "flex justify-end" : "flex justify-start"
                }
              >
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[85%] sm:max-w-[75%] rounded-3xl rounded-tr-xs bg-[#8064C8] text-white px-5 py-3 text-xs sm:text-sm shadow-md shadow-[#8064C8]/20 leading-relaxed font-medium"
                      : "max-w-[85%] sm:max-w-[75%] rounded-3xl rounded-tl-xs bg-[#F4EFFC] border border-[#EAE3FA] text-[#5B3F91] px-5 py-3 text-xs sm:text-sm shadow-xs leading-relaxed flex items-start gap-3"
                  }
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-xl bg-[#EAE3FA] flex items-center justify-center overflow-hidden shrink-0 mt-0.5 p-0.5">
                      <Image
                        src="/boty.png"
                        alt="Penny"
                        width={28}
                        height={28}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="whitespace-pre-wrap leading-relaxed font-normal">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-tl-xs bg-[#F4EFFC] border border-[#EAE3FA] text-[#8064C8] px-4 py-2.5 text-xs sm:text-sm shadow-xs flex items-center gap-2.5 animate-pulse">
                  <div className="w-6 h-6 rounded-lg bg-[#EAE3FA] flex items-center justify-center shrink-0 p-0.5">
                    <Image
                      src="/boty.png"
                      alt="Penny Thinking"
                      width={24}
                      height={24}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-bold">Penny is listening & reflecting...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Check-In Chips (Always available above input) */}
          {messages.length > 0 && (
            <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-[#EAE3FA]/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8064C8] shrink-0">
                Check-in:
              </span>
              {THERAPIST_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.prompt)}
                  className={`px-3 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all hover:scale-105 shadow-2xs shrink-0 ${chip.color}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="pt-2 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="Talk to Penny about your money feelings, guilt, or spending..."
                className="w-full pl-5 pr-28 py-3.5 bg-[#FAF9FF] rounded-full border border-[#EAE3FA] text-[#5B3F91] placeholder-[#C9B9F2] focus:outline-none focus:border-[#8064C8] focus:bg-white shadow-xs transition-all text-xs sm:text-sm font-medium"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={loading || !message.trim()}
                className="absolute right-1.5 py-2.5 px-5 bg-[#8064C8] hover:bg-[#6F53B7] active:scale-[0.98] text-white font-bold rounded-full shadow-md shadow-[#8064C8]/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? "..." : "Send"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-white border-t border-[#EAE3FA] py-4 px-6 sm:px-12 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logoo.png"
              alt="PennyPal Logo"
              width={120}
              height={36}
              style={{ width: "auto", height: "auto" }}
              className="h-7 object-contain"
            />
          </div>
          <p className="text-xs font-semibold text-[#5B3F91]/60">
            © {new Date().getFullYear()} PennyPal. Safe, zero-judgment financial coaching.
          </p>
          <div className="flex gap-6 text-xs font-semibold text-[#5B3F91]">
            <Link href="/" className="hover:text-[#8064C8]">Home</Link>
            <Link href="/dashboard" className="hover:text-[#8064C8]">Dashboard</Link>
            <Link href="/calendar" className="hover:text-[#8064C8]">Calendar</Link>
            <Link href="/upload" className="hover:text-[#8064C8]">Upload</Link>
            <Link href="/settings" className="hover:text-[#8064C8]">Settings</Link>
            <Link href="/chat" className="text-[#8064C8]">Chat</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
