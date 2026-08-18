"use client";

import * as React from "react";
import {
  useSettings,
  ProfileSettingsCard,
  AccountSettingsCard,
} from "@/features/settings";
import { User as UserIcon, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const {
    user,
    profile,
    isLoading,
    isSaving,
    isUploadingAvatar,
    updateProfile,
    uploadAvatar,
  } = useSettings();

  return (
    <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
      {/* PAGE HEADER */}
      <div className="border-b border-border/60 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary">
            <UserIcon className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Student Profile</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          View and edit your ASP student profile, avatar, and account identity.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading profile...
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-200">
          <ProfileSettingsCard
            profile={profile}
            userEmail={user?.email}
            isSaving={isSaving}
            isUploadingAvatar={isUploadingAvatar}
            onUpdateProfile={updateProfile}
            onUploadAvatar={uploadAvatar}
          />

          <div className="pt-4 border-t border-border">
            <AccountSettingsCard
              profile={profile}
              userEmail={user?.email}
              createdAt={user?.created_at}
            />
          </div>
        </div>
      )}
    </div>
  );
}
