"use client";

import * as React from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="mb-4 rounded-2xl bg-destructive/10 p-4 text-destructive">
        <AlertOctagon className="h-12 w-12" />
      </div>
      <span className="text-sm font-semibold uppercase tracking-widest text-destructive">System Error</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unexpected application error occurred. Our engineering team has been notified.
      </p>
      <div className="mt-6">
        <Button onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
