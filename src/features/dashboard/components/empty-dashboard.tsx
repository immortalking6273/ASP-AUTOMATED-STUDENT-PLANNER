"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, FolderPlus, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const EmptyDashboard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-xl mx-auto py-12">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
        <GraduationCap className="h-10 w-10 animate-bounce" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to ASP Student Planner</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your personal AI-powered academic workspace. Get started by creating your first subject workspace or exploring notes.
        </p>
      </div>

      <Card className="w-full border-dashed bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Onboarding Quickstart</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Create your first workspace to unlock note taking, PDF document chat, assignment planning, and active recall study tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/workspace">
            <Button className="w-full sm:w-auto" leftIcon={<FolderPlus className="h-4 w-4" />}>
              Create First Workspace
            </Button>
          </Link>
          <Link href="/notes">
            <Button variant="outline" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Take a Note
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
