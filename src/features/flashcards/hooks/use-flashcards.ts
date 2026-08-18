"use client";

import * as React from "react";
import {
  FlashcardDecksService,
  FlashcardsService,
  FlashcardDeckRow,
  FlashcardRow,
} from "@/services/db/flashcards-service";
import { FlashcardFilterState, FlashcardRating } from "../types";
import { toast } from "@/components/ui/toast";

export function useFlashcards(workspaceId: string | null) {
  const [decks, setDecks] = React.useState<FlashcardDeckRow[]>([]);
  const [cards, setCards] = React.useState<FlashcardRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [activeDeckId, setActiveDeckId] = React.useState<string | null>(null);

  const [filters, setFilters] = React.useState<FlashcardFilterState>({
    deckId: null,
    statusFilter: "all",
    subjectFilter: "all",
    searchQuery: "",
    sortBy: "next_review",
  });

  const loadData = React.useCallback(async () => {
    if (!workspaceId) {
      setDecks([]);
      setCards([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [fetchedDecks, fetchedCards] = await Promise.all([
        FlashcardDecksService.getDecks(workspaceId),
        FlashcardsService.getCards(workspaceId),
      ]);

      setDecks(fetchedDecks);
      setCards(fetchedCards);
    } catch (err: any) {
      console.error("[useFlashcards] load error:", err);
      setError("Unable to load flashcards. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived unique subjects
  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    decks.forEach((d) => { if (d.subject?.trim()) set.add(d.subject.trim()); });
    cards.forEach((c) => { if (c.deck_name?.trim()) set.add(c.deck_name.trim()); });
    return Array.from(set).sort();
  }, [decks, cards]);

  // Filtered Cards
  const filteredCards = React.useMemo(() => {
    const now = new Date();

    return cards
      .filter((card) => {
        // Deck filter
        if (activeDeckId && card.deck_id !== activeDeckId) return false;

        // Subject filter
        if (filters.subjectFilter && filters.subjectFilter !== "all") {
          const deckObj = decks.find((d) => d.id === card.deck_id);
          const subj = deckObj?.subject || card.deck_name;
          if (!subj || subj.toLowerCase() !== filters.subjectFilter.toLowerCase()) {
            return false;
          }
        }

        // Status filter
        if (filters.statusFilter === "due") {
          if (card.next_review_at && new Date(card.next_review_at) > now) return false;
        } else if (filters.statusFilter === "new") {
          if (card.review_count > 0) return false;
        } else if (filters.statusFilter === "learning") {
          if (card.review_count === 0 || card.mastery_level >= 80) return false;
        } else if (filters.statusFilter === "mastered") {
          if (card.mastery_level < 80) return false;
        } else if (filters.statusFilter === "difficult") {
          if (card.incorrect_count < 2 && card.mastery_level > 40) return false;
        }

        // Search query filter
        if (filters.searchQuery && filters.searchQuery.trim()) {
          const q = filters.searchQuery.trim().toLowerCase();
          const matchFront = card.front.toLowerCase().includes(q);
          const matchBack = card.back.toLowerCase().includes(q);
          const matchHint = card.hint?.toLowerCase().includes(q);
          const matchDeck = card.deck_name.toLowerCase().includes(q);
          if (!matchFront && !matchBack && !matchHint && !matchDeck) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "created") {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        if (filters.sortBy === "reviewed") {
          return new Date(b.last_reviewed_at || 0).getTime() - new Date(a.last_reviewed_at || 0).getTime();
        }
        if (filters.sortBy === "difficulty") {
          const order = { hard: 3, medium: 2, easy: 1 };
          return (order[b.difficulty] || 2) - (order[a.difficulty] || 2);
        }
        // Default: next_review (due cards first)
        const dateA = a.next_review_at ? new Date(a.next_review_at).getTime() : 0;
        const dateB = b.next_review_at ? new Date(b.next_review_at).getTime() : 0;
        return dateA - dateB;
      });
  }, [cards, decks, activeDeckId, filters]);

  // Overall Stats
  const stats = React.useMemo(() => {
    const now = new Date();
    const totalCards = cards.length;
    const dueCount = cards.filter((c) => !c.next_review_at || new Date(c.next_review_at) <= now).length;
    const masteredCount = cards.filter((c) => c.mastery_level >= 80).length;
    const difficultCount = cards.filter((c) => c.incorrect_count >= 2 || (c.review_count > 0 && c.mastery_level < 40)).length;

    return {
      totalDecks: decks.length,
      totalCards,
      dueCount,
      masteredCount,
      difficultCount,
    };
  }, [decks, cards]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const createDeck = React.useCallback(
    async (payload: { name: string; description?: string; subject?: string }) => {
      if (!workspaceId) return;
      try {
        const created = await FlashcardDecksService.createDeck({
          workspaceId,
          ...payload,
        });
        toast.success(`Deck "${created.name}" created`);
        await loadData();
        return created;
      } catch (err: any) {
        toast.error(err.message || "Failed to create deck.");
        throw err;
      }
    },
    [workspaceId, loadData]
  );

  const updateDeck = React.useCallback(
    async (deckId: string, payload: { name?: string; description?: string; subject?: string }) => {
      try {
        const updated = await FlashcardDecksService.updateDeck(deckId, payload);
        toast.success("Deck updated");
        await loadData();
        return updated;
      } catch (err: any) {
        toast.error(err.message || "Failed to update deck.");
        throw err;
      }
    },
    [loadData]
  );

  const deleteDeck = React.useCallback(
    async (deckId: string) => {
      try {
        await FlashcardDecksService.deleteDeck(deckId);
        toast.success("Deck deleted");
        if (activeDeckId === deckId) setActiveDeckId(null);
        await loadData();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete deck.");
        throw err;
      }
    },
    [activeDeckId, loadData]
  );

  const createCard = React.useCallback(
    async (payload: {
      deckId?: string | null;
      deckName?: string;
      front: string;
      back: string;
      hint?: string;
      difficulty?: "easy" | "medium" | "hard";
      sourceType?: "manual" | "document" | "notebook" | "ai";
      sourceId?: string;
    }) => {
      if (!workspaceId) return;
      try {
        const created = await FlashcardsService.createCard({
          workspaceId,
          ...payload,
        });
        toast.success("Flashcard added");
        await loadData();
        return created;
      } catch (err: any) {
        toast.error(err.message || "Failed to create card.");
        throw err;
      }
    },
    [workspaceId, loadData]
  );

  const batchCreateCards = React.useCallback(
    async (
      cardPayloads: Array<{
        deckId?: string | null;
        deckName?: string;
        front: string;
        back: string;
        hint?: string;
        difficulty?: "easy" | "medium" | "hard";
        sourceType?: "manual" | "document" | "notebook" | "ai";
        sourceId?: string;
      }>
    ) => {
      if (!workspaceId || cardPayloads.length === 0) return;
      try {
        const fullPayloads = cardPayloads.map((c) => ({
          workspaceId,
          ...c,
        }));
        const created = await FlashcardsService.batchCreateCards(fullPayloads);
        toast.success(`Saved ${created.length} flashcards`);
        await loadData();
        return created;
      } catch (err: any) {
        toast.error(err.message || "Failed to save flashcards.");
        throw err;
      }
    },
    [workspaceId, loadData]
  );

  const updateCard = React.useCallback(
    async (
      cardId: string,
      payload: {
        front?: string;
        back?: string;
        hint?: string;
        difficulty?: "easy" | "medium" | "hard";
      }
    ) => {
      try {
        const updated = await FlashcardsService.updateCard(cardId, payload);
        toast.success("Card updated");
        await loadData();
        return updated;
      } catch (err: any) {
        toast.error(err.message || "Failed to update card.");
        throw err;
      }
    },
    [loadData]
  );

  const deleteCard = React.useCallback(
    async (cardId: string) => {
      try {
        await FlashcardsService.deleteCard(cardId);
        toast.success("Card deleted");
        await loadData();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete card.");
        throw err;
      }
    },
    [loadData]
  );

  const recordReview = React.useCallback(
    async (cardId: string, rating: FlashcardRating) => {
      if (!workspaceId) return;
      try {
        const updated = await FlashcardsService.recordReview(cardId, workspaceId, rating);
        // Optimistically update card state in UI
        setCards((prev) => prev.map((c) => (c.id === cardId ? updated : c)));
        return updated;
      } catch (err: any) {
        console.error("[useFlashcards] recordReview error:", err);
      }
    },
    [workspaceId]
  );

  return {
    decks,
    cards,
    filteredCards,
    activeDeckId,
    setActiveDeckId,
    subjects,
    filters,
    setFilters,
    stats,
    isLoading,
    error,
    createDeck,
    updateDeck,
    deleteDeck,
    createCard,
    batchCreateCards,
    updateCard,
    deleteCard,
    recordReview,
    refresh: loadData,
  };
}
