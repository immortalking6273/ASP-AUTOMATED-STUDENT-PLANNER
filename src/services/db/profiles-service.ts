import { BaseDatabaseService } from "./base-service";
import { ProfileRow } from "@/types/database";
import { Logger } from "@/lib/logger";

export class ProfilesService extends BaseDatabaseService {
  /**
   * Fetch profile record by auth user_id
   */
  static async getByUserId(userId: string, client?: any): Promise<ProfileRow | null> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      Logger.metric("ProfilesService.getByUserId", performance.now() - start);
      if (error) throw error;
      return data as ProfileRow | null;
    } catch (err: any) {
      if (err?.code === "PGRST116") return null;
      throw this.transformError(err);
    }
  }

  /**
   * Ensure that a profile record exists for the given user_id before database operations that reference public.profiles(user_id)
   */
  static async ensureProfile(
    userId: string,
    email?: string,
    fullName?: string,
    client?: any
  ): Promise<ProfileRow> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();
      const existing = await this.getByUserId(userId, supabase);
      if (existing) return existing;

      // Profile does not exist yet; insert default profile
      const name = fullName || (email ? email.split("@")[0] : "Student User");
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          full_name: name,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      Logger.metric("ProfilesService.ensureProfile", performance.now() - start);

      if (error) {
        // If a profile was inserted concurrently by another request, fetch and return it
        if (error.code === "23505") {
          const profile = await this.getByUserId(userId, supabase);
          if (profile) return profile;
        }
        throw error;
      }
      return data as ProfileRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Update profile information
   */
  static async updateProfile(
    userId: string,
    updates: Partial<ProfileRow>,
    client?: any
  ): Promise<ProfileRow> {
    const start = performance.now();
    try {
      const supabase = client || this.getSupabase();

      // Ensure profile row exists before performing update
      const existing = await this.getByUserId(userId, supabase);
      if (!existing) {
        await this.ensureProfile(userId, undefined, updates.full_name, supabase);
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      Logger.metric("ProfilesService.updateProfile", performance.now() - start);
      if (error) throw error;
      return data as ProfileRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
