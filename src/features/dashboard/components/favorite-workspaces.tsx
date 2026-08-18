"use client";

import * as React from "react";
import { WorkspaceRow } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FolderKanban, ArrowUpRight, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface FavoriteWorkspacesProps {
  workspaces?: WorkspaceRow[];
}

export const FavoriteWorkspaces: React.FC<FavoriteWorkspacesProps> = ({
  workspaces = [],
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-bold">Recent Workspaces</CardTitle>
        <Link href="/workspace" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
          <span>All Workspaces</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 border border-dashed rounded-xl bg-muted/20">
            <FolderKanban className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-xs font-medium text-foreground">No Workspaces Created Yet</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Organize your subjects into dedicated study workspaces.
            </p>
            <Link href="/workspace" className="pt-2">
              <Button size="sm" variant="outline" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                Create Workspace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workspaces.slice(0, 4).map((ws) => (
              <Link
                key={ws.id}
                href={`/workspace?id=${ws.id}`}
                className="flex items-center justify-between p-3 rounded-xl border bg-card/60 hover:bg-accent/40 transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs"
                    style={{ backgroundColor: ws.color || "#6366f1" }}
                  >
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden space-y-0.5">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate block">
                      {ws.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      Updated {formatDate(ws.updated_at)}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
