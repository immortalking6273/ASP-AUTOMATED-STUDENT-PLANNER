/**
 * Validates Supabase environment variables and returns sanitized configuration.
 * Prevents silent fallback failures when environment keys are missing or malformed.
 */
export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isUrlMissing = !supabaseUrl || supabaseUrl.includes("placeholder");
  const isKeyMissing = !supabaseAnonKey || supabaseAnonKey.includes("placeholder");

  if (isUrlMissing || isKeyMissing) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ [Supabase Warning]: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or set to placeholder. Supabase authentication and database queries may fail."
      );
    }
  }

  return {
    supabaseUrl: supabaseUrl || "https://nhkecajpnnskredpwnph.supabase.co",
    supabaseAnonKey: supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa2VjYWpwbm5za3JlZHB3bnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTIwMTQsImV4cCI6MjEwMTQyODAxNH0.FwFyRRvtFWIMO56_UC3FPguWx_WnqiVXc09pNqR50cQ",
    isConfigured: !isUrlMissing && !isKeyMissing,
  };
}
