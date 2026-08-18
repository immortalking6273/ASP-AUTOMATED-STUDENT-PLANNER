import { UserPreferencesRow } from "@/services/db/settings-service";
import { ProfileRow } from "@/types/database";
import { UserProfile } from "@/contexts/auth-context";

export type { UserPreferencesRow, ProfileRow, UserProfile };

export type SettingsTab =
  | "profile"
  | "account"
  | "appearance"
  | "ai"
  | "notifications"
  | "study"
  | "workspace"
  | "privacy"
  | "security"
  | "data";
