import {
  QuizRow,
  QuizQuestionRow,
  QuizAttemptRow,
  QuizAttemptAnswerRow,
} from "@/services/db/quizzes-service";

export type { QuizRow, QuizQuestionRow, QuizAttemptRow, QuizAttemptAnswerRow };

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";
export type QuizDifficulty = "easy" | "medium" | "hard" | "mixed";

export interface QuizFilterState {
  statusFilter: "all" | "completed" | "in_progress" | "recent";
  subjectFilter?: string;
  searchQuery?: string;
  sortBy: "created" | "title" | "questions" | "score";
}

export interface StudentAnswerMap {
  [questionId: string]: string; // questionId -> selected answer string
}

export interface GeneratedQuizPreview {
  title: string;
  description?: string;
  sourceTitle: string;
  sourceType: string;
  sourceId?: string;
  difficulty: string;
  questionTypes: string;
  questions: Array<{
    question: string;
    type: QuestionType;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
  }>;
}
