"use client";

import { useState } from "react";

export default function ChapterEditor({ chapterId }: { chapterId: string }) {
  const [content, setContent] = useState("");

  return (
    <div className="flex flex-col h-full w-full border border-zinc-200 rounded-lg overflow-hidden dark:border-zinc-800">
      <div className="bg-zinc-50 border-b border-zinc-200 p-2 flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Chapter Editor
        </h2>
        <button className="text-xs bg-zinc-900 text-white px-3 py-1 rounded hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
          Save
        </button>
      </div>
      <div className="flex-1 p-4 bg-white dark:bg-zinc-950">
        <textarea
          className="w-full h-full resize-none outline-none text-zinc-800 leading-relaxed font-serif dark:text-zinc-200 dark:bg-zinc-950"
          placeholder="Start writing your chapter..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
}
