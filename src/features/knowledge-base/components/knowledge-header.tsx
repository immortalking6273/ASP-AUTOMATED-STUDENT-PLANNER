"use client";

import * as React from "react";
import { Search, Sparkles, X, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowledgeFilterTab } from "../types";
import { cn } from "@/lib/utils";

interface KnowledgeHeaderProps {
  filterTab: KnowledgeFilterTab;
  onTabChange: (tab: KnowledgeFilterTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExecuteSearch: (q: string) => void;
  onClearSearch: () => void;
  hasSearched: boolean;
  isSearching: boolean;
}

export function KnowledgeHeader({
  filterTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onExecuteSearch,
  onClearSearch,
  hasSearched,
  isSearching,
}: KnowledgeHeaderProps) {
  const tabs: { key: KnowledgeFilterTab; label: string }[] = [
    { key: "all", label: "All Materials" },
    { key: "ready", label: "Ready / Indexed" },
    { key: "processing", label: "Processing" },
    { key: "failed", label: "Failed" },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      onExecuteSearch(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Database className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              AI Knowledge Base
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
              384-D Vectors
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Your AI-powered study knowledge library.
          </p>
        </div>
      </div>

      {/* Semantic Knowledge Search Bar */}
      <div className="relative flex items-center bg-card border border-border p-2 rounded-2xl shadow-2xs">
        <Search className="h-4 w-4 text-muted-foreground ml-3 shrink-0" />
        <input
          type="text"
          placeholder='Ask or search your knowledge base (e.g. "Java packages", "Data structures arrays")...'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              if (hasSearched) onClearSearch();
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => onExecuteSearch(searchQuery)}
          disabled={!searchQuery.trim() || isSearching}
          leftIcon={<Sparkles className="h-4 w-4 text-primary-foreground" />}
          className="rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
        >
          {isSearching ? "Searching..." : "Search Knowledge"}
        </Button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
        {tabs.map((tab) => {
          const isActive = filterTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
