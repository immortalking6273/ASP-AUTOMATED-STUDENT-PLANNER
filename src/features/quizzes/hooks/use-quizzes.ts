"use client";

import * as React from "react";
import {
  QuizzesService,
  QuizAttemptsService,
  QuizRow,
  QuizQuestionRow,
  QuizAttemptRow,
} from "@/services/db/quizzes-service";
import { QuizFilterState, GeneratedQuizPreview } from "../types";
import { toast } from "@/components/ui/toast";

export function useQuizzes(workspaceId: string | null) {
  const [quizzes, setQuizzes] = React.useState<QuizRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [filters, setFilters] = React.useState<QuizFilterState>({
    statusFilter: "all",
    subjectFilter: "all",
    searchQuery: "",
    sortBy: "created",
  });

  const loadData = React.useCallback(async () => {
    if (!workspaceId) {
      setQuizzes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const list = await QuizzesService.getQuizzes(workspaceId);
      setQuizzes(list);
    } catch (err: any) {
      console.error("[useQuizzes] load error:", err);
      setError("Unable to load quizzes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived unique subjects
  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => { if (q.subject?.trim()) set.add(q.subject.trim()); });
    return Array.from(set).sort();
  }, [quizzes]);

  // Filtered Quizzes List
  const filteredQuizzes = React.useMemo(() => {
    return quizzes
      .filter((q) => {
        // Status filter
        if (filters.statusFilter === "completed") {
          if (!q.attempts_count || q.attempts_count === 0) return false;
        } else if (filters.statusFilter === "in_progress") {
          if (q.attempts_count && q.attempts_count > 0) return false;
        }

        // Subject filter
        if (filters.subjectFilter && filters.subjectFilter !== "all") {
          if (!q.subject || q.subject.toLowerCase() !== filters.subjectFilter.toLowerCase()) {
            return false;
          }
        }

        // Search query
        if (filters.searchQuery && filters.searchQuery.trim()) {
          const query = filters.searchQuery.trim().toLowerCase();
          const matchTitle = q.title.toLowerCase().includes(query);
          const matchDesc = q.description?.toLowerCase().includes(query);
          const matchSubj = q.subject?.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchSubj) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        if (filters.sortBy === "questions") {
          return b.total_questions - a.total_questions;
        }
        if (filters.sortBy === "score") {
          return (b.latest_score || 0) - (a.latest_score || 0);
        }
        // Default: created date descending
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [quizzes, filters]);

  // Overall Stats
  const stats = React.useMemo(() => {
    const totalQuizzes = quizzes.length;
    const completedQuizzes = quizzes.filter((q) => (q.attempts_count || 0) > 0).length;
    const scores = quizzes
      .map((q) => q.latest_score)
      .filter((s): s is number => s !== null && s !== undefined);

    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      totalQuizzes,
      completedQuizzes,
      avgScore,
    };
  }, [quizzes]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const saveGeneratedQuiz = React.useCallback(
    async (preview: GeneratedQuizPreview) => {
      if (!workspaceId) return;

      try {
        const created = await QuizzesService.createQuizWithQuestions({
          workspaceId,
          title: preview.title,
          description: `Generated from ${preview.sourceTitle}`,
          sourceType: preview.sourceType,
          sourceId: preview.sourceId,
          difficulty: preview.difficulty,
          questionTypes: preview.questionTypes,
          questions: preview.questions.map((q) => ({
            question: q.question,
            questionType: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
          })),
        });

        toast.success(`Quiz "${created.title}" saved successfully!`);
        await loadData();
        return created;
      } catch (err: any) {
        toast.error(err.message || "Failed to save quiz.");
        throw err;
      }
    },
    [workspaceId, loadData]
  );

  const deleteQuiz = React.useCallback(
    async (quizId: string) => {
      try {
        await QuizzesService.deleteQuiz(quizId);
        toast.success("Quiz deleted");
        await loadData();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete quiz.");
        throw err;
      }
    },
    [loadData]
  );

  const getQuizDetails = React.useCallback(
    async (quizId: string) => {
      try {
        return await QuizzesService.getQuiz(quizId);
      } catch (err: any) {
        toast.error(err.message || "Failed to load quiz details.");
        throw err;
      }
    },
    []
  );

  const startAttempt = React.useCallback(
    async (quizId: string, totalQuestions: number) => {
      if (!workspaceId) return;
      try {
        return await QuizAttemptsService.startAttempt({
          quizId,
          workspaceId,
          totalQuestions,
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to start quiz attempt.");
        throw err;
      }
    },
    [workspaceId]
  );

  const submitAttempt = React.useCallback(
    async (
      attemptId: string,
      answers: Array<{
        questionId: string;
        studentAnswer: string | null;
        isCorrect: boolean;
        explanation?: string;
      }>
    ) => {
      try {
        const completed = await QuizAttemptsService.submitAttempt(attemptId, answers);
        await loadData();
        return completed;
      } catch (err: any) {
        toast.error(err.message || "Failed to submit quiz attempt.");
        throw err;
      }
    },
    [loadData]
  );

  return {
    quizzes,
    filteredQuizzes,
    subjects,
    filters,
    setFilters,
    stats,
    isLoading,
    error,
    getQuizDetails,
    saveGeneratedQuiz,
    deleteQuiz,
    startAttempt,
    submitAttempt,
    refresh: loadData,
  };
}
