"use client";

import * as React from "react";
import { Menu, Bell, Cpu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchBox } from "@/components/ui/search-box";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/features/authentication/components/user-menu";

import { NotificationCenter } from "@/features/notifications";

export interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 md:px-6 backdrop-blur-xl transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block w-72">
          <SearchBox placeholder="Search workspace, documents, notes..." />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden lg:inline-flex items-center gap-1.5 text-[11px] py-1 px-3 rounded-full border-primary/25 bg-primary/10 text-primary font-semibold">
          <Cpu className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>NVIDIA NIM Engine</span>
        </Badge>

        <NotificationCenter />

        <ThemeToggle />

        <div className="h-4 w-[1px] bg-border mx-1" />

        <UserMenu />
      </div>
    </header>
  );
};
