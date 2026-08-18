"use client";

import * as React from "react";
import {
  useSettings,
  SettingsNav,
  ProfileSettingsCard,
  AccountSettingsCard,
  AppearanceSettingsCard,
  AiSettingsCard,
  NotificationsSettingsCard,
  StudySettingsCard,
  WorkspaceSettingsCard,
  PrivacySettingsCard,
  SecuritySettingsCard,
  DataSettingsCard,
} from "@/features/settings";
import { Settings as SettingsIcon, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const {
    user,
    profile,
    preferences,
    activeTab,
    setActiveTab,
    isLoading,
    isSaving,
    isUploadingAvatar,
    updateProfile,
    uploadAvatar,
    updatePreferences,
    resetPreferences,
    changePassword,
    exportData,
    deleteAccount,
  } = useSettings();

  return (
    <div className="flex-1 space-y-6 p-6 max-w-6xl mx-auto">
      {/* PAGE HEADER */}
      <div className="border-b border-border/60 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Settings</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your ASP account, preferences and application experience.
        </p>
      </div>

      {/* TWO COLUMN / RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* SIDEBAR NAVIGATION */}
        <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-4">
          <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* CONTENT AREA */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading settings...
            </div>
          ) : (
            <div className="animate-in fade-in duration-200">
              {activeTab === "profile" && (
                <ProfileSettingsCard
                  profile={profile}
                  userEmail={user?.email}
                  isSaving={isSaving}
                  isUploadingAvatar={isUploadingAvatar}
                  onUpdateProfile={updateProfile}
                  onUploadAvatar={uploadAvatar}
                />
              )}

              {activeTab === "account" && (
                <AccountSettingsCard
                  profile={profile}
                  userEmail={user?.email}
                  createdAt={user?.created_at}
                />
              )}

              {activeTab === "appearance" && (
                <AppearanceSettingsCard
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                />
              )}

              {activeTab === "ai" && (
                <AiSettingsCard
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                />
              )}

              {activeTab === "notifications" && <NotificationsSettingsCard />}

              {activeTab === "study" && (
                <StudySettingsCard
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                />
              )}

              {activeTab === "workspace" && (
                <WorkspaceSettingsCard
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                />
              )}

              {activeTab === "privacy" && (
                <PrivacySettingsCard
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                />
              )}

              {activeTab === "security" && (
                <SecuritySettingsCard
                  isSaving={isSaving}
                  onChangePassword={changePassword}
                />
              )}

              {activeTab === "data" && (
                <DataSettingsCard
                  isSaving={isSaving}
                  onExportData={exportData}
                  onResetPreferences={resetPreferences}
                  onDeleteAccount={deleteAccount}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
