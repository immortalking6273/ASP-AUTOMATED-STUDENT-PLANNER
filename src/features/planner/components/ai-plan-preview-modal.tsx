"use client";

import * as React from "react";
import { Sparkles, X, Check, RefreshCw, Calendar, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIStudyPlanResponse } from "../types";

interface AIPlanPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: AIStudyPlanResponse | null;
  onAccept: () => Promise<void>;
  onRegenerate: () => Promise<void>;
  isGenerating: boolean;
}

export function AIPlanPreviewModal({
  isOpen,
  onClose,
  plan,
  onAccept,
  onRegenerate,
  isGenerating,
}: AIPlanPreviewModalProps) {
  const [isAccepting, setIsAccepting] = React.useState(false);

  if (!isOpen || !plan) return null;

  const handleAcceptClick = async () => {
    setIsAccepting(true);
    try {
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl p-6 space-y-5 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-foreground">Suggested AI Study Plan</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded-full">
                  NVIDIA NIM
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Generated based on your priorities and upcoming deadlines</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI Strategy Summary Box */}
        <div className="p-3.5 rounded-2xl border border-primary/25 bg-primary/5 text-xs text-foreground leading-relaxed">
          <span className="font-bold text-primary mr-1">Strategy Summary:</span>
          {plan.summary}
        </div>

        {/* Sessions List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
            <span>Proposed Study Sessions ({plan.sessions?.length || 0})</span>
            <span>Total: {plan.totalStudyMinutes || 0} mins</span>
          </div>

          <div className="min-h-[160px] max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {plan.sessions && plan.sessions.length > 0 ? (
              plan.sessions.map((session, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl border border-border bg-background/80 text-xs shadow-2xs hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-bold text-foreground">{session.title}</h5>
                      <p className="text-[11px] text-muted-foreground">{session.subject}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{session.startTime} – {session.endTime}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No study sessions generated.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating || isAccepting}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="rounded-xl text-xs"
          >
            {isGenerating ? "Regenerating..." : "Regenerate"}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAcceptClick}
            disabled={isGenerating || isAccepting}
            leftIcon={<Check className="h-4 w-4" />}
            className="rounded-xl text-xs font-semibold shadow-xs"
          >
            {isAccepting ? "Saving Sessions..." : "Accept Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
