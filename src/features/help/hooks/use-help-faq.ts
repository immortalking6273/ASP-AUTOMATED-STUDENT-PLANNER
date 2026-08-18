"use client";

import * as React from "react";
import { FaqWithCategory, FaqCategoryRow, SupportFeedbackPayload } from "../types";
import { toast } from "@/components/ui/toast";

export function useHelpFaq() {
  const [categories, setCategories] = React.useState<FaqCategoryRow[]>([]);
  const [faqs, setFaqs] = React.useState<FaqWithCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [openFaqIds, setOpenFaqIds] = React.useState<string[]>([]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);

  const loadFaqs = React.useCallback(async (categorySlug?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = categorySlug && categorySlug !== "all"
        ? `/api/help/faqs?category=${encodeURIComponent(categorySlug)}`
        : "/api/help/faqs";

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch help content.");

      setCategories(data.categories || []);
      setFaqs(data.faqs || []);
    } catch (err: any) {
      console.error("[useHelpFaq] Load error:", err);
      setError(err.message || "Unable to load help content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadFaqs(selectedCategory);
  }, [selectedCategory, loadFaqs]);

  // Client-side search filtering
  const filteredFaqs = React.useMemo(() => {
    if (!searchQuery.trim()) return faqs;

    const term = searchQuery.toLowerCase().trim();
    return faqs.filter((item) => {
      const q = item.question.toLowerCase();
      const a = item.answer.toLowerCase();
      const cat = item.category?.name.toLowerCase() || "";
      return q.includes(term) || a.includes(term) || cat.includes(term);
    });
  }, [faqs, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const submitFeedback = async (payload: SupportFeedbackPayload): Promise<boolean> => {
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch("/api/help/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request.");

      toast.success("Support request submitted!", "We will review your message shortly.");
      return true;
    } catch (err: any) {
      toast.error("Submission failed", err.message);
      return false;
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return {
    categories,
    faqs: filteredFaqs,
    rawFaqsCount: faqs.length,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    openFaqIds,
    toggleFaq,
    submitFeedback,
    isSubmittingFeedback,
    refetch: () => loadFaqs(selectedCategory),
  };
}
