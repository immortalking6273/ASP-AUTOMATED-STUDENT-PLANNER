"use client";

import * as React from "react";
import { FaqWithCategory, FaqCategoryRow, FaqCreatePayload, FaqUpdatePayload } from "../types";
import { toast } from "@/components/ui/toast";

export function useAdminFaq() {
  const [categories, setCategories] = React.useState<FaqCategoryRow[]>([]);
  const [faqs, setFaqs] = React.useState<FaqWithCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadAdminFaqs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/help/faqs");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch admin FAQs.");

      setCategories(data.categories || []);
      setFaqs(data.faqs || []);
    } catch (err: any) {
      console.error("[useAdminFaq] Error:", err);
      setError(err.message || "Failed to load admin management dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAdminFaqs();
  }, [loadAdminFaqs]);

  const createFaq = async (payload: FaqCreatePayload): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/help/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create FAQ.");

      toast.success("FAQ created successfully.");
      await loadAdminFaqs();
      return true;
    } catch (err: any) {
      toast.error("Create failed", err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateFaq = async (payload: FaqUpdatePayload): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/help/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update FAQ.");

      toast.success("FAQ updated successfully.");
      await loadAdminFaqs();
      return true;
    } catch (err: any) {
      toast.error("Update failed", err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublishStatus = async (faq: FaqWithCategory): Promise<boolean> => {
    const nextStatus = faq.status === "published" ? "draft" : "published";
    return updateFaq({
      id: faq.id,
      status: nextStatus,
    });
  };

  const deleteFaq = async (faqId: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/help/faqs?id=${faqId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete FAQ.");

      toast.success("FAQ deleted.");
      await loadAdminFaqs();
      return true;
    } catch (err: any) {
      toast.error("Delete failed", err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    categories,
    faqs,
    isLoading,
    isSaving,
    error,
    createFaq,
    updateFaq,
    togglePublishStatus,
    deleteFaq,
    refetch: loadAdminFaqs,
  };
}
