import { BaseDatabaseService } from "./base-service";

export type TimeRangeOption = "7d" | "30d" | "90d" | "semester" | "all";

export interface AnalyticsOverviewData {
  totalStudyMinutes: number;
  studyTimeFormatted: string;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number; // 0 - 100
  currentStreakDays: number;
  longestStreakDays: number;
}

export interface DailyStudyActivity {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, etc.
  minutes: number;
  hoursFormatted: string;
  level: 0 | 1 | 2 | 3; // 0=none, 1=low, 2=med, 3=high
}

export interface WeeklyStudyTrend {
  weekLabel: string;
  minutes: number;
  hoursFormatted: string;
}

export interface TaskAnalyticsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  dailyCompletionTrend: Array<{ date: string; dayLabel: string; count: number }>;
}

export interface SubjectAnalyticsData {
  subject: string;
  studyMinutes: number;
  studyHoursFormatted: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  quizAverageScore: number | null;
}

export interface QuizAnalyticsData {
  quizzesAttempted: number;
  quizzesCompleted: number;
  avgScore: number;
  bestScore: number;
  lowestScore: number;
  scoreTrend: Array<{ quizTitle: string; date: string; score: number }>;
  scoreImprovementPct: number | null;
}

export interface FlashcardAnalyticsData {
  cardsReviewed: number;
  cardsMastered: number;
  cardsLearning: number;
  totalCards: number;
  accuracyPct: number;
  ratingsDistribution: {
    againPct: number;
    hardPct: number;
    goodPct: number;
    easyPct: number;
  };
}

export interface ProductivityScoreData {
  score: number; // 0 - 100
  level: "Needs Focus" | "Consistent" | "High Achiever" | "Master Planner";
  breakdown: {
    taskCompletionScore: number; // max 40
    consistencyScore: number; // max 25
    quizScore: number; // max 20
    studyTimeScore: number; // max 15
  };
}

export interface DeterministicInsight {
  id: string;
  category: "study" | "tasks" | "quizzes" | "consistency";
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
}

