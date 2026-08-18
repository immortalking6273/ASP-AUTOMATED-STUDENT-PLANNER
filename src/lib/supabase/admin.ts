import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Creates a server-only Supabase admin client using SUPABASE_SERVICE_ROLE_KEY.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to browser code or NEXT_PUBLIC_* variables.
 * Throws a clear server configuration error if SUPABASE_SERVICE_ROLE_KEY is omitted or placeholder.
 */
export function createAdminClient() {
  const { supabaseUrl } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isConfigured =
    Boolean(serviceRoleKey) &&
    serviceRoleKey !== "your-supabase-service-role-key" &&
    !serviceRoleKey?.includes("placeholder");

  if (!isConfigured || !serviceRoleKey) {
    console.error("[ACCOUNT_DELETE][ADMIN] Service role configured: false");
    throw new Error(
      "[ACCOUNT_DELETE][ADMIN] Missing required server-side environment variable SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  console.log("[ACCOUNT_DELETE][ADMIN] Service role configured: true");

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    adminClient,
    isAvailable: true,
  };
}
