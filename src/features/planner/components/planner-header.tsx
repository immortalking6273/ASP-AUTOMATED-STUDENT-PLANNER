"use client";

import * as React from "react";
import { Plus, Sparkles, CalendarPlus, Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlannerFilterState, TaskFilterTab, TaskPriority } from "../types";
import { cn } from "@/lib/utils";

interface PlannerHeaderProps {
  filters: PlannerFilterState;
  onFilterChange: React.Dispatch<React.SetStateAction<PlannerFilterState>>;
  subjects: string[];
  onOpenAddTask: () => void;
  onOpenAddSession: () => void;
  onGenerateAIPlan: () => void;
  isGeneratingPlan: boolean;
  overdueCount: number;
}

export function PlannerHeader({
  filters,
  onFilterChange,
  subjects,
  onOpenAddTask,
  onOpenAddSession,
  onGenerateAIPlan,
  isGeneratingPlan,
  overdueCount,
}: PlannerHeaderProps) {
  const tabs: { key: TaskFilterTab; label: string; badge?: number }[] = [
    { key: "all", label: "All Tasks" },
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "overdue", label: "Overdue", badge: overdueCount },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Study Planner
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
              Smart Schedule
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Organize your tasks, deadlines and study sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAddSession}
            leftIcon={<CalendarPlus className="h-4 w-4" />}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Add Session
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAddTask}
            leftIcon={<Plus className="h-4 w-4" />}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Add Task
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onGenerateAIPlan}
            disabled={isGeneratingPlan}
            leftIcon={<Sparkles className="h-4 w-4 text-primary-foreground" />}
            className="rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            {isGeneratingPlan ? "Generating Plan..." : "AI Study Plan"}
          </Button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-2xs">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map((tab) => {
            const isActive = filters.tab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onFilterChange((prev) => ({ ...prev, tab: tab.key }))}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-destructive/15 text-destructive"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Select Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[140px] flex-1 md:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Priority Select */}
          <div className="relative">
            <select
              value={filters.priority || "all"}
              onChange={(e) =>
                onFilterChange((prev) => ({
                  ...prev,
                  priority: e.target.value as TaskPriority | "all",
                }))
              }
              className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground font-medium cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Subject Select */}
          {subjects.length > 0 && (
            <div className="relative">
              <select
                value={filters.subject || "all"}
                onChange={(e) =>
                  onFilterChange((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground font-medium cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Select */}
          <div className="relative">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-") as [any, any];
                onFilterChange((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground font-medium cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="priority-desc">Priority (High $\rightarrow$ Low)</option>
              <option value="createdAt-desc">Created Date (Newest)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
