"use client";

import * as React from "react";
import { useHelpFaq } from "@/features/help/hooks/use-help-faq";
import { FaqSearchBar } from "@/features/help/components/faq-search-bar";
import { FaqCategoryNav } from "@/features/help/components/faq-category-nav";
import { FaqAccordion } from "@/features/help/components/faq-accordion";
import { SupportFeedbackDialog } from "@/features/help/components/support-feedback-dialog";
import { Button } from "@/components/ui/button";
import { CircleHelp, MessageSquare, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const {
    categories,
    faqs,
    rawFaqsCount,
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
    refetch,
  } = useHelpFaq();

  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 max-w-5xl">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/10 border border-border/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-1">
              <CircleHelp className="h-3.5 w-3.5" />
              ASP Help & Knowledge Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              How can we help?
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Find answers, learn how ASP works, or get help with your study workflow.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFeedbackOpen(true)}
              className="gap-2 font-extrabold cursor-pointer text-xs"
            >
              <MessageSquare className="h-4 w-4 text-primary" />
              Contact Support
            </Button>

            <Link href="/help/manage">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 font-bold cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                title="Admin FAQ Management"
              >
                <ShieldCheck className="h-4 w-4 text-violet-500" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="space-y-4">
        <FaqSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search help articles, features, or FAQs..."
        />

        <FaqCategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
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

      {/* FAQ ACCORDION LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <span>Frequently Asked Questions</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-bold">
              {faqs.length}
            </span>
          </h2>
          {searchQuery && (
            <p className="text-xs text-muted-foreground">
              Showing results for &ldquo;<span className="font-bold text-foreground">{searchQuery}</span>&rdquo;
            </p>
          )}
        </div>

        <FaqAccordion
          faqs={faqs}
          openIds={openFaqIds}
          onToggle={toggleFaq}
          isLoading={isLoading}
        />
      </div>

      {/* STILL NEED HELP CTA */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-1">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-base font-black text-foreground">Can&apos;t find what you&apos;re looking for?</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Send us a message or request support. Our team is dedicated to giving you the best automated student planning experience.
        </p>
        <Button
          type="button"
          onClick={() => setIsFeedbackOpen(true)}
          className="gap-2 font-extrabold cursor-pointer text-xs"
        >
          <MessageSquare className="h-4 w-4" />
          Send Us a Question
        </Button>
      </div>

      {/* FEEDBACK MODAL */}
      <SupportFeedbackDialog
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={submitFeedback}
        isSubmitting={isSubmittingFeedback}
      />
    </div>
  );
}
