import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmailVerificationBanner } from "@/features/authentication/components/email-verification-banner";
import { ProtectedRoute } from "@/features/authentication/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireVerified={true}>
      <AppShell>
        <EmailVerificationBanner />
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}
