"use client";

import * as React from "react";
import { DeterministicInsight, AIInsightResult } from "../types";
import { Sparkles, CheckCircle2, AlertTriangle, Info, Loader2, Lightbulb, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiInsightsModalProps {
  insights: DeterministicInsight[];
  aiInsights: AIInsightResult | null;
  isAiLoading: boolean;
  onFetchAi: () => void;
}

export function AiInsightsModal({
  insights,
  aiInsights,
  isAiLoading,
  onFetchAi,
}: AiInsightsModalProps) {
  return (
    <div className="rounded-3xl border border-border bg-card/80 p-6 space-y-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
              Learning Insights & Productivity Intelligence
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Empirical observations and AI-powered academic performance analysis
          </p>
        </div>

        <Button
          size="sm"
          onClick={onFetchAi}
          disabled={isAiLoading}
          className="gap-1.5 text-xs font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white cursor-pointer shrink-0"
        >
          {isAiLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analyzing Data...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI About My Progress
            </>
          )}
        </Button>
      </div>

      {/* Deterministic Insights List */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Data-Backed Insights ({insights.length})
        </span>

        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((item) => {
              let icon = <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
              let borderColor = "border-emerald-500/25 bg-emerald-500/5";

              if (item.type === "warning") {
                icon = <AlertTriangle className="h-4 w-4 text-amber-400" />;
                borderColor = "border-amber-500/25 bg-amber-500/5";
              } else if (item.type === "info") {
                icon = <Info className="h-4 w-4 text-violet-400" />;
                borderColor = "border-violet-500/25 bg-violet-500/5";
              }

              return (
                <div key={item.id} className={`rounded-2xl border p-4 space-y-1 ${borderColor}`}>
                  <div className="flex items-center gap-2">
                    {icon}
                    <h4 className="text-xs font-extrabold text-foreground">{item.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-border text-xs text-muted-foreground text-center">
            Complete study sessions, tasks, and quizzes to generate data-backed insights.
          </div>
        )}
      </div>

      {/* AI Generated Insights Section */}
      {aiInsights && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 border-b border-violet-500/20 pb-3">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <h4 className="text-xs font-black uppercase text-violet-300 tracking-wider">
              NVIDIA NIM AI Study Advisor Analysis
            </h4>
          </div>

          <p className="text-xs font-semibold text-foreground leading-relaxed bg-background/60 p-3 rounded-xl border border-border/50">
            "{aiInsights.summary}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Strengths */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
              <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Identified Strengths
              </span>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                {aiInsights.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Areas Needing Focus
              </span>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                {aiInsights.areasToImprove.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
              <span className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Actionable Recommendations
              </span>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                {aiInsights.recommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
