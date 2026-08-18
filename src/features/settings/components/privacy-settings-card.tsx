"use client";

import * as React from "react";
import { UserPreferencesRow } from "../types";
import { Eye, Shield, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivacySettingsCardProps {
  preferences: UserPreferencesRow | null;
  onUpdatePreferences: (patch: Partial<UserPreferencesRow>) => Promise<void>;
}

export function PrivacySettingsCard({
  preferences,
  onUpdatePreferences,
}: PrivacySettingsCardProps) {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-black tracking-tight text-foreground">Privacy & Data Governance</h2>
        <p className="text-xs text-muted-foreground">
          Control how your AI conversation history and document telemetry are handled.
        </p>
      </div>

      <div className="space-y-4">
        {/* SAVE CHAT HISTORY TOGGLE */}
        <div
          onClick={() =>
            onUpdatePreferences({ save_chat_history: !(preferences?.save_chat_history ?? true) })
          }
          className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-accent/40 cursor-pointer transition-colors"
        >
          <div className="space-y-0.5 pr-4">
            <h4 className="text-xs font-bold text-foreground">Save AI Conversation History</h4>
            <p className="text-[11px] text-muted-foreground">
              When enabled, your AI Chat conversations are stored for past session review.
            </p>
          </div>

          <div
            className={cn(
              "h-6 w-11 rounded-full p-0.5 transition-colors flex items-center shrink-0 cursor-pointer",
              preferences?.save_chat_history ?? true ? "bg-primary" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "h-5 w-5 rounded-full bg-white shadow-md transform transition-transform",
                preferences?.save_chat_history ?? true ? "translate-x-5" : "translate-x-0"
              )}
            />
          </div>
        </div>

        {/* DATA PRIVACY EXPLANATION */}
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-indigo-300">Privacy Guarantees</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            ASP enforces PostgreSQL Row-Level Security (RLS) on all notebooks, notes, documents, and flashcards. Your private study materials are isolated strictly to your account identity.
          </p>
        </div>
      </div>
    </div>
  );
}
