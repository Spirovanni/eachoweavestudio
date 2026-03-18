import React, { useState } from 'react';

/**
 * Copilot Component (The Muse)
 * Conversational AI interface for brainstorming and generating assets.
 */
export default function Copilot() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsg = { role: 'user' as const, text: input };
    setMessages([...messages, newMsg]);
    setInput('');
    // TODO: Connect to backend API
  };

  return (
    <div className="flex flex-col h-full w-full border border-purple-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-purple-50 border-b border-purple-200 p-3">
        <h2 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
          <span>✨</span> The Muse (AI Copilot)
        </h2>
      </div>
      
      <div className="flex-1 p-4 bg-white overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-400 text-center mt-10">
            How can I assist your story today?
          </div>
        ) : (
          messages.map((m, i) => (
             <div key={i} className={`p-3 rounded-lg text-sm max-w-[85%] ${m.role === 'ai' ? 'bg-purple-100 text-purple-900 self-start' : 'bg-gray-100 text-gray-800 self-end'}`}>
               {m.text}
             </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question or brainstorm..."
          className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
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
