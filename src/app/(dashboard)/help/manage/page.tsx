"use client";

import * as React from "react";
import { useAdminFaq } from "@/features/help/hooks/use-admin-faq";
import { AdminFaqTable } from "@/features/help/components/admin-faq-table";
import { AdminFaqDialog } from "@/features/help/components/admin-faq-dialog";
import { FaqWithCategory } from "@/features/help/types";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, ShieldCheck, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function AdminHelpPage() {
  const {
    categories,
    faqs,
    isLoading,
    isSaving,
    error,
    createFaq,
    updateFaq,
    togglePublishStatus,
    deleteFaq,
    refetch,
  } = useAdminFaq();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingFaq, setEditingFaq] = React.useState<FaqWithCategory | null>(null);

  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  const filteredFaqs = React.useMemo(() => {
    return faqs.filter((faq) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && faq.status === "published" && faq.is_published) ||
        (statusFilter === "draft" && (faq.status === "draft" || !faq.is_published)) ||
        (statusFilter === "archived" && faq.status === "archived");

      const matchCategory =
        categoryFilter === "all" || faq.category?.slug === categoryFilter || faq.category_id === categoryFilter;

      return matchStatus && matchCategory;
    });
  }, [faqs, statusFilter, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (faq: FaqWithCategory) => {
    setEditingFaq(faq);
    setIsDialogOpen(true);
  };

  const handleSave = async (payload: any) => {
    if (editingFaq) {
      return await updateFaq(payload);
    } else {
      return await createFaq(payload);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl">
      {/* NAVIGATION BACK */}
      <div className="flex items-center justify-between">
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Help Center
        </Link>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-bold mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Administrator Control
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            FAQ Content Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, edit, reorder, publish, or archive help articles and FAQ entries.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreate}
          className="gap-2 font-extrabold cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create FAQ
        </Button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-input bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Statuses ({faqs.length})</option>
              <option value="published">Published</option>
              <option value="draft">Drafts / Hidden</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-input bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-muted-foreground">
          Showing <span className="text-foreground font-black">{filteredFaqs.length}</span> of {faqs.length} entries
        </div>
      </div>

      {/* FAQ TABLE */}
      <AdminFaqTable
        faqs={filteredFaqs}
        onEdit={handleOpenEdit}
        onToggleStatus={togglePublishStatus}
        onDelete={deleteFaq}
        isLoading={isLoading}
      />

      {/* DIALOG */}
      <AdminFaqDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        categories={categories}
        editingFaq={editingFaq}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
