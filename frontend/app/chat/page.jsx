"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/db";

const CONVERSATION_ID = "main";

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // --------------------------------
    // LOAD CHAT HISTORY
    // --------------------------------

    useEffect(() => {
        loadMessages();
    }, []);

    async function loadMessages() {
        try {
            const savedMessages = await db.messages
                .where("conversationId")
                .equals(CONVERSATION_ID)
                .sortBy("createdAt");

            setMessages(savedMessages);
        } catch (error) {
            console.error(
                "Failed to load chat history:",
                error
            );
        }
    }

    // --------------------------------
    // SEND MESSAGE
    // --------------------------------

    async function sendMessage() {
        if (!message.trim() || loading) {
            return;
        }

        const userMessage = message.trim();

        setMessage("");
        setLoading(true);

        try {
            // -----------------------------
            // SAVE USER MESSAGE LOCALLY
            // -----------------------------

            const userMessageObject = {
                conversationId: CONVERSATION_ID,
                role: "user",
                content: userMessage,
                createdAt: Date.now()
            };

            await db.messages.add(userMessageObject);

            // Show immediately in UI
            setMessages((prev) => [
                ...prev,
                userMessageObject
            ]);

            // -----------------------------
            // GET LOCAL CHAT HISTORY
            // -----------------------------

            const history = await db.messages
                .where("conversationId")
                .equals(CONVERSATION_ID)
                .sortBy("createdAt");

            // We don't need to send the current
            // message twice.
            const previousMessages = history
                .slice(0, -1)
                .map((msg) => ({
                    role: msg.role,
                    content: msg.content
                }));

            // -----------------------------
            // SEND TO BACKEND
            // -----------------------------

            const response = await fetch(
                "http://localhost:5000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        message: userMessage,
                        history: previousMessages
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Something went wrong"
                );
            }

            // -----------------------------
            // SAVE PENNY RESPONSE
            // -----------------------------

            const pennyMessage = {
                conversationId: CONVERSATION_ID,
                role: "assistant",
                content: data.response,
                createdAt: Date.now()
            };

            await db.messages.add(pennyMessage);

            // Show Penny's response
            setMessages((prev) => [
                ...prev,
                pennyMessage
            ]);
        } catch (error) {
            console.error(
                "Chat error:",
                error
            );

            const errorMessage = {
                conversationId: CONVERSATION_ID,
                role: "assistant",
                content:
                    "Oops! My penguin brain hit a tiny iceberg. 🐧 Please try again.",
                createdAt: Date.now()
            };

            setMessages((prev) => [
                ...prev,
                errorMessage
            ]);
        } finally {
            setLoading(false);
        }
    }

    // --------------------------------
    // NEW CHAT
    // --------------------------------

    async function startNewChat() {
        await db.messages
            .where("conversationId")
            .equals(CONVERSATION_ID)
            .delete();

        setMessages([]);
    }

    return (
        <main className="min-h-screen bg-white p-6">
            <div className="mx-auto flex max-w-2xl flex-col">

                {/* HEADER */}

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-purple-900">
                            🐧 Penny
                        </h1>

                        <p className="text-gray-500">
                            Your money buddy
                        </p>
                    </div>

                    <button
                        onClick={startNewChat}
                        className="rounded-xl border px-4 py-2 text-sm"
                    >
                        New Chat
                    </button>
                </div>

                {/* CHAT */}

                <div className="mb-6 min-h-[400px] space-y-4 rounded-2xl bg-purple-50 p-5">

                    {messages.length === 0 && (
                        <div className="flex h-[350px] items-center justify-center text-center text-gray-500">
                            <div>
                                <div className="mb-3 text-5xl">
                                    🐧
                                </div>

                                <p className="font-medium">
                                    Hey! I'm Penny 💜
                                </p>

                                <p className="text-sm">
                                    Tell me what's happening
                                    with your money.
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={msg.id || index}
                            className={
                                msg.role === "user"
                                    ? "flex justify-end"
                                    : "flex justify-start"
                            }
                        >
                            <div
                                className={
                                    msg.role === "user"
                                        ? "max-w-[80%] rounded-2xl rounded-br-sm bg-purple-600 p-4 text-white"
                                        : "max-w-[80%] rounded-2xl rounded-bl-sm bg-white p-4 text-gray-800 shadow-sm"
                                }
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                                🐧 Penny is thinking...
                            </div>
                        </div>
                    )}
                </div>

                {/* INPUT */}

                <div className="flex gap-2">

                    <input
                        value={message}
                        onChange={(e) =>
                            setMessage(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        placeholder="Talk to Penny..."
                        className="flex-1 rounded-xl border border-gray-300 p-3 outline-none focus:border-purple-500"
                    />

                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className="rounded-xl bg-purple-600 px-6 py-3 font-medium text-white disabled:opacity-50"
                    >
                        {loading ? "..." : "Send"}
                    </button>

                </div>

            </div>
        </main>
    );
}