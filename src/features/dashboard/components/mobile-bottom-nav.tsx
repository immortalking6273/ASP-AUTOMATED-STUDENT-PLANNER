"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, FileText, Calendar, User } from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { title: "Home", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Workspace", href: "/workspace", icon: <FolderKanban className="h-5 w-5" /> },
    { title: "Notes", href: "/notes", icon: <FileText className="h-5 w-5" /> },
    { title: "Calendar", href: "/calendar", icon: <Calendar className="h-5 w-5" /> },
    { title: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-border bg-card/90 px-2 md:hidden backdrop-blur-md">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors py-1 px-3 rounded-lg",
              isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};
