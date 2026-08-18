import { createClient } from "@/lib/supabase/client";
import { LoginFormData, RegisterFormData, ForgotPasswordFormData, ResetPasswordFormData } from "@/lib/validations/auth";
import { User } from "@supabase/supabase-js";
import { getPublicSiteUrl } from "@/lib/utils";

export class AuthService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Register a new user with full name metadata and send confirmation email
   */
  static async register(data: RegisterFormData) {
    const supabase = this.getSupabase();
    const siteUrl = getPublicSiteUrl();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${siteUrl}/callback?redirectTo=/dashboard`,
        data: {
          full_name: data.fullName,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`,
        },
      },
    });

    if (error) throw new Error(this.getFriendlyErrorMessage(error.message));
    return authData;
  }

  /**
   * Authenticate user with Email and Password
   */
  static async login(data: LoginFormData) {
    const supabase = this.getSupabase();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(this.getFriendlyErrorMessage(error.message));
    return authData;
  }

  /**
   * Sign in using Google OAuth provider
   */
  static async loginWithOAuth(provider: "google" = "google") {
    console.log("[AUTH] Starting Supabase Google OAuth");
    const supabase = this.getSupabase();
    const siteUrl = getPublicSiteUrl();
    const redirectTo = `${siteUrl}/auth/callback`;

    console.log("[AUTH] OAuth starting");
    console.log("[AUTH] OAuth redirectTo:", redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    console.log("[AUTH] OAuth URL exists:", !!data?.url);
    if (data?.url) {
      console.log("[AUTH] OAuth URL = ", data.url);
    }
    console.log("[AUTH] OAuth result:", {
      hasUrl: !!data?.url,
      error: error?.message,
    });

    if (error) {
      console.error("[AUTH] Google OAuth failed:", error);
      throw new Error(this.getFriendlyErrorMessage(error.message));
    }

    // If Supabase returns an OAuth URL, navigate the browser directly to it
    if (data?.url && typeof window !== "undefined") {
      window.location.href = data.url;
    }

    return data;
  }

  /**
   * Send password reset link to specified email address
   */
  static async sendPasswordResetEmail(data: ForgotPasswordFormData) {
    const supabase = this.getSupabase();
    const siteUrl = getPublicSiteUrl();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) throw new Error(this.getFriendlyErrorMessage(error.message));
    return true;
  }

  /**
   * Update password for reset password flow
   */
  static async resetPassword(data: ResetPasswordFormData) {
    const supabase = this.getSupabase();

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) throw new Error(this.getFriendlyErrorMessage(error.message));
    return true;
  }

  /**
   * Sign out user from all sessions and clear tokens
   */
  static async logout() {
    const supabase = this.getSupabase();
    const { error } = await supabase.auth.signOut();

    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.clear();
      } catch {
        // Ignore storage access errors
      }
    }

    if (error) throw new Error(this.getFriendlyErrorMessage(error.message));
    return true;
  }

  /**
   * Get current active user session
   */
  static async getSession() {
    const supabase = this.getSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
  }

  /**
   * Get authenticated user
   */
  static async getUser(): Promise<User | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  }

  /**
   * Maps technical Supabase error strings to clear error messages
   */
  private static getFriendlyErrorMessage(message: string): string {
    const raw = message || "An unexpected authentication error occurred. Please try again.";
    const lower = raw.toLowerCase();

    if (lower.includes("invalid login credentials")) {
      return "Incorrect email or password. Please check your credentials and try again.";
    }
    if (lower.includes("user already registered") || lower.includes("email already in use")) {
      return "An account with this email address already exists. Try signing in instead.";
    }
    if (lower.includes("email not confirmed")) {
      return "Your email address has not been verified yet. Please check your inbox for the verification link.";
    }
    if (lower.includes("password should be at least")) {
      return "Password does not meet minimum security requirements.";
    }
    if (lower.includes("rate limit") || lower.includes("too many requests")) {
      return "Too many attempts. Please wait a few minutes before trying again.";
    }

    // Return exact raw error message for technical errors like API key or network issues
    return raw;
  }
}
