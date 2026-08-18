"use client";

import * as React from "react";
import { FaqWithCategory } from "../types";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Eye, EyeOff, FileQuestion, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminFaqTableProps {
  faqs: FaqWithCategory[];
  onEdit: (faq: FaqWithCategory) => void;
  onToggleStatus: (faq: FaqWithCategory) => void;
  onDelete: (faqId: string) => void;
  isLoading?: boolean;
}

export function AdminFaqTable({
  faqs,
  onEdit,
  onToggleStatus,
  onDelete,
  isLoading,
}: AdminFaqTableProps) {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-card border border-border/80 animate-pulse p-4" />
        ))}
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-border bg-card/40">
        <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-bold text-foreground">No FAQs created yet</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Click "+ Create FAQ" to add your first help article.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Question & Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {faqs.map((faq) => {
                const isPublished = faq.status === "published" && faq.is_published;

                return (
                  <tr key={faq.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-muted-foreground">
                      #{faq.sort_order}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-foreground leading-snug line-clamp-1">
                        {faq.question}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <span>{faq.category?.name || "Uncategorized"}</span>
                        <span>•</span>
                        <span className="line-clamp-1">{faq.answer}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1",
                          isPublished
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : faq.status === "archived"
                            ? "bg-muted text-muted-foreground border border-border"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        )}
                      >
                        {isPublished ? "Published" : faq.status === "archived" ? "Archived" : "Draft"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleStatus(faq)}
                          title={isPublished ? "Unpublish FAQ" : "Publish FAQ"}
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          {isPublished ? (
                            <Eye className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(faq)}
                          title="Edit FAQ"
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-primary" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(faq.id)}
                          title="Delete FAQ"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-foreground">Delete FAQ?</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this FAQ entry? Deleting this FAQ cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteId(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(deleteId);
                  setDeleteId(null);
                }}
                className="font-extrabold cursor-pointer"
              >
                Delete FAQ
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
