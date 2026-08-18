"use client";

import * as React from "react";
import { FileText, Files, CheckSquare, Clock, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export interface ActivityItem {
  id: string;
  type: "note" | "document" | "task" | "study";
  title: string;
  timestamp: string;
  href: string;
}

export interface RecentActivityProps {
  activities?: ActivityItem[];
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    type: "note",
    title: "Computer Science - Algorithm Complexity Notes",
    timestamp: new Date().toISOString(),
    href: "/notes",
  },
  {
    id: "2",
    type: "document",
    title: "Linear Algebra Chapter 4 Lecture.pdf",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    href: "/documents",
  },
  {
    id: "3",
    type: "task",
    title: "Submit Software Architecture Assignment",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    href: "/planner",
  },
  {
    id: "4",
    type: "study",
    title: "Focused Study Session: Machine Learning (45 mins)",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    href: "/analytics",
  },
];

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = DEFAULT_ACTIVITIES,
}) => {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "note":
        return <FileText className="h-4 w-4 text-primary" />;
      case "document":
        return <Files className="h-4 w-4 text-indigo-500" />;
      case "task":
        return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      case "study":
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
        <Link href="/workspace" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
          <span>View All</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            title="No Recent Activity"
            description="Your recent notes, documents, and study logs will appear here."
          />
        ) : (
          <div className="space-y-4">
            {activities.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/50 group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background shadow-xs">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 overflow-hidden space-y-0.5">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(item.timestamp)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
