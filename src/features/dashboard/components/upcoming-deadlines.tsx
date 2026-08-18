"use client";

import * as React from "react";
import { TaskRow } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Circle, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/feedback/empty-state";
import Link from "next/link";

export interface UpcomingDeadlinesProps {
  tasks?: TaskRow[];
  onToggleTask?: (taskId: string, completed: boolean) => void;
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({
  tasks,
  onToggleTask,
}) => {
  const displayTasks = tasks || [];


  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-bold">Upcoming Deadlines</CardTitle>
        </div>
        <Link href="/planner" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
          <span>Planner</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {displayTasks.length === 0 ? (
          <EmptyState
            title="All caught up!"
            description="You have no upcoming assignment deadlines."
          />
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 bg-card/60 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => onToggleTask?.(task.id, !task.completed)}
                    className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/60" />
                    )}
                  </button>
                  <div className="overflow-hidden space-y-0.5">
                    <p
                      className={`text-xs font-semibold truncate ${
                        task.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.due_date ? formatDate(task.due_date) : "No date"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">{getPriorityBadge(task.priority)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
