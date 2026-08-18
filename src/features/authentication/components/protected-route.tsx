"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "@/components/feedback/loader";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerified = true,
}) => {
  const { user, isLoading, isVerified } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      } else if (requireVerified && !isVerified) {
        router.push("/verify-email");
      }
    }
  }, [user, isLoading, isVerified, requireVerified, router, pathname]);

  if (isLoading || !user || (requireVerified && !isVerified)) {
    return <Loader text="Preparing your workspace..." fullScreen />;
  }

  return <>{children}</>;
};

export const AuthGuard = ProtectedRoute;
