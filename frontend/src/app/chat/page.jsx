
"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
    Send,
    RotateCcw,
    Sparkles,
    MessageSquare
} from "lucide-react";
import { db } from "../../../lib/db";

const CONVERSATION_ID = "main";

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // ==========================================
    // LOAD CHAT HISTORY
    // ==========================================

    useEffect(() => {
        loadMessages();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    async function loadMessages() {
        try {
            const allMessages =
                await db.messages.toArray();

            const savedMessages =
                allMessages
                    .filter(
                        (msg) =>
                            msg.conversationId ===
                            CONVERSATION_ID
                    )
                    .sort(
                        (a, b) =>
                            a.createdAt - b.createdAt
                    );

            console.log(
                "📦 Messages loaded from IndexedDB:",
                savedMessages
            );

            console.log(
                "📦 Saved message count:",
                savedMessages.length
            );

            setMessages(savedMessages);
        } catch (error) {
            console.error(
                "❌ Failed to load chat history:",
                error
            );
        }
    }

    // ==========================================
    // SEND MESSAGE
    // ==========================================

    async function sendMessage() {
        if (!message.trim() || loading) {
            return;
        }

        const userMessage = message.trim();

        setMessage("");
        setLoading(true);

        try {
            // ======================================
            // 1. GET EXISTING HISTORY FIRST
            // ======================================

            const allMessages =
                await db.messages.toArray();

            const existingMessages =
                allMessages
                    .filter(
                        (msg) =>
                            msg.conversationId ===
                            CONVERSATION_ID &&
                            (msg.role === "user" ||
                                msg.role ===
                                "assistant") &&
                            typeof msg.content ===
                            "string"
                    )
                    .sort(
                        (a, b) =>
                            a.createdAt - b.createdAt
                    );

            // Convert IndexedDB records into
            // the format expected by Ollama.

            const previousMessages =
                existingMessages.map((msg) => ({
                    role: msg.role,
                    content: msg.content
                }));

            console.log(
                "================================"
            );

            console.log(
                "🧠 EXISTING LOCAL HISTORY:"
            );

            console.log(
                previousMessages
            );

            console.log(
                "🧠 HISTORY COUNT:",
                previousMessages.length
            );

            // ======================================
            // 2. SAVE CURRENT USER MESSAGE
            // ======================================

            const userMessageObject = {
                conversationId:
                    CONVERSATION_ID,
                role: "user",
                content: userMessage,
                createdAt: Date.now()
            };

            const userMessageId =
                await db.messages.add(
                    userMessageObject
                );

            const savedUserMessage = {
                ...userMessageObject,
                id: userMessageId
            };

            console.log(
                "💾 User message saved:",
                savedUserMessage
            );

            // Show immediately in UI

            setMessages((prev) => [
                ...prev,
                savedUserMessage
            ]);

            // ======================================
            // 3. SEND TO BACKEND
            // ======================================

            const requestBody = {
                message: userMessage,
                history: previousMessages
            };

            console.log(
                "📤 REQUEST SENT TO BACKEND:"
            );

            console.log(
                JSON.stringify(
                    requestBody,
                    null,
                    2
                )
            );

            const response = await fetch(
                "http://localhost:5000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        requestBody
                    )
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Something went wrong"
                );
            }

            // ======================================
            // 4. SAVE PENNY RESPONSE
            // ======================================

            const pennyMessageObject = {
                conversationId:
                    CONVERSATION_ID,
                role: "assistant",
                content: data.response,
                createdAt: Date.now()
            };

            const pennyMessageId =
                await db.messages.add(
                    pennyMessageObject
                );

            const savedPennyMessage = {
                ...pennyMessageObject,
                id: pennyMessageId
            };

            console.log(
                "💾 Penny response saved:",
                savedPennyMessage
            );

            // ======================================
            // 5. SHOW PENNY RESPONSE
            // ======================================

            setMessages((prev) => [
                ...prev,
                savedPennyMessage
            ]);

            console.log(
                "================================"
            );
        } catch (error) {
            console.error(
                "❌ Chat error:",
                error
            );

            setMessages((prev) => [
                ...prev,
                {
                    conversationId:
                        CONVERSATION_ID,
                    role: "assistant",
                    content:
                        "Oops! My penguin brain hit a tiny iceberg. Please try again.",
                    createdAt: Date.now()
                }
            ]);
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // NEW CHAT
    // ==========================================

    async function startNewChat() {
        try {
            const allMessages =
                await db.messages.toArray();

            const currentConversation =
                allMessages.filter(
                    (msg) =>
                        msg.conversationId ===
                        CONVERSATION_ID
                );

            const ids =
                currentConversation
                    .map((msg) => msg.id)
                    .filter(
                        (id) =>
                            id !== undefined
                    );

            if (ids.length > 0) {
                await db.messages.bulkDelete(
                    ids
                );
            }

            setMessages([]);

            console.log(
                "🗑️ Penny chat history cleared"
            );
        } catch (error) {
            console.error(
                "❌ Failed to clear chat:",
                error
            );
        }
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="pt-6 relative min-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col justify-between overflow-hidden font-sans select-none">

            {/* Background Soft Lavender Patches */}

            <div className="absolute -top-16 -left-16 w-80 h-80 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none" />

            <div className="absolute top-1/4 -right-12 w-96 h-96 bg-[#C9B9F2] rounded-full blur-3xl opacity-40 pointer-events-none" />

            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#EAE3FA] rounded-full blur-3xl opacity-35 pointer-events-none" />

            <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-[#C9B9F2] rounded-full blur-3xl opacity-30 pointer-events-none" />

            <div className="absolute top-1/3 -left-20 w-72 h-72 bg-[#EAE3FA] rounded-full blur-3xl opacity-40 pointer-events-none" />

            {/* Top Header */}

            <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-3 sm:py-4 w-full max-w-7xl mx-auto shrink-0">

                <div className="flex items-center">
                    <Image
                        src="/logoo.png"
                        alt="PennyPal Logo"
                        width={190}
                        height={70}
                        style={{
                            width: "auto",
                            height: "auto"
                        }}
                        className="h-10 sm:h-12 object-contain"
                        priority
                    />
                </div>

                <div className="flex items-center gap-3 sm:gap-4">

                    <div className="hidden md:flex flex-col items-end">

                        <span className="font-handwritten text-base sm:text-lg text-[#8064C8] -rotate-2 leading-tight">
                            Better habits,
                        </span>

                        <span className="font-handwritten text-base sm:text-lg text-[#8064C8] -rotate-2 leading-tight flex items-center gap-1">
                            brighter futures

                            <Image
                                src="/heart.png"
                                alt="Heart"
                                width={18}
                                height={18}
                                style={{
                                    width: "auto",
                                    height: "auto"
                                }}
                                className="inline-block h-4 w-auto object-contain"
                            />
                        </span>

                    </div>

                    <button
                        onClick={startNewChat}
                        className="px-4 py-2 bg-white hover:bg-[#FAF9FF] border border-[#EAE3FA] text-[#5B3F91] hover:text-[#8064C8] font-semibold text-xs sm:text-sm rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-[#A98FE3]" />

                        <span>
                            New Chat
                        </span>
                    </button>

                </div>

            </header>

            {/* Main Chat Container */}

            <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 py-2 overflow-hidden">

                <div className="w-full max-w-4xl h-[78vh] max-h-[750px] min-h-[480px] bg-white/80 backdrop-blur-md rounded-3xl border border-[#EAE3FA] shadow-xl shadow-[#8064C8]/5 p-4 sm:p-6 flex flex-col justify-between overflow-hidden">

                    {/* Chat Box Header */}

                    <div className="pb-3 border-b border-[#EAE3FA] flex items-center justify-between shrink-0 mb-3">

                        <div className="flex items-center gap-2.5">

                            <div className="w-10 h-10 rounded-2xl bg-[#EAE3FA] flex items-center justify-center overflow-hidden shadow-xs shrink-0 p-0.5">

                                <Image
                                    src="/penny.png"
                                    alt="Penny Mascot"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />

                            </div>

                            <div>

                                <div className="flex items-center gap-1.5">

                                    <h1 className="text-base sm:text-lg font-extrabold text-[#5B3F91]">
                                        Penny AI
                                    </h1>

                                    <Image
                                        src="/heart.png"
                                        alt="Heart"
                                        width={16}
                                        height={16}
                                        style={{
                                            width: "auto",
                                            height: "auto"
                                        }}
                                        className="inline-block h-3.5 w-auto object-contain"
                                    />

                                </div>

                                <p className="text-[11px] sm:text-xs text-[#8064C8] font-medium flex items-center gap-1">

                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                                    Your warm & supportive financial coach

                                </p>

                            </div>

                        </div>

                        <div className="hidden sm:flex items-center gap-1 opacity-60">

                            <svg
                                className="w-6 h-6 text-[#A98FE3] transform -rotate-12"
                                viewBox="0 0 32 32"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            >
                                <path d="M5 16H13" />
                                <path d="M8 7L15 13" />
                                <path d="M8 25L15 19" />
                            </svg>

                            <Sparkles className="w-4 h-4 text-[#8064C8]" />

                        </div>

                    </div>

                    {/* Messages Scroll Area */}

                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">

                        {messages.length === 0 && (
                            <div className="flex h-full items-center justify-center text-center p-4">

                                <div className="max-w-md flex flex-col items-center">

                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#EAE3FA] flex items-center justify-center overflow-hidden mb-3 shadow-inner p-1">

                                        <Image
                                            src="/penny.png"
                                            alt="Penny Mascot"
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-contain hover:scale-105 transition-transform"
                                        />

                                    </div>

                                    <div className="flex items-center gap-2 mb-1">

                                        <h2 className="text-xl sm:text-2xl font-bold text-[#5B3F91]">
                                            Hey! I'm Penny
                                        </h2>

                                        <Image
                                            src="/heart.png"
                                            alt="Heart"
                                            width={20}
                                            height={20}
                                            style={{
                                                width: "auto",
                                                height: "auto"
                                            }}
                                            className="h-5 w-auto object-contain"
                                        />

                                    </div>

                                    <p className="text-xs sm:text-sm text-[#8064C8] font-medium mb-6">
                                        Your friendly money buddy. Ask me anything about budgeting, saving, or tracking your expenses!
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-left">

                                        {[
                                            "💡 How can I start saving more each month?",
                                            "📊 Help me review my recent spending",
                                            "🎯 How do I build a smart emergency fund?",
                                            "💸 Give me a quick tip on smart budgeting"
                                        ].map(
                                            (
                                                promptText,
                                                idx
                                            ) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setMessage(
                                                            promptText.replace(
                                                                /^[^\s]+\s/,
                                                                ""
                                                            )
                                                        );
                                                    }}
                                                    className="p-3 bg-white hover:bg-[#FAF9FF] border border-[#EAE3FA] rounded-2xl text-xs text-[#5B3F91] font-medium text-left transition-all hover:border-[#8064C8] shadow-xs cursor-pointer flex items-center gap-2"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5 text-[#A98FE3] shrink-0" />

                                                    <span className="truncate">
                                                        {promptText}
                                                    </span>

                                                </button>
                                            )
                                        )}

                                    </div>

                                </div>

                            </div>
                        )}

                        {messages.map(
                            (msg, index) => (
                                <div
                                    key={
                                        msg.id ||
                                        index
                                    }
                                    className={
                                        msg.role ===
                                            "user"
                                            ? "flex justify-end"
                                            : "flex justify-start"
                                    }
                                >

                                    <div
                                        className={
                                            msg.role ===
                                                "user"
                                                ? "max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-[#8064C8] text-white px-4 py-3 text-xs sm:text-sm shadow-md shadow-[#8064C8]/20 leading-relaxed"
                                                : "max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tl-xs bg-[#F4EFFC] border border-[#EAE3FA] text-[#5B3F91] px-4 py-3 text-xs sm:text-sm shadow-xs leading-relaxed flex items-start gap-2.5"
                                        }
                                    >

                                        {msg.role ===
                                            "assistant" && (
                                                <div className="w-6 h-6 rounded-full bg-[#EAE3FA] flex items-center justify-center overflow-hidden shrink-0 mt-0.5 p-0.5">

                                                    <Image
                                                        src="/penny.png"
                                                        alt="Penny"
                                                        width={24}
                                                        height={24}
                                                        className="w-full h-full object-contain"
                                                    />

                                                </div>
                                            )}

                                        <div className="whitespace-pre-wrap">
                                            {msg.content}
                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                        {loading && (
                            <div className="flex justify-start">

                                <div className="rounded-2xl rounded-tl-xs bg-[#F4EFFC] border border-[#EAE3FA] text-[#8064C8] px-4 py-3 text-xs sm:text-sm shadow-xs flex items-center gap-2.5 animate-pulse">

                                    <div className="w-6 h-6 rounded-full bg-[#EAE3FA] flex items-center justify-center overflow-hidden shrink-0 p-0.5">

                                        <Image
                                            src="/penny.png"
                                            alt="Penny Thinking"
                                            width={24}
                                            height={24}
                                            className="w-full h-full object-contain"
                                        />

                                    </div>

                                    <span className="font-semibold">
                                        Penny is thinking...
                                    </span>

                                </div>

                            </div>
                        )}

                        <div ref={messagesEndRef} />

                    </div>

                    {/* Input Bar Area */}

                    <div className="pt-3 border-t border-[#EAE3FA] shrink-0 mt-2">

                        <div className="relative flex items-center">

                            <input
                                type="text"
                                value={message}
                                onChange={(e) =>
                                    setMessage(
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (
                                        e.key ===
                                        "Enter"
                                    ) {
                                        sendMessage();
                                    }
                                }}
                                placeholder="Ask Penny about your expenses, budgets, or goals..."
                                className="w-full pl-4 pr-24 py-3 bg-white rounded-full border border-[#EAE3FA] text-[#5B3F91] placeholder-[#C9B9F2] focus:outline-none focus:ring-2 focus:ring-[#8064C8] shadow-sm transition-all text-xs sm:text-sm"
                            />

                            <button
                                onClick={
                                    sendMessage
                                }
                                disabled={
                                    loading ||
                                    !message.trim()
                                }
                                className="absolute right-1.5 py-2 px-4 sm:px-5 bg-[#8064C8] hover:bg-[#6F53B7] active:scale-[0.98] text-white font-semibold rounded-full shadow-md shadow-[#8064C8]/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >

                                <span>
                                    {loading
                                        ? "..."
                                        : "Send"}
                                </span>

                                <Send className="w-3.5 h-3.5" />

                            </button>

                        </div>

                    </div>

                </div>

            </main>

            {/* Bottom Footer note */}

            <footer className="relative z-10 py-2 text-center text-[11px] text-[#A98FE3] font-medium shrink-0">
                PennyPal &copy; 2026 &bull; AI Financial Assistant
            </footer>

        </div>
    );
}

