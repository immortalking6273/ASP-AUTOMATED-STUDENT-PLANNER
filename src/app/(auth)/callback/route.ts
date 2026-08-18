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
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
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

      // CRITICAL: Construct redirect response and explicitly attach session cookies!
      // In Next.js App Router, createClient() sets cookies in cookieStore, but
      // NextResponse.redirect() creates a new Response object. We MUST copy
      // the updated session cookies to the redirect response so the browser receives them!
      const cookieStore = await cookies();
      const response = NextResponse.redirect(`${publicOrigin}${redirectTo}`);
      cookieStore.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie);
      });
      return response;
    }
  }

  // Return user to login page if code exchange fails
  return NextResponse.redirect(`${publicOrigin}/login?error=auth_callback_failed`);
}


