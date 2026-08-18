import { BaseDatabaseService } from "./base-service";
import { FaqCategoryRow, FaqItemRow, SupportFeedbackRow } from "@/types/database";
import { Logger } from "@/lib/logger";

export interface FaqWithCategory extends FaqItemRow {
  category?: FaqCategoryRow | null;
}

export class HelpFaqService extends BaseDatabaseService {
  /**
   * Fetch all FAQ categories ordered by sort_order
   */
  static async getCategories(client?: any): Promise<FaqCategoryRow[]> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("faq_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      Logger.metric("HelpFaqService.getCategories", performance.now() - start);
      if (error) throw error;
      return (data || []) as FaqCategoryRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Fetch published FAQs for normal users
   */
  static async getPublishedFaqs(categorySlug?: string, client?: any): Promise<FaqWithCategory[]> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();
      let query = supabase
        .from("faq_items")
        .select("*, category:faq_categories(*)")
        .eq("status", "published")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (categorySlug && categorySlug !== "all") {
        const { data: category } = await supabase
          .from("faq_categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle();

        if (category?.id) {
          query = query.eq("category_id", category.id);
        }
      }

      const { data, error } = await query;
      Logger.metric("HelpFaqService.getPublishedFaqs", performance.now() - start);
      if (error) throw error;

      return (data || []) as FaqWithCategory[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Fetch ALL FAQs for admin view (draft, published, archived)
   */
  static async getAllFaqsForAdmin(client?: any): Promise<FaqWithCategory[]> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("faq_items")
        .select("*, category:faq_categories(*)")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      Logger.metric("HelpFaqService.getAllFaqsForAdmin", performance.now() - start);
      if (error) throw error;

      return (data || []) as FaqWithCategory[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Create a new FAQ entry (Admin only)
   */
  static async createFaq(
    payload: {
      question: string;
      answer: string;
      category_id?: string | null;
      status?: "draft" | "published" | "archived";
      sort_order?: number;
      is_published?: boolean;
      created_by?: string | null;
    },
    client?: any
  ): Promise<FaqItemRow> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();
      const status = payload.status || "published";
      const isPublished = payload.is_published ?? status === "published";

      const { data, error } = await supabase
        .from("faq_items")
        .insert({
          question: payload.question.trim(),
          answer: payload.answer.trim(),
          category_id: payload.category_id || null,
          status,
          sort_order: payload.sort_order ?? 0,
          is_published: isPublished,
          created_by: payload.created_by || null,
          published_at: isPublished ? new Date().toISOString() : null,
        })
        .select()
        .single();

      Logger.metric("HelpFaqService.createFaq", performance.now() - start);
      if (error) throw error;
      return data as FaqItemRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Update an existing FAQ entry (Admin only)
   */
  static async updateFaq(
    faqId: string,
    updates: Partial<FaqItemRow>,
    client?: any
  ): Promise<FaqItemRow> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();
      const patch: any = { ...updates, updated_at: new Date().toISOString() };

      if (updates.status) {
        patch.is_published = updates.status === "published";
        if (updates.status === "published") {
          patch.published_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from("faq_items")
        .update(patch)
        .eq("id", faqId)
        .select()
        .single();

      Logger.metric("HelpFaqService.updateFaq", performance.now() - start);
      if (error) throw error;
      return data as FaqItemRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Delete an FAQ entry (Admin only)
   */
  static async deleteFaq(faqId: string, client?: any): Promise<boolean> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();
      const { error } = await supabase.from("faq_items").delete().eq("id", faqId);

      Logger.metric("HelpFaqService.deleteFaq", performance.now() - start);
      if (error) throw error;
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Submit support feedback or user help request
   */
  static async submitSupportFeedback(
    userId: string,
    payload: { subject: string; message: string; category?: string },
    client?: any
  ): Promise<SupportFeedbackRow> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("support_feedback")
        .insert({
          user_id: userId,
          subject: payload.subject.trim(),
          message: payload.message.trim(),
          category: payload.category || "general",
          status: "pending",
        })
        .select()
        .single();

      Logger.metric("HelpFaqService.submitSupportFeedback", performance.now() - start);
      if (error) throw error;
      return data as SupportFeedbackRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
