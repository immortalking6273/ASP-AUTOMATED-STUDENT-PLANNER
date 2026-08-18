"use client";

import * as React from "react";
import { FaqWithCategory } from "../types";
import { ChevronDown, HelpCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqAccordionProps {
  faqs: FaqWithCategory[];
  openIds: string[];
  onToggle: (id: string) => void;
  isLoading?: boolean;
}

export function FaqAccordion({ faqs, openIds, onToggle, isLoading }: FaqAccordionProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="h-16 rounded-2xl bg-card border border-border/80 animate-pulse p-4"
          />
        ))}
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-border bg-card/40">
        <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-bold text-foreground">No help articles found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          Try searching with different keywords or switch categories to browse other topics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openIds.includes(faq.id);

        return (
          <div
            key={faq.id}
            className={cn(
              "rounded-2xl border transition-all overflow-hidden bg-card/80 backdrop-blur-sm",
              isOpen
                ? "border-primary/40 shadow-md shadow-primary/5"
                : "border-border/80 hover:border-border"
            )}
          >
            <button
              type="button"
              onClick={() => onToggle(faq.id)}
              className="w-full text-left p-4.5 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
              aria-expanded={isOpen}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {faq.category && (
                      <span className="px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-extrabold uppercase tracking-wider">
                        {faq.category.name}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-extrabold text-foreground leading-snug">
                    {faq.question}
                  </h4>
                </div>
              </div>

              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180 text-primary"
                )}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-border/40 text-xs text-muted-foreground leading-relaxed whitespace-pre-line animate-in fade-in-50 slide-in-from-top-1">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
