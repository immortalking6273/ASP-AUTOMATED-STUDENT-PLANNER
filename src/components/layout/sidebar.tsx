"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SIDEBAR_NAVIGATION } from "@/constants/navigation";
import { siteConfig } from "@/config/site";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Files,
  Bot,
  Layers,
  HelpCircle,
  CalendarDays,
  Calendar,
  CheckSquare,
  BarChart3,
  Settings,
  User,
  GraduationCap,
  X,
  LogOut,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  FolderKanban: <FolderKanban className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Files: <Files className="h-4 w-4" />,
  Bot: <Bot className="h-4 w-4" />,
  Layers: <Layers className="h-4 w-4" />,
  HelpCircle: <HelpCircle className="h-4 w-4" />,
  CalendarDays: <CalendarDays className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  CheckSquare: <CheckSquare className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
};

export interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  const sidebarContent = (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card text-card-foreground backdrop-blur-xl transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm text-foreground">
                {siteConfig.shortName}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase rounded-full bg-primary/10 text-primary border border-primary/25">
                AI
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Academic Workspace</span>
          </div>
        </Link>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-accent cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {SIDEBAR_NAVIGATION.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              {section.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium cursor-pointer transition-all duration-200 group relative",
                      isActive
                        ? "bg-primary/12 text-primary font-semibold border-l-2 border-primary shadow-2xs"
                        : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-primary" : "group-hover:text-foreground"
                      )}
                    >
                      {ICON_MAP[item.iconName]}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-3.5 border-t border-border bg-popover/40">
        {profile ? (
          <div className="flex items-center justify-between rounded-xl bg-popover border border-border p-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar src={profile.avatarUrl} name={profile.fullName} size="sm" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold truncate text-foreground">
                  {profile.fullName}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {profile.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Log Out"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 z-30 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={onMobileClose} />
          <div className="relative z-50 flex h-full w-64 flex-col bg-card shadow-2xl animate-fadeIn">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
