"use client";

import * as React from "react";
import { X, Sparkles, Loader2, FileText, BookOpen, Brain, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratedQuizPreview } from "../types";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

interface QuizGeneratorDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string | null;
  onGenerated: (preview: GeneratedQuizPreview) => void;
}

export function QuizGeneratorDialog({
  open,
  onClose,
  workspaceId,
  onGenerated,
}: QuizGeneratorDialogProps) {
  // Source selection
  const [sourceType, setSourceType] = React.useState<"document" | "notebook" | "knowledge" | "topic">("topic");
  const [sourceId, setSourceId] = React.useState("");
  const [title, setTitle] = React.useState("");

  // Options loaded from Supabase
  const [documents, setDocuments] = React.useState<Array<{ id: string; file_name: string }>>([]);
  const [notebooks, setNotebooks] = React.useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingSources, setIsLoadingSources] = React.useState(false);

  // Generator Config
  const [questionCount, setQuestionCount] = React.useState(10);
  const [difficulty, setDifficulty] = React.useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [questionTypes, setQuestionTypes] = React.useState<"multiple_choice" | "true_false" | "short_answer" | "mixed">("mixed");
  const [subject, setSubject] = React.useState("");

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && workspaceId) {
      const loadSources = async () => {
        setIsLoadingSources(true);
        try {
          const supabase = createClient();
          const [docsRes, nbsRes] = await Promise.all([
            supabase
              .from("uploaded_documents")
              .select("id, file_name")
              .eq("workspace_id", workspaceId)
              .order("created_at", { ascending: false }),
            supabase
              .from("notebooks")
              .select("id, title")
              .eq("workspace_id", workspaceId)
              .order("created_at", { ascending: false }),
          ]);

          setDocuments(docsRes.data || []);
          setNotebooks(nbsRes.data || []);
        } catch (err) {
          console.error("Error loading quiz sources:", err);
        } finally {
          setIsLoadingSources(false);
        }
      };

      loadSources();
      setError(null);
    }
  }, [open, workspaceId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;

    if (sourceType === "document" && !sourceId) {
      setError("Please select a document.");
      return;
    }
    if (sourceType === "notebook" && !sourceId) {
      setError("Please select a notebook.");
      return;
    }
    if (sourceType === "topic" && !sourceId.trim()) {
      setError("Please enter a custom topic focus.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: title.trim() || undefined,
          sourceType,
          sourceId,
          questionCount,
          difficulty,
          questionTypes,
          subject,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Quiz generation failed.");

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions were generated. Please try a different source or parameters.");
      }

      const previewPayload: GeneratedQuizPreview = {
        title: data.title || "AI Practice Quiz",
        sourceTitle: data.sourceTitle || "Study Content",
        sourceType,
        sourceId: sourceId || undefined,
        difficulty,
        questionTypes,
        questions: data.questions,
      };

      toast.success(`Generated ${data.questions.length} questions! Review preview below.`);
      onGenerated(previewPayload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to generate quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-violet-500/10 via-card to-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground">AI Quiz Generator</h2>
              <p className="text-[11px] text-muted-foreground">
                Generate practice exams powered by NVIDIA NIM & Hybrid RAG
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Source Selection */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">
              Select Material Source
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "topic", label: "Custom Topic", icon: Brain },
                { id: "document", label: "Document", icon: FileText },
                { id: "notebook", label: "Notebook", icon: BookOpen },
                { id: "knowledge", label: "Knowledge Base", icon: Layers },
              ].map((src) => {
                const Icon = src.icon;
                const isSel = sourceType === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      setSourceType(src.id as any);
                      setSourceId("");
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer gap-1.5 ${
                      isSel
                        ? "border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/30"
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {src.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Dropdowns */}
          {sourceType === "document" && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Choose Uploaded Document
              </label>
              {isLoadingSources ? (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading documents...
                </div>
              ) : documents.length > 0 ? (
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  <option value="">-- Select a document --</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      📄 {d.file_name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  No documents found in this workspace. Upload documents first or select another source.
                </p>
              )}
            </div>
          )}

          {sourceType === "notebook" && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Choose Notebook
              </label>
              {isLoadingSources ? (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading notebooks...
                </div>
              ) : notebooks.length > 0 ? (
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  <option value="">-- Select a notebook --</option>
                  {notebooks.map((n) => (
                    <option key={n.id} value={n.id}>
                      📓 {n.title}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  No notebooks found in this workspace. Create notes first or select another source.
                </p>
              )}
            </div>
          )}

          {sourceType === "topic" && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Topic / Subject Focus <span className="text-destructive">*</span>
              </label>
              <Input
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                placeholder="e.g. Java OOP Concepts, Inheritance & Interfaces"
              />
            </div>
          )}

          {/* Quiz Title & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Quiz Title <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Java OOP Practice Exam"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Subject Tag <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={25}>25 Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer capitalize"
              >
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Question Type
              </label>
              <select
                value={questionTypes}
                onChange={(e) => setQuestionTypes(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                <option value="mixed">Mixed Types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-xl p-3 border border-destructive/20">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isGenerating}
              className="flex-1 font-extrabold gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
