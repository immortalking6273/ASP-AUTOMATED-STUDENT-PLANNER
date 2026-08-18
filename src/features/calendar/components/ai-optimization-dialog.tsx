"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Check, Trash2, Loader2, Calendar, Clock, ArrowRight } from "lucide-react";
import { AIScheduleSuggestion } from "@/app/api/calendar/optimize/route";
import { StudyPlannerService } from "@/services/db/study-planner-service";
import { toast } from "@/components/ui/toast";

interface AIOptimizationDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string | null;
  onSuccess: () => void;
}

export function AIOptimizationDialog({
  open,
  onClose,
  workspaceId,
  onSuccess,
}: AIOptimizationDialogProps) {
  const [suggestions, setSuggestions] = React.useState<AIScheduleSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchOptimization = React.useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate AI recommendations.");
      }

      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      console.error("[AIOptimizationDialog]", err);
      setError(err.message || "Failed to analyze schedule.");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  React.useEffect(() => {
    if (open) {
      fetchOptimization();
    }
  }, [open, fetchOptimization]);

  const handleAccept = async (sug: AIScheduleSuggestion) => {
    if (!workspaceId) return;
    setProcessingId(sug.id);
    try {
      await StudyPlannerService.createStudySession({
        workspaceId,
        title: sug.title,
        subject: sug.subject || "General",
        startTime: sug.startTime,
        endTime: sug.endTime,
        notes: `AI Recommendation: ${sug.reason}`,
      });

      toast.success(`Scheduled: "${sug.title}"`);
      setSuggestions((prev) => prev.filter((item) => item.id !== sug.id));
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save study session.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (sugId: string) => {
    setSuggestions((prev) => prev.filter((item) => item.id !== sugId));
    toast.info("Suggestion dismissed");
  };

  const handleAcceptAll = async () => {
    if (!workspaceId || suggestions.length === 0) return;
    setLoading(true);
    try {
      for (const sug of suggestions) {
        await StudyPlannerService.createStudySession({
          workspaceId,
          title: sug.title,
          subject: sug.subject || "General",
          startTime: sug.startTime,
          endTime: sug.endTime,
          notes: `AI Recommendation: ${sug.reason}`,
        });
      }
      toast.success(`Accepted all ${suggestions.length} recommendations!`);
      setSuggestions([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept all recommendations.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Dialog container */}
      <div className="relative w-full max-w-lg rounded-2xl border border-primary/30 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground">AI Schedule Optimizer</h2>
              <p className="text-[10px] text-muted-foreground">Powered by NVIDIA NIM Hosted API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent/70 hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-xs font-bold text-foreground">Analyzing workload & deadlines…</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                NVIDIA NIM AI is reviewing your tasks, priority levels, and target study dates.
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-xs font-semibold text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchOptimization}>
                Retry Analysis
              </Button>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-xs font-bold text-foreground">No Optimization Suggestions</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                Your current schedule is well optimized, or no active tasks are due in the next 14 days!
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  AI Recommendations ({suggestions.length})
                </span>
                <Button variant="secondary" size="sm" onClick={handleAcceptAll} className="h-7 text-xs gap-1">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Accept All
                </Button>
              </div>

              <div className="space-y-3">
                {suggestions.map((sug) => {
                  const start = new Date(sug.startTime);
                  const end = new Date(sug.endTime);
                  const isProc = processingId === sug.id;

                  return (
                    <div
                      key={sug.id}
                      className="rounded-xl border border-border bg-card/70 p-3.5 space-y-2.5 transition-all hover:border-primary/40 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{sug.title}</span>
                            {sug.subject && (
                              <span className="px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-[10px] font-semibold text-violet-300">
                                {sug.subject}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                            {sug.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground bg-accent/40 rounded-lg px-2.5 py-1.5 border border-border/40">
                        <Clock className="h-3 w-3 text-primary flex-shrink-0" />
                        <span>
                          {start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <span>•</span>
                        <span>
                          {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                          {" – "}
                          {end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleReject(sug.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(sug)}
                          disabled={isProc}
                          className="h-7 text-xs gap-1"
                        >
                          {isProc ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Accept
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
