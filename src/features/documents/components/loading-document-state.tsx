"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingDocumentState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-border/60 bg-card/60 p-5 space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-6 w-6 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
