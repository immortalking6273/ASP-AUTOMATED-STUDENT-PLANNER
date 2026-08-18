"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
import {
  useFlashcards,
  DeckCard,
  DeckDialog,
  FlashcardDialog,
  AIFlashcardGeneratorDialog,
  StudyMode,
  FlashcardRow,
  FlashcardDeckRow,
} from "@/features/flashcards";
import {
  Layers,
  Sparkles,
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Edit2,
  Trash2,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FlashcardsPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);
  const [workspacesLoading, setWorkspacesLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    WorkspacesService.getWorkspaces(user.id)
      .then((res) => {
        const list = res.data || [];
        setWorkspaces(list);
        if (list.length > 0) {
          setSelectedWorkspaceId(list[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setWorkspacesLoading(false));
  }, [user]);

  const flashcards = useFlashcards(selectedWorkspaceId);

  // Modal states
  const [deckDialogOpen, setDeckDialogOpen] = React.useState(false);
  const [editingDeck, setEditingDeck] = React.useState<FlashcardDeckRow | null>(null);

  const [cardDialogOpen, setCardDialogOpen] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<FlashcardRow | null>(null);

  const [aiGenDialogOpen, setAiGenDialogOpen] = React.useState(false);
  const [studyModeOpen, setStudyModeOpen] = React.useState(false);
  const [studyDeck, setStudyDeck] = React.useState<{ name: string; cards: FlashcardRow[] }>({
    name: "All Due Cards",
    cards: [],
  });

  // Launch Study Mode
  const startStudySession = (cardsToStudy: FlashcardRow[], name: string) => {
    if (!cardsToStudy || cardsToStudy.length === 0) return;
    setStudyDeck({ name, cards: cardsToStudy });
    setStudyModeOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Flashcards</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Turn your study materials into active recall practice with spaced repetition.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {workspaces.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-semibold text-muted-foreground">Workspace:</span>
              <select
                value={selectedWorkspaceId || ""}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingDeck(null);
              setDeckDialogOpen(true);
            }}
            className="gap-1.5 text-xs font-bold"
          >
            <Plus className="h-4 w-4" />
            Create Deck
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCard(null);
              setCardDialogOpen(true);
            }}
            className="gap-1.5 text-xs font-bold"
          >
            <Plus className="h-4 w-4" />
            Add Flashcard
          </Button>

          <Button
            size="sm"
            onClick={() => setAiGenDialogOpen(true)}
            className="gap-1.5 text-xs font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Decks
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground">{flashcards.stats.totalDecks}</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Cards
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground">{flashcards.stats.totalCards}</span>
            <BookOpen className="h-4 w-4 text-violet-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            Due for Review
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400">{flashcards.stats.dueCount}</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
            Mastered Cards
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">{flashcards.stats.masteredCount}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* QUICK STUDY ACTION CALLOUT (IF DUE CARDS EXIST) */}
      {flashcards.stats.dueCount > 0 && (
        <div className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-card to-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                You have {flashcards.stats.dueCount} flashcard{flashcards.stats.dueCount > 1 ? "s" : ""} due for review!
              </h3>
              <p className="text-xs text-muted-foreground">
                Keep your review streak alive and boost memory retention with spaced recall.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => {
              const due = flashcards.cards.filter(
                (c) => !c.next_review_at || new Date(c.next_review_at) <= new Date()
              );
              startStudySession(due, "Due Cards Session");
            }}
            className="w-full sm:w-auto font-extrabold gap-2 cursor-pointer shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Study Due Cards ({flashcards.stats.dueCount})
          </Button>
        </div>
      )}

      {/* DECKS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
            Decks ({flashcards.decks.length})
          </h2>
          {flashcards.activeDeckId && (
            <button
              onClick={() => flashcards.setActiveDeckId(null)}
              className="text-xs text-primary font-bold hover:underline cursor-pointer"
            >
              Show All Decks
            </button>
          )}
        </div>

        {flashcards.decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {flashcards.decks.map((deck) => {
              const isSelected = flashcards.activeDeckId === deck.id;
              const deckCards = flashcards.cards.filter((c) => c.deck_id === deck.id);

              return (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  isSelected={isSelected}
                  onSelect={() =>
                    flashcards.setActiveDeckId(isSelected ? null : deck.id)
                  }
                  onStudy={() => startStudySession(deckCards, deck.name)}
                  onEdit={() => {
                    setEditingDeck(deck);
                    setDeckDialogOpen(true);
                  }}
                  onDelete={() => flashcards.deleteDeck(deck.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-3">
            <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Flashcard Decks Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Organize your study cards into decks by subject or generate cards from uploaded documents.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingDeck(null);
                setDeckDialogOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create First Deck
            </Button>
          </div>
        )}
      </div>

      {/* TOOLBAR & SEARCH / FILTERS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-border/60">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={flashcards.filters.searchQuery || ""}
            onChange={(e) =>
              flashcards.setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            placeholder="Search front, back, hint, or deck..."
            className="pl-9 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "due", "new", "learning", "mastered", "difficult"] as const).map((status) => (
            <button
              key={status}
              onClick={() =>
                flashcards.setFilters((prev) => ({ ...prev, statusFilter: status }))
              }
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                flashcards.filters.statusFilter === status
                  ? "border-primary bg-primary/15 text-primary shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {status}
            </button>
          ))}

          {/* Subject Filter Dropdown */}
          {flashcards.subjects.length > 0 && (
            <select
              value={flashcards.filters.subjectFilter || "all"}
              onChange={(e) =>
                flashcards.setFilters((prev) => ({ ...prev, subjectFilter: e.target.value }))
              }
              className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {flashcards.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* CARDS LIST SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
            Cards ({flashcards.filteredCards.length})
          </h2>
          {flashcards.filteredCards.length > 0 && (
            <Button
              size="sm"
              onClick={() =>
                startStudySession(
                  flashcards.filteredCards,
                  flashcards.activeDeckId
                    ? flashcards.decks.find((d) => d.id === flashcards.activeDeckId)?.name || "Selected Cards"
                    : "Filtered Cards Session"
                )
              }
              className="h-8 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current" />
              Study Selected ({flashcards.filteredCards.length})
            </Button>
          )}
        </div>

        {flashcards.filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flashcards.filteredCards.map((card) => (
              <div
                key={card.id}
                className="group relative rounded-2xl border border-border bg-card/80 p-4 space-y-3 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                      {card.deck_name || "General"}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground capitalize">
                      {card.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingCard(card);
                        setCardDialogOpen(true);
                      }}
                      className="p-1 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                      title="Edit Flashcard"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => flashcards.deleteCard(card.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                      title="Delete Flashcard"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-foreground">Q: {card.front}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">A: {card.back}</p>
                  {card.hint && (
                    <p className="text-[11px] text-amber-400/80 italic flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" /> Hint: {card.hint}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-medium">
                  <span>Reviews: {card.review_count || 0}</span>
                  <span>Mastery: {card.mastery_level || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-3">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Flashcards Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create flashcards manually or use AI to extract active recall questions from your documents.
            </p>
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingCard(null);
                  setCardDialogOpen(true);
                }}
                className="gap-1.5 text-xs font-bold"
              >
                <Plus className="h-4 w-4" />
                Add Flashcard
              </Button>
              <Button
                size="sm"
                onClick={() => setAiGenDialogOpen(true)}
                className="gap-1.5 text-xs font-extrabold"
              >
                <Sparkles className="h-4 w-4" />
                Generate Cards
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* DIALOG MODALS */}

      {/* Deck Dialog */}
      <DeckDialog
        open={deckDialogOpen}
        onClose={() => {
          setDeckDialogOpen(false);
          setEditingDeck(null);
        }}
        onSubmit={async (values) => {
          if (editingDeck) {
            await flashcards.updateDeck(editingDeck.id, values);
          } else {
            await flashcards.createDeck(values);
          }
        }}
        initialValues={editingDeck ? { name: editingDeck.name, description: editingDeck.description || undefined, subject: editingDeck.subject || undefined } : undefined}
        title={editingDeck ? "Edit Deck" : "Create Deck"}
      />

      {/* Flashcard Dialog */}
      <FlashcardDialog
        open={cardDialogOpen}
        onClose={() => {
          setCardDialogOpen(false);
          setEditingCard(null);
        }}
        onSubmit={async (values) => {
          if (editingCard) {
            await flashcards.updateCard(editingCard.id, values);
          } else {
            await flashcards.createCard(values);
          }
        }}
        decks={flashcards.decks}
        defaultDeckId={flashcards.activeDeckId}
        initialValues={editingCard ? { front: editingCard.front, back: editingCard.back, hint: editingCard.hint || undefined, difficulty: editingCard.difficulty, deckId: editingCard.deck_id } : undefined}
        title={editingCard ? "Edit Flashcard" : "Add Flashcard"}
      />

      {/* AI Generator Dialog */}
      <AIFlashcardGeneratorDialog
        open={aiGenDialogOpen}
        onClose={() => setAiGenDialogOpen(false)}
        workspaceId={selectedWorkspaceId}
        decks={flashcards.decks}
        onSaveCards={async (cardsToSave) => {
          await flashcards.batchCreateCards(cardsToSave);
        }}
      />

      {/* Study Mode Overlay */}
      {studyModeOpen && (
        <StudyMode
          cards={studyDeck.cards}
          deckName={studyDeck.name}
          onClose={() => setStudyModeOpen(false)}
          onRecordReview={async (cardId, rating) => {
            await flashcards.recordReview(cardId, rating);
          }}
        />
      )}
    </div>
  );
}
