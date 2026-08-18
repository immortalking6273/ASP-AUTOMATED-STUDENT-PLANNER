"use client";

import * as React from "react";
import {
  GraduationCap,
  Sparkles,
  FileText,
  CalendarDays,
  Bot,
  Layers,
  HelpCircle,
  CheckCircle2,
  Brain,
  BookOpen,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export const AuthBrandPanel: React.FC = () => {
  return (
    <div className="relative flex flex-col justify-between h-full p-8 lg:p-12 overflow-hidden bg-gradient-to-br from-indigo-900/90 via-slate-900 to-blue-950 text-white rounded-3xl border border-indigo-500/20 shadow-2xl">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight">{siteConfig.shortName}</h2>
            <span className="text-[11px] text-indigo-200 font-medium">Automated Student Planner</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Study Smarter. <br />
            Plan Better. <br />
            <span className="bg-gradient-to-r from-indigo-300 via-blue-200 to-teal-200 bg-clip-text text-transparent">
              Achieve More.
            </span>
          </h1>
          <p className="text-xs lg:text-sm text-indigo-200/90 max-w-md leading-relaxed">
            Your all-in-one AI study platform designed for university students to master courses, schedule assignments, and generate smart study materials.
          </p>
        </div>
      </div>

      {/* Interactive Glassmorphic AI Illustration Card */}
      <div className="relative z-10 my-8">
        <div className="relative mx-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 shadow-2xl overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[11px] font-semibold text-indigo-200">AI Student Assistant</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
              <Sparkles className="h-3 w-3 animate-pulse text-amber-300" /> Live AI Engine
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-indigo-500/30 text-indigo-200 shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-white">Study Recommendation</div>
                <div className="text-[11px] text-indigo-200/90">
                  &quot;You have a CS101 exam in 3 days. Would you like a 20-card flashcard review?&quot;
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <BookOpen className="h-4 w-4 text-cyan-300" />
                <div>
                  <div className="font-semibold text-white">4 Active Subjects</div>
                  <div className="text-[10px] text-indigo-300">CS, Physics, Math</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <div>
                  <div className="font-semibold text-white">92% Goal Met</div>
                  <div className="text-[10px] text-indigo-300">5-day study streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-100 bg-white/5 p-2 rounded-xl border border-white/10">
          <Bot className="h-4 w-4 text-indigo-300" />
          <span>AI Study Assistant</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-100 bg-white/5 p-2 rounded-xl border border-white/10">
          <FileText className="h-4 w-4 text-blue-300" />
          <span>Smart Notes</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-100 bg-white/5 p-2 rounded-xl border border-white/10">
          <CalendarDays className="h-4 w-4 text-teal-300" />
          <span>Planner</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-100 bg-white/5 p-2 rounded-xl border border-white/10">
          <BookOpen className="h-4 w-4 text-cyan-300" />
          <span>Document Chat</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-100 bg-white/5 p-2 rounded-xl border border-white/10">
          <Layers className="h-4 w-4 text-amber-300" />
          <span>Flashcards</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-100 bg-white/5 p-2 rounded-xl border border-white/10">
          <HelpCircle className="h-4 w-4 text-rose-300" />
          <span>Quizzes</span>
        </div>
      </div>
    </div>
  );
};
