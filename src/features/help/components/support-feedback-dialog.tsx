"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, Send } from "lucide-react";
import { SupportFeedbackPayload } from "../types";

interface SupportFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SupportFeedbackPayload) => Promise<boolean>;
  isSubmitting: boolean;
}

export function SupportFeedbackDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: SupportFeedbackDialogProps) {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [category, setCategory] = React.useState("general");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const ok = await onSubmit({
      subject: subject.trim(),
      message: message.trim(),
      category,
    });

    if (ok) {
      setSubject("");
      setMessage("");
      setCategory("general");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">Contact Support & Feedback</h3>
            <p className="text-xs text-muted-foreground">
              Have a question or feature suggestion? Let us know how we can improve ASP.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Topic Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="general">General Support</option>
              <option value="ai">AI Assistant & RAG</option>
              <option value="planner">Study Planner & Calendar</option>
              <option value="documents">Document Processing</option>
              <option value="bug">Report a Bug</option>
              <option value="feedback">Feature Idea</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Subject *</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Question about flashcard spaced repetition"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question in detail..."
              rows={4}
              required
              className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="gap-2 font-extrabold cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
