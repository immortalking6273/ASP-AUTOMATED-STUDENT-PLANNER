import { FlashcardDeckRow, FlashcardRow } from "@/services/db/flashcards-service";

export type { FlashcardDeckRow, FlashcardRow };

export type FlashcardDifficulty = "easy" | "medium" | "hard";
export type FlashcardRating = "again" | "hard" | "good" | "easy";
export type FlashcardSourceType = "manual" | "document" | "notebook" | "ai";

export interface FlashcardFilterState {
  deckId?: string | null;
  statusFilter: "all" | "due" | "new" | "learning" | "mastered" | "difficult";
  subjectFilter?: string;
  searchQuery?: string;
  sortBy: "created" | "reviewed" | "next_review" | "difficulty";
}

export interface GeneratedCardPreviewItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty: FlashcardDifficulty;
  selected: boolean;
}