export class AnalyticsService extends BaseDatabaseService {
  /**
   * Calculate start timestamp ISO string for a given time range option
   */
  public static getStartDate(range: TimeRangeOption): Date {
    const now = new Date();
    switch (range) {
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case "semester":
        return new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000); // 4 months
      case "all":
      default:
        return new Date(0);
    }
  }

  public static formatMinutes(mins: number): string {
    if (!mins || mins <= 0) return "0h 0m";
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  /**
   * Main aggregator fetching all analytics for a given workspace and date range
   */
  static async getFullAnalytics(workspaceId: string, range: TimeRangeOption = "7d", client?: any) {
    try {
      const supabase = client || this.getSupabase();
      const startDate = this.getStartDate(range);
      const startDateIso = startDate.toISOString();
      const now = new Date();

      // Run parallel DB queries
      const [
        sessionsRes,
        tasksRes,
        quizzesRes,
        quizAttemptsRes,
        flashcardsRes,
        reviewsRes,
      ] = await Promise.all([
        supabase
          .from("study_sessions")
          .select("*")
          .eq("workspace_id", workspaceId)
          .gte("created_at", startDateIso),
        supabase
          .from("tasks")
          .select("*")
          .eq("workspace_id", workspaceId),
        supabase
          .from("quizzes")
          .select("*")
          .eq("workspace_id", workspaceId),
        supabase
          .from("quiz_attempts")
          .select("*")
          .eq("workspace_id", workspaceId)
          .not("completed_at", "is", null)
          .gte("started_at", startDateIso),
        supabase
          .from("flashcards")
          .select("*")
          .eq("workspace_id", workspaceId),
        supabase
          .from("flashcard_reviews")
          .select("*")
          .eq("workspace_id", workspaceId)
          .gte("reviewed_at", startDateIso),
      ]);

      const sessions = sessionsRes.data || [];
      const tasks = tasksRes.data || [];
      const quizzes = quizzesRes.data || [];
      const attempts = quizAttemptsRes.data || [];
      const flashcards = flashcardsRes.data || [];
      const reviews = reviewsRes.data || [];

      // ─── 1. OVERVIEW & STUDY TIME DATA ────────────────────────────────────
      let totalStudyMinutes = 0;
      const dailyMap = new Map<string, number>();

      // Generate days for range
      const numDays = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 120;
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split("T")[0];
        dailyMap.set(key, 0);
      }

      const hourlyDistribution = new Array(24).fill(0);
      const dayOfWeekMap = new Map<number, number>([
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]
      ]);

      sessions.forEach((s: any) => {
        let mins = Number(s.duration) || 0;
        if (!mins && s.start_time && s.end_time) {
          const start = new Date(s.start_time).getTime();
          const end = new Date(s.end_time).getTime();
          if (end > start) mins = Math.round((end - start) / (1000 * 60));
        }
        if (mins <= 0) mins = 30; // sensible default for logged session

        totalStudyMinutes += mins;

        const sessionDate = new Date(s.start_time || s.created_at || now);
        const dateKey = sessionDate.toISOString().split("T")[0];
        if (dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + mins);
        }

        const hour = sessionDate.getHours();
        hourlyDistribution[hour] += mins;

        const dow = sessionDate.getDay();
        dayOfWeekMap.set(dow, (dayOfWeekMap.get(dow) || 0) + mins);
      });

      // Format Daily Activity List
      const dailyActivity: DailyStudyActivity[] = Array.from(dailyMap.entries()).map(([date, mins]) => {
        const dObj = new Date(date);
        const dayLabel = dObj.toLocaleDateString("en-US", { weekday: "short" });
        let level: 0 | 1 | 2 | 3 = 0;
        if (mins > 0 && mins <= 60) level = 1;
        else if (mins > 60 && mins <= 180) level = 2;
        else if (mins > 180) level = 3;

        return {
          date,
          dayLabel,
          minutes: mins,
          hoursFormatted: this.formatMinutes(mins),
          level,
        };
      });

      // Weekly Trend Breakdown (Last 4 weeks)
      const weeklyTrends: WeeklyStudyTrend[] = [];
      for (let w = 3; w >= 0; w--) {
        const wStart = new Date(now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000);
        const wEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
        let wMins = 0;
        sessions.forEach((s: any) => {
          const sDate = new Date(s.start_time || s.created_at || now);
          if (sDate >= wStart && sDate < wEnd) {
            wMins += Number(s.duration) || 30;
          }
        });
        weeklyTrends.push({
          weekLabel: `Week ${4 - w}`,
          minutes: wMins,
          hoursFormatted: this.formatMinutes(wMins),
        });
      }

      // Peak Study Time & Best Day
      let peakHour = 18; // default 6 PM
      let maxHourMins = -1;
      hourlyDistribution.forEach((m, h) => {
        if (m > maxHourMins) {
          maxHourMins = m;
          peakHour = h;
        }
      });
      const peakHourEnd = (peakHour + 2) % 24;
      const formatHour = (h: number) => {
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12} ${ampm}`;
      };
      const peakStudyTimeFormatted = `${formatHour(peakHour)} – ${formatHour(peakHourEnd)}`;

      const daysOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let bestDow = 6;
      let maxDowMins = -1;
      dayOfWeekMap.forEach((m, dow) => {
        if (m > maxDowMins) {
          maxDowMins = m;
          bestDow = dow;
        }
      });
      const bestStudyDayFormatted = daysOfWeekNames[bestDow];

      // ─── 2. TASK ANALYTICS ────────────────────────────────────────────────
      // Filter tasks relevant to date range if created/updated within range
      const rangeTasks = tasks.filter((t: any) => {
        const cDate = new Date(t.created_at || now);
        return cDate >= startDate;
      });

      const activeTasksPool = rangeTasks.length > 0 ? rangeTasks : tasks;
      const totalTasks = activeTasksPool.length;
      const completedTasksList = activeTasksPool.filter((t: any) => t.completed || t.status === "completed");
      const completedTasks = completedTasksList.length;
      const inProgressTasks = activeTasksPool.filter((t: any) => t.status === "in_progress").length;
      const todoTasks = activeTasksPool.filter((t: any) => t.status === "todo" || !t.status).length;

      const overdueTasks = activeTasksPool.filter((t: any) => {
        if (t.completed || t.status === "completed") return false;
        if (!t.due_date) return false;
        return new Date(t.due_date) < now;
      }).length;

      const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // ─── 3. QUIZ ANALYTICS ────────────────────────────────────────────────
      const quizAttemptsCount = attempts.length;
      const scores = attempts.map((a: any) => Number(a.percentage) || 0);
      const avgQuizScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
      const bestQuizScore = scores.length > 0 ? Math.max(...scores) : 0;
      const lowestQuizScore = scores.length > 0 ? Math.min(...scores) : 0;

      const scoreTrend = attempts.slice(0, 10).map((a: any) => {
        const quizObj = quizzes.find((q: any) => q.id === a.quiz_id);
        return {
          quizTitle: quizObj?.title || "Quiz",
          date: new Date(a.completed_at || a.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          score: Number(a.percentage) || 0,
        };
      });

      let scoreImprovementPct: number | null = null;
      if (attempts.length >= 2) {
        const firstScore = Number(attempts[attempts.length - 1].percentage) || 0;
        const latestScore = Number(attempts[0].percentage) || 0;
        scoreImprovementPct = Math.round(latestScore - firstScore);
      }

      // ─── 4. FLASHCARD ANALYTICS ───────────────────────────────────────────
      const cardsReviewedCount = reviews.length;
      const totalCardsCount = flashcards.length;
      const masteredCards = flashcards.filter((f: any) => (f.mastery_level || 0) >= 80).length;
      const learningCards = Math.max(0, totalCardsCount - masteredCards);

      let correctCount = 0;
      let totalCount = 0;
      flashcards.forEach((f: any) => {
        correctCount += Number(f.correct_count) || 0;
        totalCount += (Number(f.correct_count) || 0) + (Number(f.incorrect_count) || 0);
      });
      const flashcardAccuracyPct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      let againCount = 0, hardCount = 0, goodCount = 0, easyCount = 0;
      reviews.forEach((r: any) => {
        if (r.rating === "again") againCount++;
        else if (r.rating === "hard") hardCount++;
        else if (r.rating === "good") goodCount++;
        else if (r.rating === "easy") easyCount++;
      });
      const totalReviews = reviews.length || 1;
      const ratingsDistribution = {
        againPct: Math.round((againCount / totalReviews) * 100),
        hardPct: Math.round((hardCount / totalReviews) * 100),
        goodPct: Math.round((goodCount / totalReviews) * 100),
        easyPct: Math.round((easyCount / totalReviews) * 100),
      };

      // ─── 5. SUBJECT ANALYTICS ──────────────────────────────────────────────
      const subjectMap = new Map<string, { minutes: number; totalTasks: number; completedTasks: number; quizScores: number[] }>();

      const getOrCreateSubj = (name: string) => {
        const norm = name.trim() || "General Studies";
        if (!subjectMap.has(norm)) {
          subjectMap.set(norm, { minutes: 0, totalTasks: 0, completedTasks: 0, quizScores: [] });
        }
        return subjectMap.get(norm)!;
      };

      sessions.forEach((s: any) => {
        if (s.subject?.trim()) {
          const entry = getOrCreateSubj(s.subject);
          entry.minutes += Number(s.duration) || 30;
        }
      });

      tasks.forEach((t: any) => {
        if (t.subject?.trim()) {
          const entry = getOrCreateSubj(t.subject);
          entry.totalTasks++;
          if (t.completed || t.status === "completed") entry.completedTasks++;
        }
      });

      attempts.forEach((a: any) => {
        const quizObj = quizzes.find((q: any) => q.id === a.quiz_id);
        if (quizObj?.subject?.trim()) {
          const entry = getOrCreateSubj(quizObj.subject);
          entry.quizScores.push(Number(a.percentage) || 0);
        }
      });

      const subjectAnalyticsList: SubjectAnalyticsData[] = Array.from(subjectMap.entries()).map(([subj, data]) => {
        const completionRate = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
        const quizAvg = data.quizScores.length > 0 ? Math.round(data.quizScores.reduce((a, b) => a + b, 0) / data.quizScores.length) : null;

        return {
          subject: subj,
          studyMinutes: data.minutes,
          studyHoursFormatted: this.formatMinutes(data.minutes),
          totalTasks: data.totalTasks,
          completedTasks: data.completedTasks,
          completionRate,
          quizAverageScore: quizAvg,
        };
      }).sort((a, b) => b.studyMinutes - a.studyMinutes);

      // ─── 6. STREAK & PRODUCTIVITY SCORE ───────────────────────────────────
      // Calculate active days from sessions, completed tasks, quiz attempts, reviews
      const activeDateSet = new Set<string>();

      sessions.forEach((s: any) => {
        if (s.start_time || s.created_at) {
          activeDateSet.add(new Date(s.start_time || s.created_at).toISOString().split("T")[0]);
        }
      });
      completedTasksList.forEach((t: any) => {
        if (t.completed_at || t.updated_at) {
          activeDateSet.add(new Date(t.completed_at || t.updated_at).toISOString().split("T")[0]);
        }
      });
      attempts.forEach((a: any) => {
        if (a.completed_at) {
          activeDateSet.add(new Date(a.completed_at).toISOString().split("T")[0]);
        }
      });
      reviews.forEach((r: any) => {
        if (r.reviewed_at) {
          activeDateSet.add(new Date(r.reviewed_at).toISOString().split("T")[0]);
        }
      });

      // Calculate Current Streak & Longest Streak
      let currentStreak = 0;
      let checkDate = new Date(now);

      while (true) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (activeDateSet.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Allow today to be unlogged yet if yesterday was logged
          if (currentStreak === 0 && dateStr === now.toISOString().split("T")[0]) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
          break;
        }
      }

      // Compute Productivity Score (0 - 100)
      const taskScore = Math.min(40, Math.round((taskCompletionRate / 100) * 40));
      const activeDaysCount = Array.from(dailyMap.values()).filter((m) => m > 0).length;
      const consistencyPct = numDays > 0 ? (activeDaysCount / numDays) : 0;
      const consistencyScore = Math.min(25, Math.round(consistencyPct * 25));
      const quizScoreComponent = Math.min(20, Math.round((avgQuizScore / 100) * 20));
      const targetHours = range === "7d" ? 10 : range === "30d" ? 40 : 100;
      const actualHours = totalStudyMinutes / 60;
      const studyTimeScore = Math.min(15, Math.round(Math.min(1, actualHours / targetHours) * 15));

      const totalProdScore = taskScore + consistencyScore + quizScoreComponent + studyTimeScore;

      let scoreLevel: ProductivityScoreData["level"] = "Consistent";
      if (totalProdScore >= 85) scoreLevel = "Master Planner";
      else if (totalProdScore >= 70) scoreLevel = "High Achiever";
      else if (totalProdScore >= 50) scoreLevel = "Consistent";
      else scoreLevel = "Needs Focus";

      const productivityScoreData: ProductivityScoreData = {
        score: totalProdScore,
        level: scoreLevel,
        breakdown: {
          taskCompletionScore: taskScore,
          consistencyScore: consistencyScore,
          quizScore: quizScoreComponent,
          studyTimeScore: studyTimeScore,
        },
      };

      // ─── 7. DETERMINISTIC INSIGHTS ────────────────────────────────────────
      const deterministicInsights: DeterministicInsight[] = [];

      if (totalStudyMinutes > 0) {
        deterministicInsights.push({
          id: "study_time",
          category: "study",
          type: "positive",
          title: "Study Time Logged",
          description: `You've completed ${this.formatMinutes(totalStudyMinutes)} of total study time in this period.`,
        });
      }

      if (taskCompletionRate >= 75) {
        deterministicInsights.push({
          id: "task_rate_high",
          category: "tasks",
          type: "positive",
          title: "Strong Task Completion Rate",
          description: `You have completed ${taskCompletionRate}% of your tasks. Great focus!`,
        });
      } else if (overdueTasks > 0) {
        deterministicInsights.push({
          id: "tasks_overdue",
          category: "tasks",
          type: "warning",
          title: "Overdue Tasks Pending",
          description: `You have ${overdueTasks} overdue task${overdueTasks > 1 ? "s" : ""}. Consider prioritizing them in your planner.`,
        });
      }

      if (currentStreak >= 3) {
        deterministicInsights.push({
          id: "streak_active",
          category: "consistency",
          type: "positive",
          title: "Consistent Study Streak",
          description: `You're on a ${currentStreak}-day study streak! Keep up the momentum.`,
        });
      }

      if (subjectAnalyticsList.length > 0) {
        const topSubj = subjectAnalyticsList[0];
        deterministicInsights.push({
          id: "top_subject",
          category: "study",
          type: "info",
          title: `Primary Focus: ${topSubj.subject}`,
          description: `${topSubj.subject} received the highest study allocation (${topSubj.studyHoursFormatted}).`,
        });
      }

      if (attempts.length > 0 && avgQuizScore >= 80) {
        deterministicInsights.push({
          id: "quiz_high",
          category: "quizzes",
          type: "positive",
          title: "High Quiz Mastery",
          description: `Average quiz score is ${avgQuizScore}%, indicating solid mastery of your study materials.`,
        });
      }

      return {
        overview: {
          totalStudyMinutes,
          studyTimeFormatted: this.formatMinutes(totalStudyMinutes),
          tasksCompleted: completedTasks,
          totalTasks,
          completionRate: taskCompletionRate,
          currentStreakDays: currentStreak,
          longestStreakDays: Math.max(currentStreak, activeDateSet.size),
        } as AnalyticsOverviewData,
        studyTime: {
          totalMinutes: totalStudyMinutes,
          dailyActivity,
          weeklyTrends,
          peakStudyTimeFormatted,
          bestStudyDayFormatted,
        },
        taskAnalytics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
          completionRate: taskCompletionRate,
          dailyCompletionTrend: dailyActivity.map((d) => ({
            date: d.date,
            dayLabel: d.dayLabel,
            count: completedTasksList.filter(
              (t: any) => (t.completed_at || t.updated_at || "").split("T")[0] === d.date
            ).length,
          })),
        } as TaskAnalyticsData,
        subjectAnalytics: subjectAnalyticsList,
        quizAnalytics: {
          quizzesAttempted: quizAttemptsCount,
          quizzesCompleted: quizAttemptsCount,
          avgScore: avgQuizScore,
          bestScore: bestQuizScore,
          lowestScore: lowestQuizScore,
          scoreTrend,
          scoreImprovementPct,
        } as QuizAnalyticsData,
        flashcardAnalytics: {
          cardsReviewed: cardsReviewedCount,
          cardsMastered: masteredCards,
          cardsLearning: learningCards,
          totalCards: totalCardsCount,
          accuracyPct: flashcardAccuracyPct,
          ratingsDistribution,
        } as FlashcardAnalyticsData,
        productivityScore: productivityScoreData,
        insights: deterministicInsights,
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
