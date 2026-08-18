"use client";

import * as React from "react";
import { Sparkles, Bot, X, Check, Copy, ArrowDown, RefreshCw, HelpCircle, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorBlock } from "../types";
import { MarkdownContent } from "@/features/chat/components/markdown-content";

interface AINoteAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
  workspaceId: string;
  blocks: EditorBlock[];
  onInsertBlock: (text: string) => void;
}

export function AINoteAssistant({
  isOpen,
  onClose,
  pageTitle,
  workspaceId,
  blocks,
  onInsertBlock,
}: AINoteAssistantProps) {
  const [selectedPromptType, setSelectedPromptType] = React.useState<"summary" | "explain" | "flashcards" | "quiz">("summary");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [aiOutput, setAiOutput] = React.useState("");
  const [hasCopied, setHasCopied] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const noteText = React.useMemo(() => {
    const title = pageTitle ? `Title: ${pageTitle}\n\n` : "";
    const body = blocks.map((b) => b.content?.text || "").filter(Boolean).join("\n");
    return title + body;
  }, [pageTitle, blocks]);

  const handleGenerate = async (promptType: "summary" | "explain" | "flashcards" | "quiz") => {
    setSelectedPromptType(promptType);
    setIsGenerating(true);
    setAiOutput("");
    setErrorMessage(null);

    if (!noteText.trim()) {
      setErrorMessage("This note is currently empty. Please write some content first!");
      setIsGenerating(false);
      return;
    }

    let promptInstruction = "";
    switch (promptType) {
      case "summary":
        promptInstruction = `Please provide a clear, 3-bullet point executive summary of the following academic note:\n\n${noteText}`;
        break;
      case "explain":
        promptInstruction = `Please explain the key concepts in the following academic note in simple, easy-to-understand terms suitable for a student revision session:\n\n${noteText}`;
        break;
      case "flashcards":
        promptInstruction = `Please generate 3 study flashcards (Question & Answer format) based on the following note content:\n\n${noteText}`;
        break;
      case "quiz":
        promptInstruction = `Please create 3 multiple-choice study quiz questions (with marked correct answers) based on the following note:\n\n${noteText}`;
        break;
    }

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspaceId || undefined,
          question: promptInstruction,
          mode: "hybrid",
        }),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body returned from AI service");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let rafId: number | null = null;
      let isFirstToken = true;

      const scheduleTextUpdate = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          setAiOutput(accumulated);
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === "delta" && data.text) {
                accumulated += data.text;
                if (isFirstToken) {
                  isFirstToken = false;
                  setAiOutput(accumulated); // Immediate render for 0ms TTFT perception
                } else {
                  scheduleTextUpdate(); // RAF smooth batching
                }
              }
            } catch {
              // Ignore partial SSE JSON chunks
            }
          }
        }
      }

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      setAiOutput(accumulated);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate AI response. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (aiOutput) {
      navigator.clipboard.writeText(aiOutput);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (aiOutput) {
      onInsertBlock(aiOutput);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl p-6 space-y-5 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-foreground">NVIDIA NIM Note Assistant</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded-full">
                  AI Live
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Synthesize, summarize, or generate study tools from your note</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Prompt Selection Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleGenerate("summary")}
            disabled={isGenerating}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer",
              selectedPromptType === "summary"
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="h-4 w-4" />
            <span>Summarize</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenerate("explain")}
            disabled={isGenerating}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer",
              selectedPromptType === "explain"
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Explain</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenerate("flashcards")}
            disabled={isGenerating}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer",
              selectedPromptType === "flashcards"
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Flashcards</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenerate("quiz")}
            disabled={isGenerating}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer",
              selectedPromptType === "quiz"
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>Quiz Questions</span>
          </button>
        </div>

        {/* Output Display Panel */}
        <div className="relative min-h-[160px] max-h-[280px] overflow-y-auto rounded-2xl border border-border bg-background/80 p-4 text-xs font-medium leading-relaxed">
          {isGenerating && !aiOutput && (
            <div className="flex flex-col items-center justify-center h-32 space-y-2 text-muted-foreground">
              <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              <span>NVIDIA NIM is processing your note...</span>
            </div>
          )}

          {errorMessage && (
            <div className="text-destructive font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          {!isGenerating && !aiOutput && !errorMessage && (
            <div className="text-muted-foreground text-center py-8">
              Select an AI action above to synthesize or generate study content from &ldquo;{pageTitle || "Untitled Note"}&rdquo;.
            </div>
          )}

          {aiOutput && <MarkdownContent content={aiOutput} />}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!aiOutput}
            leftIcon={hasCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            className="rounded-xl text-xs"
          >
            {hasCopied ? "Copied!" : "Copy Output"}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleInsert}
            disabled={!aiOutput}
            leftIcon={<ArrowDown className="h-4 w-4" />}
            className="rounded-xl text-xs font-semibold shadow-xs"
          >
            Insert into Note
          </Button>
        </div>
      </div>
    </div>
  );
}
