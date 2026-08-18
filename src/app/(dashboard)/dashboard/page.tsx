"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  useDashboardData,
  GreetingSection,
  StatCard,
  QuickActionsGrid,
  RecentActivity,
  UpcomingDeadlines,
  StudyProgressCard,
  CalendarPreview,
  AIInsightsCard,
  FavoriteWorkspaces,
  ProfileSummaryWidget,
  LoadingDashboard,
  EmptyDashboard,
} from "@/features/dashboard";

import {
  FolderKanban,
  CheckSquare,
  Clock,
  Files,
  FileText,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function DashboardPage() {
  const {
    profile,
    workspaces,
    recentTasks,
    recentDocuments,
    stats,
    isLoading,
    error,
    refresh,
    isEmpty,
  } = useDashboardData();

  if (isLoading) {
    return <LoadingDashboard />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h3 className="text-base font-bold text-foreground">Failed to Load Dashboard</h3>
        <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={refresh} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Retry Data Fetch
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyDashboard />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-16 md:pb-6"
    >
      {/* Personalized Greeting Header */}
      <motion.div variants={itemVariants}>
        <GreetingSection
          userName={profile?.fullName || "Student"}
          streakCount={stats.studyStreakDays}
          todayStudyMinutes={stats.todayStudyMinutes}
          dailyGoalMinutes={stats.dailyGoalMinutes}
        />
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div variants={itemVariants}>
        <QuickActionsGrid />
      </motion.div>

      {/* Primary Statistics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workspaces"
          value={stats.totalWorkspaces}
          subtitle="Organized subject containers"
          icon={<FolderKanban className="h-4 w-4" />}
          color="purple"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlinesCount}
          subtitle="Assignments due this week"
          icon={<CheckSquare className="h-4 w-4" />}
          color="rose"
        />
        <StatCard
          title="Study Hours"
          value={`${stats.studyHoursThisWeek} hrs`}
          subtitle="Logged study time this week"
          icon={<Clock className="h-4 w-4" />}
          color="emerald"
        />
        <StatCard
          title="Documents & Notes"
          value={stats.documentsUploaded + stats.notesCreated}
          subtitle={`${stats.documentsUploaded} PDFs/PPTs, ${stats.notesCreated} Notes`}
          icon={<Files className="h-4 w-4" />}
          color="purple"
        />
      </motion.div>

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <UpcomingDeadlines tasks={recentTasks} />

          {/* Recent Documents Widget */}
          {recentDocuments.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Recent Documents</span>
                </div>
                <Link
                  href="/documents"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors"
                >
                  <span>View Library</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href="/documents"
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-border bg-secondary/40 hover:bg-secondary transition-colors group"
                  >
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <div className="truncate min-w-0">
                      <div className="text-xs font-semibold text-foreground group-hover:text-primary truncate transition-colors">
                        {doc.display_name || doc.original_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <FavoriteWorkspaces workspaces={workspaces} />
          <RecentActivity />
        </motion.div>

        {/* Right 1 Column */}
        <motion.div variants={itemVariants} className="space-y-6">
          <ProfileSummaryWidget profile={profile} totalWorkspaces={stats.totalWorkspaces} />
          <StudyProgressCard
            hoursThisWeek={stats.studyHoursThisWeek}
            weeklyDayData={stats.weeklyDayData}
          />
          <CalendarPreview />
          <AIInsightsCard />
        </motion.div>
      </div>
    </motion.div>
  );
}
