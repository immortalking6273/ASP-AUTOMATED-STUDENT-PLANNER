"use client";

import * as React from "react";
import { User, Session, Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AuthService } from "@/services/auth";
import { ProfilesService } from "@/services/db/profiles-service";
import { ProfileRow } from "@/types/database";
import { LoginFormData, RegisterFormData, ForgotPasswordFormData, ResetPasswordFormData } from "@/lib/validations/auth";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  preferredTheme?: string;
  language?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  dbProfile: ProfileRow | null;
  session: Session | null;
  isLoading: boolean;
  isVerified: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  loginWithOAuth: (provider?: "google") => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordFormData) => Promise<void>;
  resetPassword: (data: ResetPasswordFormData) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [dbProfile, setDbProfile] = React.useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const router = useRouter();

  const supabase = React.useMemo(() => createClient(), []);

  // Fetch DB profile when user is loaded, guarding against race conditions
  React.useEffect(() => {
    let isMounted = true;
    const currentUserId = user?.id;

    // Immediately clear dbProfile when user changes or becomes null
    setDbProfile(null);

    async function fetchDbProfile() {
      if (!currentUserId) {
        if (isMounted) setDbProfile(null);
        return;
      }

      try {
        const profileData = await ProfilesService.getByUserId(currentUserId);
        if (isMounted && currentUserId === user?.id) {
          setDbProfile(profileData);
        }
      } catch (err) {
        if (isMounted && currentUserId === user?.id) {
          setDbProfile(null);
        }
      }
    }

    fetchDbProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Compute profile helper combining DB profile and user metadata
  const profile: UserProfile | null = React.useMemo(() => {
    if (!user) return null;
    const fullName =
      dbProfile?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Student";
    const avatarUrl =
      dbProfile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

    const isVerified = user.email_confirmed_at != null || user.confirmed_at != null;

    return {
      id: user.id,
      fullName,
      email: user.email || "",
      avatarUrl,
      bio: dbProfile?.bio || undefined,
      timezone: dbProfile?.timezone || undefined,
      preferredTheme: dbProfile?.preferred_theme || undefined,
      language: dbProfile?.language || undefined,
      isVerified,
      createdAt: user.created_at,
      updatedAt: user.updated_at || user.created_at,
    };
  }, [user, dbProfile]);

  const isVerified = profile?.isVerified ?? false;

  // Initialize session & register listener
  React.useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        console.log("[AUTH] Existing session:", !!initialSession);
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (!initialSession?.user) setDbProfile(null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (mounted) {
          setSession(null);
          setUser(null);
          setDbProfile(null);
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
      if (mounted) {
        const newUser = newSession?.user ?? null;
        setSession(newSession);
        setUser(newUser);
        setIsLoading(false);

        if (_event === "SIGNED_OUT" || !newUser) {
          setUser(null);
          setSession(null);
          setDbProfile(null);
          router.push("/login");
          router.refresh();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const authData = await AuthService.login(data);
      if (authData?.session) {
        setSession(authData.session);
        setUser(authData.session.user);
      }
      toast.success("Welcome back!", "Successfully signed in to ASP.");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error("Sign In Failed", err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const authData = await AuthService.register(data);
      if (authData?.session) {
        setSession(authData.session);
        setUser(authData.session.user);
      }
      toast.success(
        "Account created!",
        "Please check your email inbox to verify your registration before signing in."
      );
      router.push("/verify-email");
      router.refresh();
    } catch (err: any) {
      toast.error("Registration Failed", err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: "google" = "google") => {
    setIsLoading(true);
    try {
      await AuthService.loginWithOAuth(provider);
    } catch (err: any) {
      toast.error("OAuth Sign In Failed", err.message);
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    // Immediately wipe local auth states to prevent flash of stale data
    setUser(null);
    setSession(null);
    setDbProfile(null);

    try {
      await AuthService.logout();
      toast.info("Signed out", "You have been logged out safely.");
    } catch (err: any) {
      toast.error("Logout Failed", err.message);
    } finally {
      setIsLoading(false);
      router.push("/login?switch=true");
      router.refresh();
    }
  };

  const forgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await AuthService.sendPasswordResetEmail(data);
      toast.success("Reset email sent", "Check your inbox for password reset instructions.");
    } catch (err: any) {
      toast.error("Error", err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await AuthService.resetPassword(data);
      toast.success("Password Updated", "Your password has been reset successfully. Please sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error("Reset Failed", err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    const activeSession = await AuthService.getSession();
    setSession(activeSession);
    setUser(activeSession?.user ?? null);
    if (activeSession?.user?.id) {
      try {
        const profileData = await ProfilesService.getByUserId(activeSession.user.id);
        if (profileData) setDbProfile(profileData);
      } catch {
        // Ignore fallback
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        dbProfile,
        session,
        isLoading,
        isVerified,
        login,
        register,
        loginWithOAuth,
        logout,
        forgotPassword,
        resetPassword,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
