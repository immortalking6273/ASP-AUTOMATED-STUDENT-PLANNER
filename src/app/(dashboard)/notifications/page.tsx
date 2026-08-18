"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
import {
  useNotifications,
  NotificationCategory,
  NotificationItem,
  NotificationPreferencesDialog,
} from "@/features/notifications";
import {
  Bell,
  CheckCheck,
  Trash2,
  Sliders,
  RefreshCw,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);

  const [prefsDialogOpen, setPrefsDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAiTriggering, setIsAiTriggering] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    WorkspacesService.getWorkspaces(user.id)
      .then((res) => {
        const list = res.data || [];
        setWorkspaces(list);
        if (list.length > 0) {
          setSelectedWorkspaceId(list[0].id);
        }
      })
      .catch(console.error);
  }, [user]);

  const notificationsState = useNotifications(selectedWorkspaceId);

  const categories: Array<{ id: NotificationCategory; label: string }> = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "task_due", label: "Tasks" },
    { id: "task_overdue", label: "Overdue" },
    { id: "study_session", label: "Study Sessions" },
    { id: "quiz_reminder", label: "Quizzes" },
    { id: "flashcard_review", label: "Flashcards" },
    { id: "ai_reminder", label: "AI Alerts" },
  ];

  // Filter items by search query
  const filteredItems = React.useMemo(() => {
    return notificationsState.notifications.filter((n) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = n.title.toLowerCase().includes(q);
        const mMsg = n.message.toLowerCase().includes(q);
        if (!mTitle && !mMsg) return false;
      }
      return true;
    });
  }, [notificationsState.notifications, searchQuery]);

  // Group notifications into Today, Yesterday, Earlier
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const todayItems: typeof filteredItems = [];
  const yesterdayItems: typeof filteredItems = [];
  const earlierItems: typeof filteredItems = [];

  filteredItems.forEach((n) => {
    const nDate = new Date(n.created_at).toISOString().split("T")[0];
    if (nDate === todayStr) todayItems.push(n);
    else if (nDate === yesterdayStr) yesterdayItems.push(n);
    else earlierItems.push(n);
  });

  const handleGenerateAiAlert = async () => {
    setIsAiTriggering(true);
    try {
      const res = await fetch("/api/notifications/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: selectedWorkspaceId }),
      });
      const data = await res.json();
      if (data.success) {
        await notificationsState.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiTriggering(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Notifications & Reminders</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Stay informed about upcoming deadlines, overdue tasks, study sessions, and AI alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Workspace Selector */}
          {workspaces.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-semibold text-muted-foreground">Workspace:</span>
              <select
                value={selectedWorkspaceId || ""}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateAiAlert}
            disabled={isAiTriggering}
            className="gap-1.5 text-xs font-bold border-violet-500/30 text-violet-300 hover:bg-violet-500/10 cursor-pointer"
          >
            {isAiTriggering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-violet-400" />}
            AI Workload Check
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setPrefsDialogOpen(true)}
            className="gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5" />
            Preferences
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={notificationsState.refresh}
            className="p-2 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Refresh notifications"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* TOOLBAR & FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="pl-9 text-xs"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {notificationsState.unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={notificationsState.markAllAsRead}
              className="gap-1.5 text-xs font-bold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark All Read
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={notificationsState.clearReadNotifications}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Read
          </Button>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => notificationsState.setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              notificationsState.categoryFilter === cat.id
                ? "border-primary bg-primary/15 text-primary shadow-xs"
                : "border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-6">
        {notificationsState.isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications...
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-6">
            {/* TODAY */}
            {todayItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                  Today ({todayItems.length})
                </h3>
                <div className="space-y-2">
                  {todayItems.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={notificationsState.markAsRead}
                      onDelete={notificationsState.deleteNotification}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* YESTERDAY */}
            {yesterdayItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                  Yesterday ({yesterdayItems.length})
                </h3>
                <div className="space-y-2">
                  {yesterdayItems.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={notificationsState.markAsRead}
                      onDelete={notificationsState.deleteNotification}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* EARLIER */}
            {earlierItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                  Earlier ({earlierItems.length})
                </h3>
                <div className="space-y-2">
                  {earlierItems.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={notificationsState.markAsRead}
                      onDelete={notificationsState.deleteNotification}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
              <Bell className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <h3 className="text-sm font-bold text-foreground">You're all caught up</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Important updates, task deadlines, study reminders, and AI alerts will appear here.
            </p>
          </div>
        )}
      </div>

      {/* PREFERENCES DIALOG */}
      <NotificationPreferencesDialog
        open={prefsDialogOpen}
        preferences={notificationsState.preferences}
        onClose={() => setPrefsDialogOpen(false)}
        onUpdate={notificationsState.updatePreferences}
      />
    </div>
  );
}
