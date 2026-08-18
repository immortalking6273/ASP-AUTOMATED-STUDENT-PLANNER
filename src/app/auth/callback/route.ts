import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ProfilesService } from "@/services/db/profiles-service";

function getCallbackPublicOrigin(request: Request): string {
  // 1. Check explicit environment variables
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    const sanitized = envUrl.replace("0.0.0.0", "localhost").replace(/\/$/, "");
    if (sanitized) return sanitized;
  }

  // 2. Check request headers (x-forwarded-host, host)
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  if (host) {
    const cleanHost = host.replace("0.0.0.0", "localhost");
    return `${proto}://${cleanHost}`.replace(/\/$/, "");
  }

  // 3. Fallback from request.url replacing 0.0.0.0 with localhost
  try {
    const url = new URL(request.url);
    const cleanOrigin = url.origin.replace("0.0.0.0", "localhost");
    return cleanOrigin.replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

export async function GET(request: Request) {
  console.log("[AUTH] Callback reached");
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  console.log("[AUTH] Callback code exists:", !!code);

  const rawRedirectTo = searchParams.get("redirectTo") || "/dashboard";

  // Sanitize redirectTo to prevent open redirect vulnerabilities
  let redirectTo = "/dashboard";
  if (
    rawRedirectTo.startsWith("/") &&
    !rawRedirectTo.startsWith("//") &&
    !rawRedirectTo.includes(":\\")
  ) {
    redirectTo = rawRedirectTo;
  }

  const publicOrigin = getCallbackPublicOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("[AUTH] Code exchange succeeded/failed:", !error);
    console.log("[AUTH] Authenticated user exists:", !!data?.user);

    if (!error && data?.user) {
      // Ensure profile row exists in database for the newly authenticated OAuth user
      try {
        await ProfilesService.ensureProfile(
          data.user.id,
          data.user.email,
          data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          supabase
        );
      } catch (profileErr) {
        console.error("[AuthCallback] Failed to ensure profile:", profileErr);
      }

      console.log("[AUTH] Redirecting to dashboard");
      const cookieStore = await cookies();
      const response = NextResponse.redirect(`${publicOrigin}${redirectTo}`);
      cookieStore.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie);
      });
      return response;
    }
  }

  console.log("[AUTH] Code exchange or user validation failed, returning to /login");
  return NextResponse.redirect(`${publicOrigin}/login?error=auth_callback_failed`);
}
