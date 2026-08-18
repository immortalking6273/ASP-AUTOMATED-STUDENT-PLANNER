"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FlashcardDeckRow } from "@/services/db/flashcards-service";
import { Layers, BookOpen, CheckCircle, Clock, MoreVertical, Edit2, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeckCardProps {
  deck: FlashcardDeckRow;
  isSelected?: boolean;
  onSelect: () => void;
  onStudy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DeckCard({
  deck,
  isSelected,
  onSelect,
  onStudy,
  onEdit,
  onDelete,
}: DeckCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const total = deck.card_count || 0;
  const due = deck.due_count || 0;
  const mastered = deck.mastered_count || 0;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/40"
          : "border-border bg-card/80 hover:border-primary/40 hover:bg-accent/40 hover:shadow-md"
      )}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-primary shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-extrabold tracking-tight text-foreground truncate">
                {deck.name}
              </h3>
              {deck.subject && (
                <span className="text-[10px] font-semibold text-violet-300 truncate">
                  {deck.subject}
                </span>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-1 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-32 rounded-xl border border-border bg-card shadow-xl p-1 text-xs backdrop-blur-md">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {deck.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {deck.description}
          </p>
        )}
      </div>

      {/* Stats & Progress Bar */}
      <div className="mt-4 pt-3 border-t border-border/40 space-y-2.5">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span>Mastery</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Counters */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{total} cards</span>
          </div>

          {due > 0 ? (
            <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
              <Clock className="h-3 w-3" />
              {due} due
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
              <CheckCircle className="h-3 w-3" />
              Done
            </span>
          )}

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onStudy();
            }}
            className="h-7 px-2.5 text-xs font-bold gap-1 cursor-pointer"
          >
            <Play className="h-3 w-3 fill-current" />
            Study
          </Button>
        </div>
      </div>
    </div>
  );
}
