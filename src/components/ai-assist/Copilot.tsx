"use client";

import { useState } from "react";

export default function Copilot() {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsg = { role: "user" as const, text: input };
    setMessages([...messages, newMsg]);
    setInput("");
    // TODO: Connect to backend API
  };

  return (
    <div className="flex flex-col h-full w-full border border-purple-200 rounded-lg overflow-hidden shadow-sm dark:border-purple-800">
      <div className="bg-purple-50 border-b border-purple-200 p-3 dark:bg-purple-950 dark:border-purple-800">
        <h2 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
          The Muse (AI Copilot)
        </h2>
      </div>

      <div className="flex-1 p-4 bg-white overflow-y-auto flex flex-col gap-3 dark:bg-zinc-950">
        {messages.length === 0 ? (
          <div className="text-sm text-zinc-400 text-center mt-10">
            How can I assist your story today?
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm max-w-[85%] ${
                m.role === "ai"
                  ? "bg-purple-100 text-purple-900 self-start dark:bg-purple-900 dark:text-purple-100"
                  : "bg-zinc-100 text-zinc-800 self-end dark:bg-zinc-800 dark:text-zinc-200"
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-zinc-100 bg-zinc-50 flex gap-2 dark:border-zinc-800 dark:bg-zinc-900">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question or brainstorm..."
          className="flex-1 bg-white border border-zinc-300 rounded px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
