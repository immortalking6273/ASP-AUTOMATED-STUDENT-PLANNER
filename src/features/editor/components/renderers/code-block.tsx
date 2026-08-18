"use client";

import * as React from "react";
import { EditorBlock } from "../../types";
import { Code } from "lucide-react";

interface CodeBlockProps {
  block: EditorBlock;
  onChange: (text: string, language: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

const LANGUAGES = ["javascript", "typescript", "python", "sql", "html", "css", "cpp", "json", "bash"];

export function CodeBlock({ block, onChange, onEnter, onBackspaceEmpty }: CodeBlockProps) {
  const text = block.content?.text || "";
  const language = block.content?.language || "javascript";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" && text === "") {
      e.preventDefault();
      onBackspaceEmpty();
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-slate-950 dark:bg-black p-4 text-slate-100 font-mono text-xs sm:text-sm my-1 space-y-2 w-full shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-bold">
          <Code className="h-3.5 w-3.5 text-cyan-400" />
          <span>Code Block</span>
        </div>
        <select
          value={language}
          onChange={(e) => onChange(text, e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value, language)}
        onKeyDown={handleKeyDown}
        placeholder="// Paste or write code here..."
        rows={Math.max(2, text.split("\n").length)}
        className="w-full bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none font-mono text-xs sm:text-sm leading-relaxed"
      />
    </div>
  );
}
