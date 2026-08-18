"use client";

import * as React from "react";
import { Settings, Zap, X, Layers, BookOpen, Bot, Terminal } from "lucide-react";
import { AIResponseMode } from "../types";

interface ConversationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  responseMode?: AIResponseMode;
  onResponseModeChange?: (mode: AIResponseMode) => void;
  isDeveloperMode?: boolean;
  onToggleDeveloperMode?: (enabled: boolean) => void;
}

export function ConversationSettings({
  isOpen,
  onClose,
  responseMode = "hybrid",
  onResponseModeChange,
  isDeveloperMode = false,
  onToggleDeveloperMode,
}: ConversationSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in-0">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="text-base font-extrabold text-foreground">AI Response & Retrieval Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI Response Mode Options */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>AI Response Mode</span>
          </label>

          <div className="grid gap-2.5">
            {/* Hybrid Mode (Default) */}
            <label
              onClick={() => onResponseModeChange?.("hybrid")}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                responseMode === "hybrid"
                  ? "border-primary bg-primary/5 shadow-2xs"
                  : "border-border/60 hover:bg-accent/40"
              }`}
            >
              <input
                type="radio"
                name="responseMode"
                checked={responseMode === "hybrid"}
                onChange={() => onResponseModeChange?.("hybrid")}
                className="mt-0.5 accent-primary"
              />
              <div className="space-y-0.5 text-xs">
                <div className="font-extrabold text-foreground flex items-center gap-1.5">
                  <span>📚 + 🤖 Hybrid Mode</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">Default & Recommended</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Prioritizes uploaded documents. If documents don't contain full information, seamlessly supplements with AI general knowledge.
                </p>
              </div>
            </label>

            {/* Document-Focused Mode */}
            <label
              onClick={() => onResponseModeChange?.("strict_document")}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                responseMode === "strict_document"
                  ? "border-emerald-500 bg-emerald-500/5 shadow-2xs"
                  : "border-border/60 hover:bg-accent/40"
              }`}
            >
              <input
                type="radio"
                name="responseMode"
                checked={responseMode === "strict_document"}
                onChange={() => onResponseModeChange?.("strict_document")}
                className="mt-0.5 accent-emerald-500"
              />
              <div className="space-y-0.5 text-xs">
                <div className="font-extrabold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                  <span>📚 Document-Focused Hybrid Mode</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Prioritizes uploaded study materials and notes. Seamlessly uses general AI knowledge if specific document context is missing.
                </p>
              </div>
            </label>

            {/* General AI Mode */}
            <label
              onClick={() => onResponseModeChange?.("general_ai")}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                responseMode === "general_ai"
                  ? "border-indigo-500 bg-indigo-500/5 shadow-2xs"
                  : "border-border/60 hover:bg-accent/40"
              }`}
            >
              <input
                type="radio"
                name="responseMode"
                checked={responseMode === "general_ai"}
                onChange={() => onResponseModeChange?.("general_ai")}
                className="mt-0.5 accent-indigo-500"
              />
              <div className="space-y-0.5 text-xs">
                <div className="font-extrabold text-foreground flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-indigo-500" />
                  <span>🤖 General AI Mode</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Answers using the model's general academic knowledge and supplements with document context when available.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Developer Diagnostics Mode Toggle */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-foreground">
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Terminal className="h-4 w-4 text-amber-500" />
              Developer Diagnostics Mode
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDeveloperMode}
                onChange={(e) => onToggleDeveloperMode?.(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {isDeveloperMode
              ? "Developer Diagnostics ON: Displays retrieved chunk metrics, similarity scores, and threshold details below responses."
              : "Developer Diagnostics OFF (Default): Hides all internal RAG debug panels for a clean student chat experience."}
          </p>
        </div>

        {/* LLM Engine Info */}
        <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              Primary LLM Provider
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">NVIDIA NIM Hosted API</span>
          </div>
          <p className="text-muted-foreground">
            Model: <code className="rounded bg-muted px-1 font-mono text-[11px] text-foreground">meta/llama-3.3-70b-instruct</code>
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
