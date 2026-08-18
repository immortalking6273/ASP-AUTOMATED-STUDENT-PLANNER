"use client";

import * as React from "react";
import { FlashcardRow } from "@/services/db/flashcards-service";
import { FlashcardRating } from "../types";
import { X, HelpCircle, RotateCw, CheckCircle2, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudyModeProps {
  cards: FlashcardRow[];
  deckName?: string;
  onClose: () => void;
  onRecordReview: (cardId: string, rating: FlashcardRating) => Promise<void>;
}

export function StudyMode({
  cards,
  deckName = "All Cards",
  onClose,
  onRecordReview,
}: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [sessionCompleted, setSessionCompleted] = React.useState(false);
  const [sessionStats, setSessionStats] = React.useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const currentCard = cards[currentIndex];

  // Guaranteed State Reset whenever current card changes
  React.useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [currentIndex, currentCard?.id]);

  // Keyboard Shortcuts Listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input/textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (sessionCompleted || !currentCard) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
        return;
      }

      if (isFlipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleRating("again");
        } else if (e.key === "2") {
          e.preventDefault();
          handleRating("hard");
        } else if (e.key === "3") {
          e.preventDefault();
          handleRating("good");
        } else if (e.key === "4") {
          e.preventDefault();
          handleRating("easy");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, sessionCompleted, currentCard, onClose]);

  const handleRating = async (rating: FlashcardRating) => {
    if (!currentCard) return;

    // Track statistics
    setSessionStats((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    // Record review to Supabase
    await onRecordReview(currentCard.id, rating);

    // Reset card state for next card
    setIsFlipped(false);
    setShowHint(false);

    // Advance to next card or complete session
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const totalCards = cards.length;
  const progressPct = totalCards > 0 ? Math.round(((currentIndex) / totalCards) * 100) : 0;

  if (!cards || cards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl">
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-foreground">You're All Caught Up!</h2>
          <p className="text-xs text-muted-foreground">
            No flashcards are due for review in this deck right now.
          </p>
          <Button onClick={onClose} className="w-full">
            Back to Decks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-2xl text-foreground animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/25">
            Study Mode
          </span>
          <span className="text-sm font-extrabold text-foreground truncate max-w-xs">
            {deckName}
          </span>
        </div>

        {/* Progress Bar & Counter */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 w-48">
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${sessionCompleted ? 100 : progressPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground min-w-[50px] text-right">
              {sessionCompleted ? totalCards : currentIndex + 1} / {totalCards}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            title="Exit Study Mode (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {!sessionCompleted && currentCard ? (
          <div className="w-full max-w-xl flex flex-col items-center gap-6">
            {/* 3D Flip Card Outer Container */}
            <div
              style={{ perspective: "1000px" }}
              onClick={() => setIsFlipped((prev) => !prev)}
              className="w-full h-80 sm:h-96 relative cursor-pointer group"
            >
              {/* Inner Rotating Card Container */}
              <div
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className="w-full h-full relative rounded-3xl border border-border bg-card/90 shadow-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-primary/50"
              >
                {/* FRONT OF CARD (QUESTION) */}
                <div
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between bg-card/95 rounded-3xl border border-border"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-extrabold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-md border border-violet-500/20">
                      QUESTION
                    </span>
                    <span className="capitalize font-semibold text-muted-foreground/70">
                      {currentCard.difficulty || "medium"} difficulty
                    </span>
                  </div>

                  <div className="my-auto text-center px-4">
                    <p className="text-lg sm:text-2xl font-bold leading-relaxed text-foreground">
                      {currentCard.front}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    {currentCard.hint ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint((prev) => !prev);
                        }}
                        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
                      >
                        <HelpCircle className="h-4 w-4" />
                        {showHint ? "Hide Hint" : "Show Hint"}
                      </button>
                    ) : <span />}

                    <span className="text-[11px] font-semibold text-muted-foreground/70 flex items-center gap-1">
                      <RotateCw className="h-3 w-3" /> Click or press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Space</kbd> to reveal
                    </span>
                  </div>

                  {showHint && currentCard.hint && (
                    <div className="absolute bottom-16 left-6 right-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-in fade-in slide-in-from-bottom-2">
                      💡 <strong>Hint:</strong> {currentCard.hint}
                    </div>
                  )}
                </div>

                {/* BACK OF CARD (ANSWER) */}
                <div
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                  className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-card via-card to-primary/10 rounded-3xl border border-primary/40 shadow-2xl"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                      ANSWER
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Card {currentIndex + 1} of {totalCards}
                    </span>
                  </div>

                  <div className="my-auto text-center px-4">
                    <p className="text-base sm:text-xl font-semibold leading-relaxed text-foreground">
                      {currentCard.back}
                    </p>
                    {currentCard.hint && (
                      <p className="mt-3 text-xs text-muted-foreground italic">
                        Hint: {currentCard.hint}
                      </p>
                    )}
                  </div>

                  <div className="text-center pt-2 text-[11px] font-semibold text-muted-foreground">
                    Rate how well you knew this answer below:
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls / Answer Revealer */}
            {!isFlipped ? (
              <Button
                type="button"
                size="lg"
                onClick={() => setIsFlipped(true)}
                className="w-full sm:w-80 h-12 text-sm font-extrabold gap-2 rounded-2xl cursor-pointer shadow-lg hover:scale-102 transition-transform"
              >
                <RotateCw className="h-4 w-4" />
                Show Answer (Space)
              </Button>
            ) : (
              <div className="w-full grid grid-cols-4 gap-2.5 animate-in fade-in slide-in-from-bottom-2">
                <button
                  type="button"
                  onClick={() => handleRating("again")}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-black uppercase tracking-wider">Again</span>
                  <span className="text-[10px] text-red-300/70 mt-0.5 font-medium">&lt; 10m (1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRating("hard")}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-black uppercase tracking-wider">Hard</span>
                  <span className="text-[10px] text-amber-300/70 mt-0.5 font-medium">1 day (2)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRating("good")}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-black uppercase tracking-wider">Good</span>
                  <span className="text-[10px] text-emerald-300/70 mt-0.5 font-medium">3 days (3)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRating("easy")}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-black uppercase tracking-wider">Easy</span>
                  <span className="text-[10px] text-violet-300/70 mt-0.5 font-medium">7 days (4)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* SESSION COMPLETED SUMMARY SCREEN */
          <div className="w-full max-w-md bg-card/90 border border-border rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 border border-primary/30 text-primary">
              <Trophy className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-foreground">Session Complete!</h2>
              <p className="text-xs text-muted-foreground">
                Great job! You studied {totalCards} flashcards.
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <span className="text-xl font-black">{sessionStats.good + sessionStats.easy}</span>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Mastered & Good</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
                <span className="text-xl font-black">{sessionStats.again + sessionStats.hard}</span>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Need Review</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setSessionCompleted(false);
                  setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
                }}
                className="flex-1 rounded-xl cursor-pointer"
              >
                Study Again
              </Button>
              <Button type="button" onClick={onClose} className="flex-1 rounded-xl gap-2 cursor-pointer">
                Done
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
