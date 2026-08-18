import {
  TimeRangeOption,
  AnalyticsOverviewData,
  DailyStudyActivity,
  WeeklyStudyTrend,
  TaskAnalyticsData,
  SubjectAnalyticsData,
  QuizAnalyticsData,
  FlashcardAnalyticsData,
  ProductivityScoreData,
  DeterministicInsight,
} from "@/services/db/analytics-service";

export type {
  TimeRangeOption,
  AnalyticsOverviewData,
  DailyStudyActivity,
  WeeklyStudyTrend,
  TaskAnalyticsData,
  SubjectAnalyticsData,
  QuizAnalyticsData,
  FlashcardAnalyticsData,
  ProductivityScoreData,
  DeterministicInsight,
};

export interface AIInsightResult {
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
}
