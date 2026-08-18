"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";

export const UserMenu: React.FC = () => {
  const { profile, logout } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="text-xs font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  const dropdownItems = [
    {
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      onClick: () => {},
    },
    {
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      onClick: () => {},
    },
    {
      label: "Help & FAQ",
      icon: <HelpCircle className="h-4 w-4" />,
      onClick: () => {},
    },
    {
      label: "Log Out",
      icon: <LogOut className="h-4 w-4" />,
      destructive: true,
      onClick: async () => {
        await logout();
      },
    },
  ];

  return (
    <Dropdown
      align="right"
      trigger={
        <div className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer select-none">
          <Avatar src={profile.avatarUrl} name={profile.fullName} size="sm" />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[120px]">
              {profile.fullName}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {profile.email}
            </span>
          </div>
        </div>
      }
      items={dropdownItems}
    />
  );
};
