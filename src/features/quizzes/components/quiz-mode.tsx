"use client";

import * as React from "react";
import { QuizQuestionRow, QuizAttemptRow } from "@/services/db/quizzes-service";
import { X, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizModeProps {
  quizTitle: string;
  questions: QuizQuestionRow[];
  attemptId: string;
  onClose: () => void;
  onSubmitAttempt: (
    answers: Array<{
      questionId: string;
      studentAnswer: string | null;
      isCorrect: boolean;
      explanation?: string;
    }>
  ) => Promise<QuizAttemptRow>;
  onCompleted: (attempt: QuizAttemptRow, questions: QuizQuestionRow[], studentAnswers: Record<string, string>) => void;
}

export function QuizMode({
  quizTitle,
  questions,
  attemptId,
  onClose,
  onSubmitAttempt,
  onCompleted,
}: QuizModeProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [studentAnswers, setStudentAnswers] = React.useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectAnswer = (ans: string) => {
    if (!currentQuestion) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: ans,
    }));
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const processedAnswers = questions.map((q) => {
        const sel = studentAnswers[q.id] || "";
        const normSel = sel.trim().toLowerCase();
        const normCorrect = q.correct_answer.trim().toLowerCase();

        let isCorrect = false;
        if (q.question_type === "multiple_choice") {
          // Check exact match or option letter prefix match (e.g. "B" matching "B. Option 2")
          isCorrect =
            normSel === normCorrect ||
            (normCorrect.length === 1 && normSel.startsWith(normCorrect.toLowerCase())) ||
            (normSel.length === 1 && normCorrect.startsWith(normSel.toLowerCase()));
        } else if (q.question_type === "true_false") {
          isCorrect = normSel === normCorrect;
        } else {
          // Short answer fuzzy comparison
          isCorrect = normSel.length > 0 && normCorrect.includes(normSel);
        }

        return {
          questionId: q.id,
          studentAnswer: sel || null,
          isCorrect,
          explanation: q.explanation || undefined,
        };
      });

      const attemptResult = await onSubmitAttempt(processedAnswers);
      onCompleted(attemptResult, questions, studentAnswers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const answeredCount = Object.keys(studentAnswers).filter((k) => studentAnswers[k]?.trim()).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  if (!questions || questions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-2xl text-foreground animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/25">
            Quiz Exam Mode
          </span>
          <span className="text-sm font-extrabold text-foreground truncate max-w-xs">
            {quizTitle}
          </span>
        </div>

        {/* Progress & Counter */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 w-48">
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground min-w-[50px] text-right">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            title="Exit Exam Mode"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Examination Area */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6">
          {/* Question Navigator Pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center bg-card/50 p-2.5 rounded-2xl border border-border/50">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = Boolean(studentAnswers[q.id]?.trim());

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-8 w-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40 scale-105"
                      : isAnswered
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-muted/60 text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Card */}
          {currentQuestion && (
            <div className="rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-extrabold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-md border border-violet-500/20">
                  QUESTION {currentIndex + 1} OF {totalQuestions}
                </span>
                <span className="capitalize font-semibold text-muted-foreground/70">
                  {currentQuestion.question_type.replace("_", " ")} • {currentQuestion.difficulty}
                </span>
              </div>

              <h2 className="text-base sm:text-xl font-bold text-foreground leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Answer Inputs */}
              <div className="space-y-3 pt-2">
                {/* Multiple Choice Options */}
                {currentQuestion.question_type === "multiple_choice" && (
                  <div className="space-y-2.5">
                    {(currentQuestion.options || []).map((opt, oIdx) => {
                      const isSelected = studentAnswers[currentQuestion.id] === opt;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectAnswer(opt)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-semibold cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? "border-primary bg-primary/15 text-foreground shadow-md ring-1 ring-primary/40"
                              : "border-border/80 bg-background/60 text-muted-foreground hover:border-primary/40 hover:bg-accent/50 hover:text-foreground"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/40"
                            }`}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="flex-1">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True / False Options */}
                {currentQuestion.question_type === "true_false" && (
                  <div className="grid grid-cols-2 gap-3">
                    {["True", "False"].map((opt) => {
                      const isSelected = studentAnswers[currentQuestion.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectAnswer(opt)}
                          className={`py-4 px-6 rounded-2xl border text-sm font-extrabold transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/15 text-primary shadow-md ring-1 ring-primary/40"
                              : "border-border bg-background text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer Input */}
                {currentQuestion.question_type === "short_answer" && (
                  <div>
                    <textarea
                      value={studentAnswers[currentQuestion.id] || ""}
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      placeholder="Type your explanation / answer here..."
                      rows={4}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Prev / Next / Submit */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="gap-1 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-xs font-bold text-muted-foreground">
            {answeredCount} of {totalQuestions} Answered
          </span>

          {currentIndex + 1 < totalQuestions ? (
            <Button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="gap-1 cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Submit Quiz
            </Button>
          )}
        </div>
      </div>

      {/* CONFIRMATION SUBMIT MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowConfirmModal(false)} />

          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {unansweredCount > 0 ? <AlertTriangle className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7 text-emerald-400" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">
                {unansweredCount > 0 ? "Unanswered Questions" : "Submit Quiz?"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {unansweredCount > 0
                  ? `You still have ${unansweredCount} unanswered question${unansweredCount > 1 ? "s" : ""}. Are you sure you want to submit?`
                  : "You've answered all questions! Ready to calculate your score?"}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowConfirmModal(false)} className="flex-1">
                Go Back
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 font-extrabold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
