"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
import {
  useQuizzes,
  QuizCard,
  QuizGeneratorDialog,
  QuizPreviewDialog,
  QuizMode,
  QuizResults,
  GeneratedQuizPreview,
  QuizRow,
  QuizQuestionRow,
  QuizAttemptRow,
} from "@/features/quizzes";
import {
  Sparkles,
  HelpCircle,
  Search,
  Plus,
  Trophy,
  CheckCircle2,
  Clock,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QuizzesPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);
  const [workspacesLoading, setWorkspacesLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    WorkspacesService.getWorkspaces(user.id)
      .then((res) => {
        const list = res.data || [];
        setWorkspaces(list);
        if (list.length > 0) {
          setSelectedWorkspaceId(list[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setWorkspacesLoading(false));
  }, [user]);

  const quizzes = useQuizzes(selectedWorkspaceId);

  // Dialog States
  const [genDialogOpen, setGenDialogOpen] = React.useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<GeneratedQuizPreview | null>(null);

  // Active Quiz Exam / Results Mode
  const [quizModeActive, setQuizModeActive] = React.useState(false);
  const [activeQuiz, setActiveQuiz] = React.useState<{
    quiz: QuizRow;
    questions: QuizQuestionRow[];
    attempt: QuizAttemptRow;
  } | null>(null);

  const [resultsActive, setResultsActive] = React.useState(false);
  const [completedAttempt, setCompletedAttempt] = React.useState<{
    quizTitle: string;
    attempt: QuizAttemptRow;
    questions: QuizQuestionRow[];
    studentAnswers: Record<string, string>;
  } | null>(null);

  // Start Quiz Handler
  const handleStartQuiz = async (quizId: string) => {
    if (!selectedWorkspaceId) return;
    try {
      const { quiz, questions } = await quizzes.getQuizDetails(quizId);
      if (!questions || questions.length === 0) {
        throw new Error("This quiz has no questions.");
      }

      const attempt = await quizzes.startAttempt(quizId, questions.length);
      if (!attempt) throw new Error("Failed to create quiz attempt.");

      setActiveQuiz({ quiz, questions, attempt });
      setQuizModeActive(true);
    } catch (err) {
      console.error("handleStartQuiz error:", err);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">AI Quiz Generator</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Test your knowledge with practice quizzes generated from your study materials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {workspaces.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-semibold text-muted-foreground">Workspace:</span>
              <select
                value={selectedWorkspaceId || ""}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            size="sm"
            onClick={() => setGenDialogOpen(true)}
            className="gap-1.5 text-xs font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Generate Quiz
          </Button>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Quizzes
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground">{quizzes.stats.totalQuizzes}</span>
            <HelpCircle className="h-4 w-4 text-violet-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
            Completed Quizzes
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">{quizzes.stats.completedQuizzes}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            Average Score
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400">{quizzes.stats.avgScore}%</span>
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
        </div>
      </div>

      {/* TOOLBAR & SEARCH / FILTERS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={quizzes.filters.searchQuery || ""}
            onChange={(e) =>
              quizzes.setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            placeholder="Search quizzes by title or subject..."
            className="pl-9 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "completed", "in_progress"] as const).map((status) => (
            <button
              key={status}
              onClick={() =>
                quizzes.setFilters((prev) => ({ ...prev, statusFilter: status }))
              }
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                quizzes.filters.statusFilter === status
                  ? "border-primary bg-primary/15 text-primary shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}

          {/* Subject Filter Dropdown */}
          {quizzes.subjects.length > 0 && (
            <select
              value={quizzes.filters.subjectFilter || "all"}
              onChange={(e) =>
                quizzes.setFilters((prev) => ({ ...prev, subjectFilter: e.target.value }))
              }
              className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {quizzes.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* QUIZZES GRID */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
          Practice Quizzes ({quizzes.filteredQuizzes.length})
        </h2>

        {quizzes.filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quizzes.filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onStart={() => handleStartQuiz(quiz.id)}
                onDelete={() => quizzes.deleteQuiz(quiz.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-3">
            <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Quizzes Available</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Generate custom practice quizzes from your study documents, notes, or topics.
            </p>
            <Button
              size="sm"
              onClick={() => setGenDialogOpen(true)}
              className="gap-1.5 font-extrabold cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Generate First Quiz
            </Button>
          </div>
        )}
      </div>

      {/* DIALOG MODALS */}

      {/* Generator Dialog */}
      <QuizGeneratorDialog
        open={genDialogOpen}
        onClose={() => setGenDialogOpen(false)}
        workspaceId={selectedWorkspaceId}
        onGenerated={(preview) => {
          setPreviewData(preview);
          setPreviewDialogOpen(true);
        }}
      />

      {/* Preview Dialog */}
      <QuizPreviewDialog
        open={previewDialogOpen}
        preview={previewData}
        onClose={() => {
          setPreviewDialogOpen(false);
          setPreviewData(null);
        }}
        onRegenerate={() => {
          setPreviewDialogOpen(false);
          setGenDialogOpen(true);
        }}
        onStartQuiz={async () => {
          if (!previewData) return;
          const createdQuiz = await quizzes.saveGeneratedQuiz(previewData);
          if (createdQuiz) {
            await handleStartQuiz(createdQuiz.id);
          }
        }}
      />

      {/* Quiz Exam Simulator */}
      {quizModeActive && activeQuiz && (
        <QuizMode
          quizTitle={activeQuiz.quiz.title}
          questions={activeQuiz.questions}
          attemptId={activeQuiz.attempt.id}
          onClose={() => setQuizModeActive(false)}
          onSubmitAttempt={async (answers) => {
            return await quizzes.submitAttempt(activeQuiz.attempt.id, answers);
          }}
          onCompleted={(completed, questions, studentAnswers) => {
            setQuizModeActive(false);
            setCompletedAttempt({
              quizTitle: activeQuiz.quiz.title,
              attempt: completed,
              questions,
              studentAnswers,
            });
            setResultsActive(true);
          }}
        />
      )}

      {/* Quiz Results Screen */}
      {resultsActive && completedAttempt && (
        <QuizResults
          quizTitle={completedAttempt.quizTitle}
          attempt={completedAttempt.attempt}
          questions={completedAttempt.questions}
          studentAnswers={completedAttempt.studentAnswers}
          onClose={() => {
            setResultsActive(false);
            setCompletedAttempt(null);
          }}
          onRetry={() => {
            setResultsActive(false);
            if (activeQuiz) {
              handleStartQuiz(activeQuiz.quiz.id);
            }
          }}
        />
      )}
    </div>
  );
}
