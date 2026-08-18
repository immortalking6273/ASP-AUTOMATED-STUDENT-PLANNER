"use client";

import * as React from "react";
import { SettingsTab } from "../types";
import {
  User,
  Shield,
  Palette,
  Bot,
  Bell,
  GraduationCap,
  FolderKanban,
  Eye,
  Key,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "account", label: "Account", icon: <Shield className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
    { id: "ai", label: "AI Preferences", icon: <Bot className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "study", label: "Study Preferences", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "workspace", label: "Workspace", icon: <FolderKanban className="h-4 w-4" /> },
    { id: "privacy", label: "Privacy", icon: <Eye className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Key className="h-4 w-4" /> },
    { id: "data", label: "Data Management", icon: <HardDrive className="h-4 w-4" /> },
  ];

  return (
    <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap text-left",
              isActive
                ? "bg-primary/15 text-primary font-extrabold border-l-2 border-primary shadow-2xs"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <span className={cn(isActive ? "text-primary" : "text-muted-foreground")}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
