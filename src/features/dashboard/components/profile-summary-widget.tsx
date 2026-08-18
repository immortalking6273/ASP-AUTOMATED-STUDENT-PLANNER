"use client";

import * as React from "react";
import { UserProfile } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, FolderKanban, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface ProfileSummaryWidgetProps {
  profile?: UserProfile | null;
  totalWorkspaces?: number;
}

export const ProfileSummaryWidget: React.FC<ProfileSummaryWidgetProps> = ({
  profile,
  totalWorkspaces = 0,
}) => {
  if (!profile) return null;

  return (
    <Card className="h-full">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar src={profile.avatarUrl} name={profile.fullName} size="lg" />
          <div className="overflow-hidden space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground truncate">{profile.fullName}</h3>
              {profile.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            <Badge variant="secondary" className="text-[10px] py-0 px-2 mt-1">
              Undergraduate Student
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5">
            <FolderKanban className="h-4 w-4 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-medium">Workspaces</span>
              <span className="font-bold text-foreground">{totalWorkspaces} Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-medium">Member Since</span>
              <span className="font-bold text-foreground">{formatDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
