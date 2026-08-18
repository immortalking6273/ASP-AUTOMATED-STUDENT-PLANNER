"use client";

import * as React from "react";
import { QuizQuestionRow, QuizAttemptRow } from "@/services/db/quizzes-service";
import { Trophy, CheckCircle2, XCircle, HelpCircle, RotateCw, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizResultsProps {
  quizTitle: string;
  attempt: QuizAttemptRow;
  questions: QuizQuestionRow[];
  studentAnswers: Record<string, string>;
  onClose: () => void;
  onRetry: () => void;
}

export function QuizResults({
  quizTitle,
  attempt,
  questions,
  studentAnswers,
  onClose,
  onRetry,
}: QuizResultsProps) {
  const [activeTab, setActiveTab] = React.useState<"summary" | "review">("summary");

  const pct = attempt.percentage || 0;
  const isPassed = pct >= 70;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-2xl text-foreground animate-in fade-in duration-200 overflow-y-auto p-4 sm:p-6">
      <div className="w-full max-w-3xl mx-auto space-y-6 my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/25">
              Quiz Results
            </span>
            <h1 className="text-xl font-black text-foreground mt-1">{quizTitle}</h1>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={activeTab === "summary" ? "primary" : "outline"}
              onClick={() => setActiveTab("summary")}
              className="text-xs font-bold"
            >
              Summary
            </Button>
            <Button
              size="sm"
              variant={activeTab === "review" ? "primary" : "outline"}
              onClick={() => setActiveTab("review")}
              className="text-xs font-bold"
            >
              Review Answers ({questions.length})
            </Button>
          </div>
        </div>

        {activeTab === "summary" ? (
          /* SUMMARY TAB */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Main Score Banner */}
            <div className="rounded-3xl border border-border bg-card shadow-2xl p-8 text-center space-y-4">
              <div
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border ${
                  isPassed
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                }`}
              >
                <Trophy className="h-10 w-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="text-4xl font-black text-foreground">{pct}%</span>
                <p className="text-sm font-bold text-foreground">
                  {isPassed ? "Great Job! You Passed!" : "Keep Practicing!"}
                </p>
                <p className="text-xs text-muted-foreground">
                  You answered {attempt.correct_answers} out of {attempt.total_questions} questions correctly.
                </p>
              </div>

              {/* Stats Breakdown Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/40">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  <span className="text-lg font-black">{attempt.correct_answers}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Correct</p>
                </div>

                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400">
                  <span className="text-lg font-black">{attempt.incorrect_answers}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Incorrect</p>
                </div>

                <div className="p-3 rounded-2xl bg-muted/60 border border-border/60 text-muted-foreground">
                  <span className="text-lg font-black">{attempt.unanswered}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Unanswered</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveTab("review")}
                className="flex-1 rounded-2xl gap-2 font-bold"
              >
                <BookOpen className="h-4 w-4" />
                Review Answers
              </Button>
              <Button onClick={onRetry} className="flex-1 rounded-2xl gap-2 font-extrabold cursor-pointer">
                <RotateCw className="h-4 w-4" />
                Retry Quiz
              </Button>
              <Button variant="secondary" onClick={onClose} className="rounded-2xl gap-1">
                Done
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* REVIEW TAB */
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-foreground">Detailed Question Review</h2>
              <Button size="sm" variant="ghost" onClick={() => setActiveTab("summary")} className="text-xs">
                Back to Score
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const sAns = studentAnswers[q.id] || "";
                const normS = sAns.trim().toLowerCase();
                const normC = q.correct_answer.trim().toLowerCase();

                let isCorrect = false;
                if (q.question_type === "multiple_choice") {
                  isCorrect =
                    normS === normC ||
                    (normC.length === 1 && normS.startsWith(normC.toLowerCase())) ||
                    (normS.length === 1 && normC.startsWith(normS.toLowerCase()));
                } else if (q.question_type === "true_false") {
                  isCorrect = normS === normC;
                } else {
                  isCorrect = normS.length > 0 && normC.includes(normS);
                }

                const isUnanswered = !sAns || !sAns.trim();

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-5 space-y-3 ${
                      isUnanswered
                        ? "border-amber-500/30 bg-amber-500/5"
                        : isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-black text-violet-400">
                        Question #{idx + 1} • {q.question_type.replace("_", " ").toUpperCase()}
                      </span>

                      {isUnanswered ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          <AlertCircle className="h-3 w-3" /> Unanswered
                        </span>
                      ) : isCorrect ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                          <XCircle className="h-3 w-3" /> Incorrect
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-foreground">Q: {q.question}</p>

                    <div className="space-y-1.5 pt-1 text-xs">
                      <p
                        className={`font-semibold ${
                          isCorrect ? "text-emerald-400" : isUnanswered ? "text-amber-400" : "text-red-400"
                        }`}
                      >
                        Your Answer: {sAns || "(No answer submitted)"}
                      </p>
                      <p className="font-semibold text-emerald-400">
                        Correct Answer: {q.correct_answer}
                      </p>
                    </div>

                    {q.explanation && (
                      <div className="mt-2 p-3 rounded-xl bg-card/80 border border-border text-xs text-muted-foreground leading-relaxed">
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Button onClick={onClose} className="w-full rounded-2xl">
                Close Review
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
