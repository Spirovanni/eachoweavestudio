import React, { useState } from 'react';

/**
 * ChapterEditor Component
 * A rich-text editor for Co-authors to draft narrative chapters with AI integration.
 */
export default function ChapterEditor({ chapterId }: { chapterId: string }) {
  const [content, setContent] = useState('');

  return (
    <div className="flex flex-col h-full w-full border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Chapter Editor</h2>
        <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
          Save
        </button>
      </div>
      <div className="flex-1 p-4 bg-white">
        <textarea 
          className="w-full h-full resize-none outline-none text-gray-800 leading-relaxed font-serif"
          placeholder="Start writing your chapter..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
}
