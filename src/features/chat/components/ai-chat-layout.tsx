"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db/workspaces-service";
import { WorkspaceRow } from "@/types/database";
import { useAIChat } from "../hooks/use-ai-chat";
import { ConversationSidebar } from "./conversation-sidebar";
import { ChatWindow } from "./chat-window";
import { ActiveSourcesPanel } from "./active-sources-panel";
import { ExportDialog } from "./export-dialog";
import { ConversationSettings } from "./conversation-settings";

export function AIChatLayout() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);

  // Dialog & Developer State (Default: false / Hidden debug panel)
  const [isSourcesPanelOpen, setIsSourcesPanelOpen] = React.useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = React.useState(false);

  // Load Workspaces
  React.useEffect(() => {
    if (user) {
      WorkspacesService.getWorkspaces(user.id).then((res) => {
        setWorkspaces(res.data);
        if (res.data.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(res.data[0].id);
        }
      });
    }
  }, [user]);

  // Connect Central AI Chat Hook
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sourceScope,
    responseMode,
    updateResponseMode,
    isStreaming,
    streamingText,
    streamingCitations,
    searchQuery,
    setSearchQuery,
    startNewConversation,
    sendMessage,
    stopGeneration,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    updateSourceScope,
    handleFeedback,
    handleBookmark,
    handleRegenerate,
  } = useAIChat(selectedWorkspaceId);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Suggested Prompts
  const suggestions = [
    "Summarize the key concepts in my uploaded documents",
    "What are the main topics covered in this workspace?",
    "Explain Java packages and compare them with Python modules",
    "Generate a study outline from my uploaded notes",
  ];

  const clearMessages = () => {
    if (activeConversationId) {
      deleteConversation(activeConversationId);
    }
  };

  const exportConversation = (format: "markdown" | "txt" | "json") => {
    if (messages.length === 0) return;

    let content = "";
    const title = activeConversation?.title || "ASP_Chat_Export";

    if (format === "markdown") {
      content = `# ${title}\n\n` + messages.map((m) => `### ${m.role === "user" ? "User" : "ASP AI"}\n${m.content}\n`).join("\n---\n\n");
    } else if (format === "txt") {
      content = messages.map((m) => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n\n");
    } else {
      content = JSON.stringify({ title, messages }, null, 2);
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.${format === "markdown" ? "md" : format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={(id: string) => {
          setActiveConversationId(id);
          setIsMobileSidebarOpen(false);
        }}
        onNewChat={() => startNewConversation()}
        onRename={renameConversation}
        onDelete={deleteConversation}
      />

      {/* Main Chat Interface Window */}
      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        sourceScope={sourceScope}
        isStreaming={isStreaming}
        streamingText={streamingText}
        streamingCitations={streamingCitations}
        suggestions={suggestions}
        isDeveloperMode={isDeveloperMode}
        onSendMessage={sendMessage}
        onStopGeneration={stopGeneration}
        onRegenerate={handleRegenerate}
        onOpenSources={() => setIsSourcesPanelOpen(true)}
        onOpenExport={() => setIsExportDialogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearMessages={clearMessages}
        onFeedback={handleFeedback}
        onBookmark={handleBookmark}
        onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
      />

      {/* Dialog Modals */}
      <ActiveSourcesPanel
        isOpen={isSourcesPanelOpen}
        workspaceId={selectedWorkspaceId}
        currentScope={sourceScope}
        onClose={() => setIsSourcesPanelOpen(false)}
        onApplyScope={updateSourceScope}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={exportConversation}
      />

      <ConversationSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        responseMode={responseMode}
        onResponseModeChange={updateResponseMode}
        isDeveloperMode={isDeveloperMode}
        onToggleDeveloperMode={setIsDeveloperMode}
      />
    </div>
  );
}
