"use client";

import * as React from "react";
import { Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export const EmailVerificationBanner: React.FC = () => {
  const { user, isVerified } = useAuth();

  if (!user || isVerified) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 shrink-0" />
        <span>Your email address is unverified. Please check your inbox to confirm your account.</span>
      </div>
      <Link href="/verify-email" className="font-semibold underline flex items-center gap-1 hover:text-foreground">
        <span>Verify Email</span>
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
};
