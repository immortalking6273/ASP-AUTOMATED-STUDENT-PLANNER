"use client";

import * as React from "react";
import { UserPreferencesRow } from "../types";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
import { useAuth } from "@/hooks/use-auth";
import { FolderKanban, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceSettingsCardProps {
  preferences: UserPreferencesRow | null;
  onUpdatePreferences: (patch: Partial<UserPreferencesRow>) => Promise<void>;
}

export function WorkspaceSettingsCard({
  preferences,
  onUpdatePreferences,
}: WorkspaceSettingsCardProps) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);

  React.useEffect(() => {
    if (!user) return;
    WorkspacesService.getWorkspaces(user.id)
      .then((res) => setWorkspaces(res.data || []))
      .catch(console.error);
  }, [user]);

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-black tracking-tight text-foreground">Workspace Preferences</h2>
        <p className="text-xs text-muted-foreground">
          Manage your default active workspace and workspace organization.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-foreground">Default Startup Workspace</label>
        {workspaces.length > 0 ? (
          <div className="space-y-2">
            {workspaces.map((ws) => {
              const isSelected = preferences?.default_workspace_id === ws.id;
              return (
                <div
                  key={ws.id}
                  onClick={() => onUpdatePreferences({ default_workspace_id: ws.id })}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/80 bg-card/60 hover:bg-accent/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background border border-border text-primary">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{ws.title}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {ws.description || "Academic Workspace"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border flex items-center justify-center shrink-0",
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No active workspaces found.</p>
        )}
      </div>
    </div>
  );
}
