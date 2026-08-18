"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Loader2, Save } from "lucide-react";
import { FaqWithCategory, FaqCategoryRow, FaqCreatePayload, FaqUpdatePayload } from "../types";

interface AdminFaqDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: FaqCategoryRow[];
  editingFaq: FaqWithCategory | null;
  onSave: (payload: FaqCreatePayload | FaqUpdatePayload) => Promise<boolean>;
  isSaving: boolean;
}

export function AdminFaqDialog({
  isOpen,
  onClose,
  categories,
  editingFaq,
  onSave,
  isSaving,
}: AdminFaqDialogProps) {
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [status, setStatus] = React.useState<"draft" | "published" | "archived">("published");
  const [sortOrder, setSortOrder] = React.useState<number>(0);

  React.useEffect(() => {
    if (editingFaq) {
      setQuestion(editingFaq.question);
      setAnswer(editingFaq.answer);
      setCategoryId(editingFaq.category_id || "");
      setStatus(editingFaq.status);
      setSortOrder(editingFaq.sort_order || 0);
    } else {
      setQuestion("");
      setAnswer("");
      setCategoryId(categories[0]?.id || "");
      setStatus("published");
      setSortOrder(0);
    }
  }, [editingFaq, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    let ok = false;
    if (editingFaq) {
      ok = await onSave({
        id: editingFaq.id,
        question: question.trim(),
        answer: answer.trim(),
        category_id: categoryId || null,
        status,
        sort_order: Number(sortOrder),
      });
    } else {
      ok = await onSave({
        question: question.trim(),
        answer: answer.trim(),
        category_id: categoryId || null,
        status,
        sort_order: Number(sortOrder),
      });
    }

    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">
              {editingFaq ? "Edit FAQ Entry" : "Create New FAQ Entry"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage question, answer, category, and publication status.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Publication Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="published">Published</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Sort Order (Numeric)</label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              placeholder="0"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Question *</label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How does AI Flashcard generation work?"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Answer *</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a detailed, helpful answer..."
              rows={5}
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
              disabled={isSaving}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || !question.trim() || !answer.trim()}
              className="gap-2 font-extrabold cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingFaq ? "Save Changes" : "Create FAQ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
