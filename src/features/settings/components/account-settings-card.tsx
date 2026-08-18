"use client";

import * as React from "react";
import { UserProfile, ProfileRow } from "../types";
import { ShieldCheck, Mail, Calendar, CheckCircle2 } from "lucide-react";

interface AccountSettingsCardProps {
  profile: (UserProfile | ProfileRow) | null;
  userEmail?: string;
  createdAt?: string;
}

export function AccountSettingsCard({ profile, userEmail, createdAt }: AccountSettingsCardProps) {
  const getEmail = () => {
    if (profile && "email" in profile && profile.email) return profile.email;
    return userEmail || "Student User";
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Active Member";

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-black tracking-tight text-foreground">Account Settings</h2>
        <p className="text-xs text-muted-foreground">
          View your account verification status, security parameters, and authentication credentials.
        </p>
      </div>

      <div className="space-y-4">
        {/* Email details */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Authenticated Email</h4>
              <p className="text-xs text-muted-foreground">{getEmail()}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        </div>

        {/* Account creation date */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Account Member Since</h4>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Auth provider */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Authentication Provider</h4>
              <p className="text-xs text-muted-foreground">Supabase Authentication (OAuth / Password)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
