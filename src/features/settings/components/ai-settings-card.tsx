"use client";

import * as React from "react";
import { UserPreferencesRow } from "../types";
import { Cpu, Bot, Sparkles, FileText, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiSettingsCardProps {
  preferences: UserPreferencesRow | null;
  onUpdatePreferences: (patch: Partial<UserPreferencesRow>) => Promise<void>;
}

export function AiSettingsCard({ preferences, onUpdatePreferences }: AiSettingsCardProps) {
  const responseStyles = [
    { id: "concise", label: "Concise", desc: "Short, direct bullet points for rapid review." },
    { id: "balanced", label: "Balanced (Recommended)", desc: "Well-structured explanations with key examples." },
    { id: "detailed", label: "Detailed", desc: "Comprehensive breakdown with step-by-step academic depth." },
  ];

  const languages = [
    { id: "auto", label: "Auto (Matches Material)" },
    { id: "en", label: "English" },
    { id: "ta", label: "Tamil (தமிழ்)" },
  ];

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-black tracking-tight text-foreground">AI & RAG Preferences</h2>
        <p className="text-xs text-muted-foreground">
          Configure response style, language preferences, and citation display for ASP's AI engine.
        </p>
      </div>

      {/* AI PROVIDER DISPLAY */}
      <div className="p-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 space-y-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-violet-400 animate-pulse" />
          <h4 className="text-xs font-black text-violet-300">NVIDIA NIM Infrastructure</h4>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          ASP uses NVIDIA NIM microservices with low-latency LLM inference. API keys remain encrypted server-side.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/40">
            Model: llama-3.3-70b-instruct
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
            Hybrid RAG Active
          </span>
        </div>
      </div>

      {/* RESPONSE STYLE PREFERENCE */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground">Default AI Response Detail</label>
        <div className="grid grid-cols-1 gap-2">
          {responseStyles.map((item) => {
            const isSelected = (preferences?.response_style || "balanced") === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onUpdatePreferences({ response_style: item.id as any })}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs"
                    : "border-border/80 bg-card/60 hover:bg-accent/40"
                )}
              >
                <div>
                  <h4 className="text-xs font-bold text-foreground">{item.label}</h4>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ml-3",
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LANGUAGE PREFERENCE */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground">Preferred AI Response Language</label>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((lang) => {
            const isSelected = (preferences?.ai_language || "auto") === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => onUpdatePreferences({ ai_language: lang.id as any })}
                className={cn(
                  "p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center truncate",
                  isSelected
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/80 bg-card/60 text-muted-foreground hover:bg-accent/40"
                )}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CITATIONS TOGGLE */}
      <div
        onClick={() =>
          onUpdatePreferences({ show_citations: !(preferences?.show_citations ?? true) })
        }
        className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-accent/40 cursor-pointer transition-colors"
      >
        <div className="space-y-0.5 pr-4">
          <h4 className="text-xs font-bold text-foreground">Show RAG Document Citations</h4>
          <p className="text-[11px] text-muted-foreground">
            Display page source numbers and document references when AI fetches notes or PDFs.
          </p>
        </div>

        <div
          className={cn(
            "h-6 w-11 rounded-full p-0.5 transition-colors flex items-center shrink-0 cursor-pointer",
            preferences?.show_citations ?? true ? "bg-primary" : "bg-muted"
          )}
        >
          <div
            className={cn(
              "h-5 w-5 rounded-full bg-white shadow-md transform transition-transform",
              preferences?.show_citations ?? true ? "translate-x-5" : "translate-x-0"
            )}
          />
        </div>
      </div>
    </div>
  );
}
