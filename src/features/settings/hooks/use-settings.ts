"use client";

import * as React from "react";
import { UserPreferencesRow, UserProfile, SettingsTab } from "../types";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/toast";

export function useSettings() {
  const { user, profile, refreshSession } = useAuth();
  const [preferences, setPreferences] = React.useState<UserPreferencesRow | null>(null);
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  const loadPreferences = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/preferences");
      const data = await res.json();
      if (res.ok) setPreferences(data);
    } catch (err) {
      console.error("[useSettings] loadPreferences error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updateProfile = async (fullName: string, bio?: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, bio }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update profile.");
        return false;
      }

      await refreshSession();
      toast.success("Profile updated successfully!");
      return true;
    } catch (err) {
      toast.error("Failed to update profile.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Unable to update profile picture.");
        return false;
      }

      await refreshSession();
      toast.success("Profile picture updated!");
      return true;
    } catch (err) {
      toast.error("Unable to update profile picture.");
      return false;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const updatePreferences = async (patch: Partial<UserPreferencesRow>) => {
    setPreferences((prev) => (prev ? { ...prev, ...patch } : null));

    try {
      const res = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();

      if (res.ok) {
        setPreferences(data);
        toast.success("Settings saved");
      } else {
        toast.error(data.error || "Failed to save settings.");
      }
    } catch (err) {
      toast.error("Failed to save settings.");
    }
  };

  const resetPreferences = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/preferences", { method: "PUT" });
      const data = await res.json();

      if (res.ok) {
        setPreferences(data);
        toast.success("Preferences reset to defaults.");
      } else {
        toast.error("Failed to reset preferences.");
      }
    } catch (err) {
      toast.error("Failed to reset preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async (newPassword: string, confirmPassword: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update password.");
        return false;
      }

      toast.success("Password updated successfully.");
      return true;
    } catch (err) {
      toast.error("Failed to update password.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = () => {
    window.open("/api/settings/export", "_blank");
    toast.info("Downloading data export...");
  };

  const deleteAccount = async (confirmation: string) => {
    if (confirmation !== "DELETE") {
      toast.error("You must type 'DELETE' to confirm account deletion.");
      return false;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete account.");
        return false;
      }

      toast.success("Account deleted. Redirecting...");
      window.location.href = "/login?switch=true";
      return true;
    } catch (err) {
      toast.error("Failed to delete account.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
  };
}
