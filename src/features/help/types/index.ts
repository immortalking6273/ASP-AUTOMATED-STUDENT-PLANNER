import { FaqCategoryRow, FaqItemRow, SupportFeedbackRow } from "@/types/database";

export interface FaqWithCategory extends FaqItemRow {
  category?: FaqCategoryRow | null;
}

export interface FaqCreatePayload {
  question: string;
  answer: string;
  category_id?: string | null;
  status?: "draft" | "published" | "archived";
  sort_order?: number;
}

export interface FaqUpdatePayload extends Partial<FaqCreatePayload> {
  id: string;
  is_published?: boolean;
}

export interface SupportFeedbackPayload {
  subject: string;
  message: string;
  category?: string;
}

export type { FaqCategoryRow, FaqItemRow, SupportFeedbackRow };
