import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Helper to preserve set-cookie headers when issuing redirects
  const redirectWithCookies = (targetPath: string, searchParams?: Record<string, string>) => {
    const url = request.nextUrl.clone();
    if (url.hostname === "0.0.0.0") {
      url.hostname = "localhost";
    }
    url.pathname = targetPath;
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const response = NextResponse.redirect(url);
    // Copy cookies updated by Supabase SSR to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Define public and protected route definitions
  const publicAuthPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isPublicAuthPath = publicAuthPaths.some((p) => pathname === p || pathname.startsWith(p));
  const isCallbackPath = pathname.startsWith("/callback") || pathname.startsWith("/auth/callback");
  const isLandingPage = pathname === "/";
  const isVerifyEmailPage = pathname === "/verify-email";

  const isPublicRoute = isPublicAuthPath || isCallbackPath || isLandingPage;

  // Check email verification status
  const isEmailVerified = user?.email_confirmed_at != null || user?.confirmed_at != null;

  // 1. Unauthenticated users trying to access protected paths -> Redirect to /login
  if (!user && !isPublicRoute && !isVerifyEmailPage) {
    return redirectWithCookies("/login", { redirectTo: pathname });
  }

  // 2. Authenticated users attempting to visit auth pages (/login) -> Redirect to /dashboard
  // NOTE: Do NOT force-redirect /register or explicit switch/logout query requests so users can intentionally register/switch accounts!
  const isRegisterPage = pathname.startsWith("/register");
  const isSwitchingAccount = request.nextUrl.searchParams.has("switch") || request.nextUrl.searchParams.has("logout");

  if (user && isPublicAuthPath && !isRegisterPage && !isSwitchingAccount) {
    return redirectWithCookies("/dashboard");
  }

  // 3. Authenticated unverified users attempting to access protected dashboard routes -> Redirect to /verify-email
  if (user && !isEmailVerified && !isPublicRoute && !isVerifyEmailPage) {
    return redirectWithCookies("/verify-email");
  }

  // 4. Authenticated verified users visiting /verify-email -> Redirect to /dashboard
  if (user && isEmailVerified && isVerifyEmailPage) {
    return redirectWithCookies("/dashboard");
  }

  return supabaseResponse;
}
