"use client";

import * as React from "react";
import { X, Play, RotateCw, CheckCircle2, FileText, Sparkles, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedQuizPreview } from "../types";

interface QuizPreviewDialogProps {
  open: boolean;
  preview: GeneratedQuizPreview | null;
  onClose: () => void;
  onStartQuiz: () => Promise<void>;
  onRegenerate: () => void;
}

export function QuizPreviewDialog({
  open,
  preview,
  onClose,
  onStartQuiz,
  onRegenerate,
}: QuizPreviewDialogProps) {
  const [isStarting, setIsStarting] = React.useState(false);

  if (!open || !preview) return null;

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onStartQuiz();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-violet-500/10 via-card to-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground">Quiz Ready to Start</h2>
              <p className="text-[11px] text-muted-foreground">
                Review quiz summary and questions before starting exam mode
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Summary Box */}
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">{preview.title}</h3>
              <span className="text-xs font-bold text-violet-400 bg-violet-500/15 px-2.5 py-0.5 rounded-full border border-violet-500/25">
                {preview.questions.length} Questions
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Source: {preview.sourceTitle}
              </span>
              <span className="capitalize font-semibold text-foreground">
                Difficulty: {preview.difficulty}
              </span>
            </div>
          </div>

          {/* Question List Preview */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
              Question Preview ({preview.questions.length})
            </h4>

            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
              {preview.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/80 bg-card/70 p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                    <span className="font-extrabold text-violet-400">
                      Question #{idx + 1} • {q.type.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="capitalize">{q.difficulty}</span>
                  </div>
                  <p className="text-xs font-bold text-foreground">Q: {q.question}</p>
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-muted-foreground">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="bg-background/60 px-2 py-1 rounded-lg truncate">
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-card/60 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isStarting}>
            Cancel
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onRegenerate} disabled={isStarting}>
              <RotateCw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
            <Button onClick={handleStart} disabled={isStarting} className="gap-2 font-extrabold cursor-pointer">
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  Start Quiz Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
