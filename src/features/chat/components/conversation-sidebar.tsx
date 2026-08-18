"use client";

import * as React from "react";
import { ConversationItem } from "../types";
import { Plus, Search, MessageSquare, Trash2, Edit2, Check, X, Bot, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationSidebarProps {
  conversations: ConversationItem[];
  activeId: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function ConversationSidebar({
  conversations,
  activeId,
  searchQuery,
  onSearchChange,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  className,
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitleText, setEditTitleText] = React.useState("");

  const handleStartRename = (conv: ConversationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitleText(conv.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitleText.trim()) {
      onRename(id, editTitleText.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className={cn("flex flex-col h-full border-r border-border/70 bg-card/60 backdrop-blur-md p-3 space-y-3 w-72 shrink-0", className)}>
      {/* New Chat Button */}
      <button
        type="button"
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        <span>New AI Chat</span>
      </button>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search chat history..."
          className="w-full rounded-xl border border-border/80 bg-background pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Conversation History List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Recent Conversations ({conversations.length})
        </h4>

        {conversations.length === 0 ? (
          <div className="text-center py-8 px-2 space-y-1">
            <MessageSquare className="h-6 w-6 text-muted-foreground/40 mx-auto" />
            <p className="text-xs text-muted-foreground">No conversations yet.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-all border",
                  isActive
                    ? "border-primary/40 bg-primary/10 font-bold text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {isEditing ? (
                  <form onSubmit={(e) => handleSaveRename(conv.id, e)} className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      autoFocus
                      className="w-full rounded bg-background px-1.5 py-0.5 text-xs border border-primary focus:outline-none"
                    />
                    <button type="submit" className="p-0.5 text-emerald-500 hover:bg-emerald-500/10 rounded">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="p-0.5 text-destructive hover:bg-destructive/10 rounded">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    {/* Action Hover Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(conv, e)}
                        className="p-1 hover:text-primary transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        className="p-1 hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
