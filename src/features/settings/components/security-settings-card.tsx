"use client";

import * as React from "react";
import { Key, Lock, LogOut, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

interface SecuritySettingsCardProps {
  isSaving: boolean;
  onChangePassword: (newPass: string, confirmPass: string) => Promise<boolean>;
}

export function SecuritySettingsCard({
  isSaving,
  onChangePassword,
}: SecuritySettingsCardProps) {
  const { logout } = useAuth();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onChangePassword(newPassword, confirmPassword);
    if (success) {
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-black tracking-tight text-foreground">Security Settings</h2>
        <p className="text-xs text-muted-foreground">
          Update account password and manage active authentication sessions.
        </p>
      </div>

      {/* CHANGE PASSWORD */}
      <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-2xl border border-border/80 bg-card/60">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-black text-foreground">Change Account Password</h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">New Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Confirm New Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            minLength={6}
            className="text-xs"
          />
        </div>

        <Button
          type="submit"
          disabled={isSaving || !newPassword}
          size="sm"
          className="gap-1.5 font-extrabold cursor-pointer mt-2"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
          Update Password
        </Button>
      </form>

      {/* SESSION MANAGEMENT */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60">
        <div>
          <h4 className="text-xs font-bold text-foreground">Current Active Session</h4>
          <p className="text-[11px] text-muted-foreground">Signed in on this device</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
