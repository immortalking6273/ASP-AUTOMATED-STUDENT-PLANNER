"use client";

import * as React from "react";
import Link from "next/link";
import { FilePlus, Upload, CheckSquare, Calendar, Bot, FolderPlus } from "lucide-react";
import { motion } from "framer-motion";

export const QUICK_ACTIONS = [
  {
    title: "New Note",
    description: "Create a rich note page",
    href: "/notes",
    icon: <FilePlus className="h-5 w-5 text-primary" />,
    color: "bg-primary/10 border-primary/20",
  },
  {
    title: "Upload Document",
    description: "PDF, PPT, DOCX AI upload",
    href: "/documents",
    icon: <Upload className="h-5 w-5 text-primary" />,
    color: "bg-primary/10 border-primary/20",
  },
  {
    title: "New Task",
    description: "Add study assignment",
    href: "/planner",
    icon: <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    color: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Open Calendar",
    description: "View timetable & exams",
    href: "/calendar",
    icon: <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    color: "bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "AI Assistant",
    description: "NVIDIA NIM Live Chat",
    href: "/chat",
    icon: <Bot className="h-5 w-5 text-primary" />,
    color: "bg-primary/10 border-primary/20",
    badge: "Live",
  },
  {
    title: "Create Workspace",
    description: "New subject container",
    href: "/workspace",
    icon: <FolderPlus className="h-5 w-5 text-primary" />,
    color: "bg-primary/10 border-primary/20",
  },
];

export const QuickActionsGrid: React.FC = () => {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_ACTIONS.map((action, idx) => (
          <Link key={idx} href={action.href}>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ duration: 0.15 }}
              className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-4 h-full shadow-xs hover:border-primary/30 hover:shadow-md transition-all group"
            >
              {action.badge && (
                <span className="absolute top-2 right-2 text-[9px] font-bold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full">
                  {action.badge}
                </span>
              )}
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border mb-3 ${action.color}`}>
                {action.icon}
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block">
                  {action.title}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight line-clamp-1 block mt-0.5">
                  {action.description}
                </span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};
