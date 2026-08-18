"use client";

import * as React from "react";
import { UserProfile, ProfileRow } from "../types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, User, Loader2, Save } from "lucide-react";

interface ProfileSettingsCardProps {
  profile: (UserProfile | ProfileRow) | null;
  userEmail?: string;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  onUpdateProfile: (fullName: string, bio?: string) => Promise<boolean>;
  onUploadAvatar: (file: File) => Promise<boolean>;
}

export function ProfileSettingsCard({
  profile,
  userEmail,
  isSaving,
  isUploadingAvatar,
  onUpdateProfile,
  onUploadAvatar,
}: ProfileSettingsCardProps) {
  const getFullName = () => {
    if (!profile) return "";
    if ("fullName" in profile && profile.fullName) return profile.fullName;
    if ("full_name" in profile && profile.full_name) return profile.full_name;
    return "";
  };

  const getAvatarUrl = () => {
    if (!profile) return undefined;
    if ("avatarUrl" in profile && profile.avatarUrl) return profile.avatarUrl;
    if ("avatar_url" in profile && (profile as ProfileRow).avatar_url) return (profile as ProfileRow).avatar_url || undefined;
    return undefined;
  };

  const getBio = () => {
    if (!profile) return "";
    if ("bio" in profile && profile.bio != null) return profile.bio;
    return "";
  };

  const getEmail = () => {
    if (profile && "email" in profile && profile.email) return profile.email;
    return userEmail || "";
  };

  const [fullName, setFullName] = React.useState(getFullName());
  const [bio, setBio] = React.useState(getBio());
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync state when profile is loaded or re-fetched
  React.useEffect(() => {
    if (profile) {
      setFullName(getFullName());
      setBio(getBio());
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAvatar(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    onUpdateProfile(fullName.trim(), bio);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-black tracking-tight text-foreground">Profile Settings</h2>
        <p className="text-xs text-muted-foreground">
          Manage your personal information, display avatar, and academic bio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {/* AVATAR SECTION */}
        <div className="flex items-center gap-5 p-4 rounded-2xl border border-border/80 bg-card/60">
          <div className="relative group">
            <Avatar
              src={getAvatarUrl()}
              name={fullName || "User"}
              size="lg"
              className="h-16 w-16 border-2 border-primary/40 shadow-md"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
            >
              {isUploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-foreground">Profile Picture</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              PNG, JPG or WEBP up to 5MB. Click photo to change.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="mt-2 text-xs font-bold gap-1.5 cursor-pointer"
            >
              {isUploadingAvatar && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Upload Image
            </Button>
          </div>
        </div>

        {/* FULL NAME */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Full Name *</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
            className="text-xs"
          />
        </div>

        {/* EMAIL (READ-ONLY) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Email Address</label>
          <Input
            value={getEmail()}
            disabled
            className="text-xs bg-muted/50 cursor-not-allowed"
          />
          <p className="text-[10px] text-muted-foreground">
            Authenticated email address associated with your ASP account.
          </p>
        </div>

        {/* BIO */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Academic Bio (Optional)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short student bio, major, or learning goals..."
            rows={3}
            className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <Button
          type="submit"
          disabled={isSaving}
          className="gap-2 font-extrabold cursor-pointer"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
