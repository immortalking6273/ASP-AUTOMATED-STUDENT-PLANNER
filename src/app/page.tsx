import Link from "next/link";
import { GraduationCap, ArrowRight, Sparkles, BookOpen, Bot, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight text-base">{siteConfig.shortName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={ROUTES.DASHBOARD}>
            <Button size="sm">Enter Workspace</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 text-center px-4 max-w-4xl mx-auto space-y-6">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>AI-Powered Student Workspace</span>
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Automated Student Planner <br />
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              Study Smarter with AI
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize notes, upload documents, chat with PDFs, generate flashcards, plan assignments, and track your study sessions in one intelligent workspace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href={ROUTES.DASHBOARD}>
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Go to Dashboard
              </Button>
            </Link>
            <Link href={ROUTES.WORKSPACE}>
              <Button variant="outline" size="lg">
                Explore Workspace
              </Button>
            </Link>
          </div>
        </section>

        {/* Core Pillars Feature Grid */}
        <section className="py-12 bg-muted/30 border-t border-b px-4">
          <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Smart Notes</CardTitle>
                <CardDescription>Rich note editor with AI synthesis and auto-tagging.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Bot className="h-8 w-8 text-indigo-500 mb-2" />
                <CardTitle className="text-lg">Doc RAG Chat</CardTitle>
                <CardDescription>Upload PDFs, PPTs, DOCX and query them instantly.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Layers className="h-8 w-8 text-emerald-500 mb-2" />
                <CardTitle className="text-lg">Active Recall</CardTitle>
                <CardDescription>Auto-generate flashcards and practice quizzes.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-lg">Smart Planner</CardTitle>
                <CardDescription>Automated study schedule and assignment tracking.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. Module 1 Foundation Architecture.
      </footer>
    </div>
  );
}
