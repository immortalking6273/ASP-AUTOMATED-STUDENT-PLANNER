"use client";

import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlashcardDeckRow } from "@/services/db/flashcards-service";

interface FlashcardDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    deckId?: string | null;
    deckName?: string;
    front: string;
    back: string;
    hint?: string;
    difficulty?: "easy" | "medium" | "hard";
  }) => Promise<void>;
  decks: FlashcardDeckRow[];
  defaultDeckId?: string | null;
  initialValues?: {
    front: string;
    back: string;
    hint?: string;
    difficulty?: "easy" | "medium" | "hard";
    deckId?: string | null;
  };
  title?: string;
}

export function FlashcardDialog({
  open,
  onClose,
  onSubmit,
  decks,
  defaultDeckId,
  initialValues,
  title = "Add Flashcard",
}: FlashcardDialogProps) {
  const [deckId, setDeckId] = React.useState<string>(initialValues?.deckId || defaultDeckId || "");
  const [front, setFront] = React.useState(initialValues?.front || "");
  const [back, setBack] = React.useState(initialValues?.back || "");
  const [hint, setHint] = React.useState(initialValues?.hint || "");
  const [difficulty, setDifficulty] = React.useState<"easy" | "medium" | "hard">(
    initialValues?.difficulty || "medium"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDeckId(initialValues?.deckId || defaultDeckId || (decks[0]?.id || ""));
      setFront(initialValues?.front || "");
      setBack(initialValues?.back || "");
      setHint(initialValues?.hint || "");
      setDifficulty(initialValues?.difficulty || "medium");
      setError(null);
    }
  }, [open, initialValues, defaultDeckId, decks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim()) {
      setError("Front (Question) is required.");
      return;
    }
    if (!back.trim()) {
      setError("Back (Answer) is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const selectedDeck = decks.find((d) => d.id === deckId);
      await onSubmit({
        deckId: selectedDeck ? selectedDeck.id : null,
        deckName: selectedDeck ? selectedDeck.name : "General",
        front,
        back,
        hint,
        difficulty,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save flashcard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-extrabold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Deck Select */}
          {decks.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Deck
              </label>
              <select
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="">General (No Deck)</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.subject ? `(${d.subject})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Front (Question) */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Front (Question / Prompt) <span className="text-destructive">*</span>
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="e.g. What is encapsulation in Object-Oriented Programming?"
              rows={3}
              autoFocus
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-medium"
            />
          </div>

          {/* Back (Answer) */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Back (Answer / Explanation) <span className="text-destructive">*</span>
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="e.g. Encapsulation is wrapping data and methods into a single unit while restricting direct access."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-medium"
            />
          </div>

          {/* Hint */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Hint <span className="text-muted-foreground/50">(optional memory trigger)</span>
            </label>
            <Input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="e.g. Think about private fields and getters/setters"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Initial Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                    difficulty === lvl
                      ? "border-primary bg-primary/15 text-primary shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Card"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
