import { BaseDatabaseService } from "./base-service";

export interface FlashcardDeckRow {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  description: string | null;
  subject: string | null;
  created_at: string;
  updated_at: string;
  card_count?: number;
  due_count?: number;
  mastered_count?: number;
}

export interface FlashcardRow {
  id: string;
  user_id: string;
  workspace_id: string | null;
  deck_id: string | null;
  deck_name: string;
  front: string;
  back: string;
  hint: string | null;
  difficulty: "easy" | "medium" | "hard";
  mastery_level: number;
  review_count: number;
  correct_count: number;
  incorrect_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  source_type: "manual" | "document" | "notebook" | "ai";
  source_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDeckPayload {
  workspaceId: string;
  name: string;
  description?: string | null;
  subject?: string | null;
}

export interface UpdateDeckPayload {
  name?: string;
  description?: string | null;
  subject?: string | null;
}

export interface CreateFlashcardPayload {
  workspaceId: string;
  deckId?: string | null;
  deckName?: string;
  front: string;
  back: string;
  hint?: string | null;
  difficulty?: "easy" | "medium" | "hard";
  sourceType?: "manual" | "document" | "notebook" | "ai";
  sourceId?: string | null;
}

export interface UpdateFlashcardPayload {
  deckId?: string | null;
  deckName?: string;
  front?: string;
  back?: string;
  hint?: string | null;
  difficulty?: "easy" | "medium" | "hard";
}

export class FlashcardDecksService extends BaseDatabaseService {
  static async getDecks(workspaceId: string, client?: any): Promise<FlashcardDeckRow[]> {
    try {
      const supabase = client || this.getSupabase();
      const { data: decks, error } = await supabase
        .from("flashcard_decks")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true });

      if (error) throw error;

      // Fetch cards summary to calculate stats per deck
      const { data: cards } = await supabase
        .from("flashcards")
        .select("id, deck_id, mastery_level, next_review_at")
        .eq("workspace_id", workspaceId);

      const now = new Date();

