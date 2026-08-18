"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingNotebookState: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-border/60 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <Skeleton className="h-6 w-6 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
          </div>
          <div className="pt-3 flex justify-between border-t border-border/40">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};
