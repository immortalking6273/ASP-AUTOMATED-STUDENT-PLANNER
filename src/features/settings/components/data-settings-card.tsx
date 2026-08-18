"use client";

import * as React from "react";
import { Download, Trash2, RotateCcw, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataSettingsCardProps {
  isSaving: boolean;
  onExportData: () => void;
  onResetPreferences: () => Promise<void>;
  onDeleteAccount: (confirmation: string) => Promise<boolean>;
}

export function DataSettingsCard({
  isSaving,
  onExportData,
  onResetPreferences,
  onDeleteAccount,
}: DataSettingsCardProps) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [resetModalOpen, setResetModalOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onDeleteAccount(confirmText);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-black tracking-tight text-foreground">Data & Account Management</h2>
        <p className="text-xs text-muted-foreground">
          Export your ASP study data, reset app preferences, or permanently delete your account.
        </p>
      </div>

      {/* EXPORT DATA */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60">
        <div>
          <h4 className="text-xs font-bold text-foreground">Export All Student Data</h4>
          <p className="text-[11px] text-muted-foreground">
            Download a full JSON archive of your notebooks, tasks, flashcards, quizzes, and preferences.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onExportData}
          className="gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" /> Export JSON
        </Button>
      </div>

      {/* RESET PREFERENCES */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60">
        <div>
          <h4 className="text-xs font-bold text-foreground">Reset Preferences to Defaults</h4>
          <p className="text-[11px] text-muted-foreground">
            Resets AI style, notifications, study goals, and display preferences back to defaults.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setResetModalOpen(true)}
          className="gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Preferences
        </Button>
      </div>

      {/* DANGEROUS AREA: DELETE ACCOUNT */}
      <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/10 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h4 className="text-xs font-black text-red-400">Danger Zone</h4>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Permanently delete your ASP account, profile data, and personal workspace preferences. This operation cannot be undone.
        </p>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setDeleteModalOpen(true)}
          className="gap-1.5 text-xs font-extrabold cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete My Account
        </Button>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-foreground">Reset Preferences?</h3>
            <p className="text-xs text-muted-foreground">
              This will restore all AI, appearance, notification, and study preferences to defaults. Your notes, flashcards, and tasks will NOT be affected.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setResetModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onResetPreferences();
                  setResetModalOpen(false);
                }}
                disabled={isSaving}
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-red-500/40 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-red-400 font-black text-sm">
                <AlertTriangle className="h-5 w-5" />
                Delete Account Confirmation
              </div>
              <button onClick={() => setDeleteModalOpen(false)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              This action is permanent and irreversible. To confirm deletion, type <strong className="text-foreground">DELETE</strong> in the box below:
            </p>

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="text-xs border-red-500/50"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="destructive"
                  disabled={confirmText !== "DELETE" || isSaving}
                  className="gap-1.5 font-extrabold cursor-pointer"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Permanently Delete Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