      return (decks || []).map((d: any) => {
        const deckCards = (cards || []).filter((c: any) => c.deck_id === d.id);
        const due = deckCards.filter(
          (c: any) => !c.next_review_at || new Date(c.next_review_at) <= now
        );
        const mastered = deckCards.filter((c: any) => (c.mastery_level || 0) >= 80);

        return {
          ...d,
          card_count: deckCards.length,
          due_count: due.length,
          mastered_count: mastered.length,
        };
      });
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async createDeck(payload: CreateDeckPayload, client?: any): Promise<FlashcardDeckRow> {
    try {
      const supabase = client || this.getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user required.");

      const { data, error } = await supabase
        .from("flashcard_decks")
        .insert({
          workspace_id: payload.workspaceId,
          user_id: user.id,
          name: payload.name.trim(),
          description: payload.description?.trim() || null,
          subject: payload.subject?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FlashcardDeckRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async updateDeck(deckId: string, payload: UpdateDeckPayload, client?: any): Promise<FlashcardDeckRow> {
    try {
      const supabase = client || this.getSupabase();
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (payload.name !== undefined) updateData.name = payload.name.trim();
      if (payload.description !== undefined) updateData.description = payload.description?.trim() || null;
      if (payload.subject !== undefined) updateData.subject = payload.subject?.trim() || null;

      const { data, error } = await supabase
        .from("flashcard_decks")
        .update(updateData)
        .eq("id", deckId)
        .select()
        .single();

      if (error) throw error;
      return data as FlashcardDeckRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async deleteDeck(deckId: string, client?: any): Promise<void> {
    try {
      const supabase = client || this.getSupabase();
      const { error } = await supabase.from("flashcard_decks").delete().eq("id", deckId);
      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }
}

export class FlashcardsService extends BaseDatabaseService {
  static async getCards(workspaceId: string, deckId?: string, client?: any): Promise<FlashcardRow[]> {
    try {
      const supabase = client || this.getSupabase();
      let query = supabase
        .from("flashcards")
        .select("*")
        .eq("workspace_id", workspaceId);

      if (deckId) {
        query = query.eq("deck_id", deckId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FlashcardRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async createCard(payload: CreateFlashcardPayload, client?: any): Promise<FlashcardRow> {
    try {
      const supabase = client || this.getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user required.");

      const { data, error } = await supabase
        .from("flashcards")
        .insert({
          user_id: user.id,
          workspace_id: payload.workspaceId,
          deck_id: payload.deckId || null,
          deck_name: payload.deckName || "General",
          front: payload.front.trim(),
          back: payload.back.trim(),
          hint: payload.hint?.trim() || null,
          difficulty: payload.difficulty || "medium",
          source_type: payload.sourceType || "manual",
          source_id: payload.sourceId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FlashcardRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async batchCreateCards(cards: CreateFlashcardPayload[], client?: any): Promise<FlashcardRow[]> {
    try {
      const supabase = client || this.getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user required.");

      const rows = cards.map((c) => ({
        user_id: user.id,
        workspace_id: c.workspaceId,
        deck_id: c.deckId || null,
        deck_name: c.deckName || "General",
        front: c.front.trim(),
        back: c.back.trim(),
        hint: c.hint?.trim() || null,
        difficulty: c.difficulty || "medium",
        source_type: c.sourceType || "manual",
        source_id: c.sourceId || null,
      }));

      const { data, error } = await supabase.from("flashcards").insert(rows).select();
      if (error) throw error;
      return (data || []) as FlashcardRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async updateCard(cardId: string, payload: UpdateFlashcardPayload, client?: any): Promise<FlashcardRow> {
    try {
      const supabase = client || this.getSupabase();
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (payload.deckId !== undefined) updateData.deck_id = payload.deckId;
      if (payload.deckName !== undefined) updateData.deck_name = payload.deckName;
      if (payload.front !== undefined) updateData.front = payload.front.trim();
      if (payload.back !== undefined) updateData.back = payload.back.trim();
      if (payload.hint !== undefined) updateData.hint = payload.hint?.trim() || null;
      if (payload.difficulty !== undefined) updateData.difficulty = payload.difficulty;

      const { data, error } = await supabase
        .from("flashcards")
        .update(updateData)
        .eq("id", cardId)
        .select()
        .single();

      if (error) throw error;
      return data as FlashcardRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async deleteCard(cardId: string, client?: any): Promise<void> {
    try {
      const supabase = client || this.getSupabase();
      const { error } = await supabase.from("flashcards").delete().eq("id", cardId);
      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Spaced repetition rating handler: 'again' | 'hard' | 'good' | 'easy'
   */
  static async recordReview(
    cardId: string,
    workspaceId: string,
    rating: "again" | "hard" | "good" | "easy",
    client?: any
  ): Promise<FlashcardRow> {
    try {
      const supabase = client || this.getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user required.");

      // 1. Fetch current card state
      const { data: card, error: fetchErr } = await supabase
        .from("flashcards")
        .select("*")
        .eq("id", cardId)
        .single();

      if (fetchErr || !card) throw fetchErr || new Error("Card not found.");

      const now = new Date();
      let nextReview = new Date(now);
      let newMastery = card.mastery_level || 0;
      let newCorrect = card.correct_count || 0;
      let newIncorrect = card.incorrect_count || 0;
      const reviewCount = (card.review_count || 0) + 1;

      // Spaced repetition interval rules
      switch (rating) {
        case "again":
          nextReview.setMinutes(nextReview.getMinutes() + 10);
          newIncorrect += 1;
          newMastery = Math.max(0, newMastery - 15);
          break;
        case "hard":
          nextReview.setDate(nextReview.getDate() + 1);
          newCorrect += 1;
          newMastery = Math.min(100, newMastery + 10);
          break;
        case "good":
          nextReview.setDate(nextReview.getDate() + 3);
          newCorrect += 1;
          newMastery = Math.min(100, newMastery + 25);
          break;
        case "easy":
          nextReview.setDate(nextReview.getDate() + 7);
          newCorrect += 1;
          newMastery = Math.min(100, newMastery + 40);
          break;
      }

      // 2. Record review entry
      await supabase.from("flashcard_reviews").insert({
        flashcard_id: cardId,
        workspace_id: workspaceId,
        user_id: user.id,
        rating,
        reviewed_at: now.toISOString(),
      });

      // 3. Update card state
      const { data: updatedCard, error: updateErr } = await supabase
        .from("flashcards")
        .update({
          review_count: reviewCount,
          correct_count: newCorrect,
          incorrect_count: newIncorrect,
          mastery_level: newMastery,
          last_reviewed_at: now.toISOString(),
          next_review_at: nextReview.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", cardId)
        .select()
        .single();

      if (updateErr) throw updateErr;
      return updatedCard as FlashcardRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
