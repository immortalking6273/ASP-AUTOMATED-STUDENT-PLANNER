"use client";

import * as React from "react";
import { X, Sparkles, Loader2, FileText, BookOpen, Brain, Check, Edit2, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlashcardDeckRow } from "@/services/db/flashcards-service";
import { GeneratedCardPreviewItem } from "../types";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

interface AIFlashcardGeneratorDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string | null;
  decks: FlashcardDeckRow[];
  onSaveCards: (
    cards: Array<{
      deckId?: string | null;
      deckName?: string;
      front: string;
      back: string;
      hint?: string;
      difficulty: "easy" | "medium" | "hard";
      sourceType: "ai";
      sourceId?: string;
    }>
  ) => Promise<void>;
}

export function AIFlashcardGeneratorDialog({
  open,
  onClose,
  workspaceId,
  decks,
  onSaveCards,
}: AIFlashcardGeneratorDialogProps) {
  // Source Selection
  const [sourceType, setSourceType] = React.useState<"document" | "notebook" | "knowledge" | "topic">("topic");
  const [sourceId, setSourceId] = React.useState("");
  const [targetDeckId, setTargetDeckId] = React.useState(decks[0]?.id || "");

  // Source Options Loaded from DB
  const [documents, setDocuments] = React.useState<Array<{ id: string; file_name: string }>>([]);
  const [notebooks, setNotebooks] = React.useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingSources, setIsLoadingSources] = React.useState(false);

  // Generator Options
  const [cardCount, setCardCount] = React.useState(10);
  const [difficulty, setDifficulty] = React.useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [focus, setFocus] = React.useState<"key_concepts" | "definitions" | "facts" | "exam_prep" | "mixed">("mixed");
  const [subject, setSubject] = React.useState("");

  // Generation State & Preview
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [generatedCards, setGeneratedCards] = React.useState<GeneratedCardPreviewItem[]>([]);
  const [editingCardId, setEditingCardId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Load available documents & notebooks when modal opens
  React.useEffect(() => {
    if (open && workspaceId) {
      const loadSources = async () => {
        setIsLoadingSources(true);
        try {
          const supabase = createClient();
          const [docsRes, nbsRes] = await Promise.all([
            supabase
              .from("uploaded_documents")
              .select("id, file_name")
              .eq("workspace_id", workspaceId)
              .order("created_at", { ascending: false }),
            supabase
              .from("notebooks")
              .select("id, title")
              .eq("workspace_id", workspaceId)
              .order("created_at", { ascending: false }),
          ]);

          setDocuments(docsRes.data || []);
          setNotebooks(nbsRes.data || []);
        } catch (err) {
          console.error("Error loading sources:", err);
        } finally {
          setIsLoadingSources(false);
        }
      };

      loadSources();
      setGeneratedCards([]);
      setError(null);
      if (decks.length > 0 && !targetDeckId) setTargetDeckId(decks[0].id);
    }
  }, [open, workspaceId, decks, targetDeckId]);

  const handleGenerate = async () => {
    if (!workspaceId) return;

    if (sourceType === "document" && !sourceId) {
      setError("Please select a document.");
      return;
    }
    if (sourceType === "notebook" && !sourceId) {
      setError("Please select a notebook.");
      return;
    }
    if (sourceType === "topic" && !sourceId.trim()) {
      setError("Please enter a custom topic focus.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          sourceType,
          sourceId,
          cardCount,
          difficulty,
          focus,
          subject,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");

      const raw = data.cards || [];
      if (raw.length === 0) {
        throw new Error("No flashcards were generated. Please try a different source or topic.");
      }

      const formatted: GeneratedCardPreviewItem[] = raw.map((c: any, i: number) => ({
        id: `gen_${Date.now()}_${i}`,
        front: c.front,
        back: c.back,
        hint: c.hint,
        difficulty: c.difficulty || "medium",
        selected: true,
      }));

      setGeneratedCards(formatted);
      toast.success(`Generated ${formatted.length} flashcards! Review them below.`);
    } catch (err: any) {
      setError(err.message || "Failed to generate flashcards.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSelected = async () => {
    const selected = generatedCards.filter((c) => c.selected);
    if (selected.length === 0) {
      setError("Please select at least one flashcard to save.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const targetDeck = decks.find((d) => d.id === targetDeckId);

      const cardPayloads = selected.map((c) => ({
        deckId: targetDeck ? targetDeck.id : null,
        deckName: targetDeck ? targetDeck.name : "General",
        front: c.front,
        back: c.back,
        hint: c.hint,
        difficulty: c.difficulty,
        sourceType: "ai" as const,
        sourceId: sourceId || undefined,
      }));

      await onSaveCards(cardPayloads);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save flashcards.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelectCard = (id: string) => {
    setGeneratedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const updateCardText = (id: string, field: "front" | "back" | "hint", value: string) => {
    setGeneratedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCard = (id: string) => {
    setGeneratedCards((prev) => prev.filter((c) => c.id !== id));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-card to-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground">AI Flashcard Generator</h2>
              <p className="text-[11px] text-muted-foreground">
                Powered by NVIDIA NIM & ASP Active Recall Engine
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

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {generatedCards.length === 0 ? (
            /* STEP 1: CONFIGURATION FORM */
            <div className="space-y-4">
              {/* Source Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">
                  Select Study Material Source
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "topic", label: "Custom Topic", icon: Brain },
                    { id: "document", label: "Document", icon: FileText },
                    { id: "notebook", label: "Notebook", icon: BookOpen },
                    { id: "knowledge", label: "Knowledge Base", icon: Layers },
                  ].map((src) => {
                    const Icon = src.icon;
                    const isSel = sourceType === src.id;
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => {
                          setSourceType(src.id as any);
                          setSourceId("");
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer gap-1.5 ${
                          isSel
                            ? "border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/30"
                            : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {src.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source Specific Dropdowns */}
              {sourceType === "document" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Choose Uploaded Document
                  </label>
                  {isLoadingSources ? (
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading documents...
                    </div>
                  ) : documents.length > 0 ? (
                    <select
                      value={sourceId}
                      onChange={(e) => setSourceId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
                    >
                      <option value="">-- Select a document --</option>
                      {documents.map((d) => (
                        <option key={d.id} value={d.id}>
                          📄 {d.file_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      No documents found in this workspace. Upload documents first or select another source.
                    </p>
                  )}
                </div>
              )}

              {sourceType === "notebook" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Choose Notebook
                  </label>
                  {isLoadingSources ? (
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading notebooks...
                    </div>
                  ) : notebooks.length > 0 ? (
                    <select
                      value={sourceId}
                      onChange={(e) => setSourceId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
                    >
                      <option value="">-- Select a notebook --</option>
                      {notebooks.map((n) => (
                        <option key={n.id} value={n.id}>
                          📓 {n.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      No notebooks found in this workspace. Create notes first or select another source.
                    </p>
                  )}
                </div>
              )}

              {sourceType === "topic" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Topic / Concept Focus <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    placeholder="e.g. Data Structures - Binary Search Trees & Heap Memory"
                  />
                </div>
              )}

              {/* Destination Deck & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Save to Deck
                  </label>
                  <select
                    value={targetDeckId}
                    onChange={(e) => setTargetDeckId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    <option value="">General Deck</option>
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Subject Tag <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>

              {/* Generator Settings Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Card Count
                  </label>
                  <select
                    value={cardCount}
                    onChange={(e) => setCardCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    <option value={5}>5 Cards</option>
                    <option value={10}>10 Cards</option>
                    <option value={15}>15 Cards</option>
                    <option value={20}>20 Cards</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer capitalize"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Study Focus
                  </label>
                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    <option value="mixed">Mixed Focus</option>
                    <option value="key_concepts">Key Concepts</option>
                    <option value="definitions">Definitions</option>
                    <option value="exam_prep">Exam Prep</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: GENERATED CARDS PREVIEW & APPROVAL SCREEN */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground">
                  Generated Flashcards ({generatedCards.filter((c) => c.selected).length} selected)
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setGeneratedCards([])}
                  className="text-xs gap-1"
                >
                  Configure Parameters
                </Button>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {generatedCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className={`rounded-2xl border p-4 transition-all duration-200 ${
                      card.selected
                        ? "border-primary/40 bg-card shadow-sm"
                        : "border-border/50 bg-card/40 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={card.selected}
                        onChange={() => toggleSelectCard(card.id)}
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                            Card #{idx + 1} • {card.difficulty}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingCardId(editingCardId === card.id ? null : card.id)
                              }
                              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCard(card.id)}
                              className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {editingCardId === card.id ? (
                          <div className="space-y-2 pt-1">
                            <div>
                              <span className="text-[10px] font-semibold text-muted-foreground">Front</span>
                              <Input
                                value={card.front}
                                onChange={(e) => updateCardText(card.id, "front", e.target.value)}
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-muted-foreground">Back</span>
                              <textarea
                                value={card.back}
                                onChange={(e) => updateCardText(card.id, "back", e.target.value)}
                                rows={2}
                                className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground resize-none"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-foreground">Q: {card.front}</p>
                            <p className="text-xs text-muted-foreground">A: {card.back}</p>
                            {card.hint && (
                              <p className="text-[11px] text-amber-400/80 italic">💡 Hint: {card.hint}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-xl p-3 border border-destructive/20">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-card/60 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isGenerating || isSaving}>
            Cancel
          </Button>

          {generatedCards.length === 0 ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2 font-extrabold cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Flashcards...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Cards
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating || isSaving}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate"}
              </Button>
              <Button
                onClick={handleSaveSelected}
                disabled={isSaving || generatedCards.filter((c) => c.selected).length === 0}
                className="gap-2 font-extrabold"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Selected ({generatedCards.filter((c) => c.selected).length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
