"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const AIInsightsCard: React.FC = () => {
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
        <Sparkles className="h-3 w-3 animate-pulse" />
        <span>NVIDIA NIM Engine</span>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Study Assistant Insights</h3>
            <p className="text-[11px] text-muted-foreground">Personalized study plan & RAG document synthesis</p>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-background/60 p-3 text-xs text-muted-foreground space-y-2">
          <p className="leading-relaxed">
            &ldquo;Based on your upcoming Database Design assignment, reviewing <strong>Normalization & Indexes</strong> in your notes will improve your retention score by 25%.&rdquo;
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-primary">
            Automated recommendations active
          </span>
          <Link href="/chat">
            <Button size="sm" variant="ghost" className="text-xs gap-1 text-primary hover:bg-primary/10">
              <span>Ask AI Chat</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
