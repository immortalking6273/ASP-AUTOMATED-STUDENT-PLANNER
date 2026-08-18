import { BaseDatabaseService } from "./base-service";

export interface QuizRow {
  id: string;
  user_id: string;
  workspace_id: string | null;
  title: string;
  description: string | null;
  total_questions: number;
  source_type: string | null;
  source_id: string | null;
  difficulty: string | null;
  question_types: string | null;
  subject: string | null;
  created_at: string;
  updated_at: string;
  latest_score?: number | null;
  attempts_count?: number;
}

export interface QuizQuestionRow {
  id: string;
  quiz_id: string;
  workspace_id: string | null;
  user_id: string;
  question: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  difficulty: "easy" | "medium" | "hard";
  question_order: number;
  created_at: string;
}

export interface QuizAttemptRow {
  id: string;
  quiz_id: string;
  workspace_id: string | null;
  user_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  percentage: number;
  started_at: string;
  completed_at: string | null;
}

export interface QuizAttemptAnswerRow {
  id: string;
  attempt_id: string;
  question_id: string;
  student_answer: string | null;
  is_correct: boolean;
  explanation: string | null;
  created_at: string;
}

export interface CreateQuizQuestionPayload {
  question: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  options?: string[] | null;
  correctAnswer: string;
  explanation?: string | null;
  difficulty?: "easy" | "medium" | "hard";
}

export interface CreateQuizPayload {
  workspaceId: string;
  title: string;
  description?: string | null;
  sourceType?: string;
  sourceId?: string | null;
  difficulty?: string;
  questionTypes?: string;
  subject?: string | null;
  questions: CreateQuizQuestionPayload[];
}

export class QuizzesService extends BaseDatabaseService {
  static async getQuizzes(workspaceId: string, client?: any): Promise<QuizRow[]> {
    try {
      const supabase = client || this.getSupabase();
      const { data: quizzes, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch attempt stats per quiz
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, percentage, completed_at")
        .eq("workspace_id", workspaceId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      return (quizzes || []).map((q: any) => {
        const quizAttempts = (attempts || []).filter((a: any) => a.quiz_id === q.id);
        const latestPct = quizAttempts.length > 0 ? Number(quizAttempts[0].percentage) : null;

        return {
          ...q,
          latest_score: latestPct,
          attempts_count: quizAttempts.length,
        };
      });
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async getQuiz(quizId: string, client?: any): Promise<{ quiz: QuizRow; questions: QuizQuestionRow[] }> {
    try {
      const supabase = client || this.getSupabase();
      const { data: quiz, error: quizErr } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (quizErr || !quiz) throw quizErr || new Error("Quiz not found.");

      const { data: questions, error: qErr } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("question_order", { ascending: true });

      if (qErr) throw qErr;

      return {
        quiz: quiz as QuizRow,
        questions: (questions || []) as QuizQuestionRow[],
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async createQuizWithQuestions(payload: CreateQuizPayload, client?: any): Promise<QuizRow> {
    try {
      const supabase = client || this.getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user required.");

      // 1. Insert Quiz Header
      const { data: quiz, error: quizErr } = await supabase
        .from("quizzes")
        .insert({
          user_id: user.id,
          workspace_id: payload.workspaceId,
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          total_questions: payload.questions.length,
          source_type: payload.sourceType || "workspace",
          source_id: payload.sourceId || null,
          difficulty: payload.difficulty || "mixed",
          question_types: payload.questionTypes || "mixed",
          subject: payload.subject?.trim() || null,
        })
        .select()
        .single();

      if (quizErr || !quiz) throw quizErr || new Error("Failed to insert quiz.");

      // 2. Insert Questions
      const questionRows = payload.questions.map((q, index) => ({
        quiz_id: quiz.id,
        workspace_id: payload.workspaceId,
        user_id: user.id,
        question: q.question.trim(),
        question_type: q.questionType,
        options: q.options || null,
        correct_answer: q.correctAnswer.trim(),
        explanation: q.explanation?.trim() || null,
        difficulty: q.difficulty || "medium",
        question_order: index + 1,
      }));

      const { error: qErr } = await supabase.from("quiz_questions").insert(questionRows);
      if (qErr) throw qErr;

      return quiz as QuizRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async deleteQuiz(quizId: string, client?: any): Promise<void> {
    try {
      const supabase = client || this.getSupabase();
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }
}

export class QuizAttemptsService extends BaseDatabaseService {
  static async startAttempt(
    payload: { quizId: string; workspaceId: string; totalQuestions: number },
    client?: any
  ): Promise<QuizAttemptRow> {
    try {
      const supabase = client || this.getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user required.");

      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: payload.quizId,
          workspace_id: payload.workspaceId,
          user_id: user.id,
          total_questions: payload.totalQuestions,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as QuizAttemptRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async submitAttempt(
    attemptId: string,
    answers: Array<{
      questionId: string;
      studentAnswer: string | null;
      isCorrect: boolean;
      explanation?: string;
    }>,
    client?: any
  ): Promise<QuizAttemptRow> {
    try {
      const supabase = client || this.getSupabase();

      const total = answers.length;
      const correct = answers.filter((a) => a.isCorrect).length;
      const unanswered = answers.filter((a) => !a.studentAnswer || !a.studentAnswer.trim()).length;
      const incorrect = total - correct - unanswered;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      const now = new Date().toISOString();

      // 1. Insert student answer rows
      const answerRows = answers.map((a) => ({
        attempt_id: attemptId,
        question_id: a.questionId,
        student_answer: a.studentAnswer || null,
        is_correct: a.isCorrect,
        explanation: a.explanation || null,
      }));

      const { error: ansErr } = await supabase.from("quiz_attempt_answers").insert(answerRows);
      if (ansErr) throw ansErr;

      // 2. Update attempt completion stats
      const { data: updatedAttempt, error: attemptErr } = await supabase
        .from("quiz_attempts")
        .update({
          score: correct,
          correct_answers: correct,
          incorrect_answers: incorrect,
          unanswered: unanswered,
          percentage: percentage,
          completed_at: now,
        })
        .eq("id", attemptId)
        .select()
        .single();

      if (attemptErr) throw attemptErr;
      return updatedAttempt as QuizAttemptRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async getAttempts(quizId: string, client?: any): Promise<QuizAttemptRow[]> {
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return (data || []) as QuizAttemptRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async getAttemptDetails(attemptId: string, client?: any): Promise<{ attempt: QuizAttemptRow; answers: QuizAttemptAnswerRow[] }> {
    try {
      const supabase = client || this.getSupabase();
      const { data: attempt, error: aErr } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("id", attemptId)
        .single();

      if (aErr || !attempt) throw aErr || new Error("Attempt not found.");

      const { data: answers, error: ansErr } = await supabase
        .from("quiz_attempt_answers")
        .select("*")
        .eq("attempt_id", attemptId);

      if (ansErr) throw ansErr;

      return {
        attempt: attempt as QuizAttemptRow,
        answers: (answers || []) as QuizAttemptAnswerRow[],
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
