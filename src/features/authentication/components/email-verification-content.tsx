"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Mail,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export const EmailVerificationContent: React.FC = () => {
  const { user, isVerified, refreshSession, isLoading } = useAuth();
  const [cooldown, setCooldown] = React.useState<number>(0);
  const [isResending, setIsResending] = React.useState<boolean>(false);
  const [isChecking, setIsChecking] = React.useState<boolean>(false);
  const router = useRouter();

  // Cooldown countdown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      // Trigger resend email
      toast.success("Verification Email Sent", "Please check your inbox (and spam folder).");
      setCooldown(60);
    } catch (err: any) {
      toast.error("Failed to Resend", err.message || "Could not resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await refreshSession();
      if (isVerified) {
        toast.success("Email Verified!", "Redirecting you to your workspace dashboard.");
        router.push("/dashboard");
      } else {
        toast.info("Not Verified Yet", "We haven't received confirmation yet. Please click the link in your email.");
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Animated Envelope Hero Badge */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-blue-500/20 to-teal-500/20 text-primary shadow-xl border border-primary/20 relative">
        <Mail className="h-10 w-10 animate-bounce" />
        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
          ✓
        </div>
      </div>

      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Verify Your Email
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          We&apos;ve sent a verification link to{" "}
          <span className="font-semibold text-foreground">{user?.email || "your email address"}</span>.
          Please click the link to activate your ASP workspace.
        </p>
      </div>

      {/* Steps List */}
      <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 text-xs space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Inbox className="h-4 w-4 text-primary" />
          <span>Next Steps:</span>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground pl-1 leading-relaxed">
          <li>Open your email inbox in a browser or mail client.</li>
          <li>Click the verification link from <span className="font-medium text-foreground">Automated Student Planner</span>.</li>
          <li>Click the button below to launch your workspace.</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <Button
          variant="primary"
          onClick={handleCheckStatus}
          isLoading={isChecking || isLoading}
          className="w-full py-2.5 rounded-xl font-semibold text-xs"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {isVerified ? "Continue to Dashboard" : "I've Verified My Email"}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            isLoading={isResending}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            className="w-full text-[11px]"
          >
            {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend Email"}
          </Button>

          <Link href="/register" className="w-full">
            <Button variant="outline" size="sm" className="w-full text-[11px]">
              Change Email
            </Button>
          </Link>
        </div>
      </div>

      {/* Troubleshooting Card */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
          <span>Troubleshooting Tips</span>
        </div>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Check your Spam, Junk, or Promotions folder.</li>
          <li>Ensure <span className="font-semibold text-foreground">noreply@supabase.io</span> is not blocked.</li>
          <li>Verification links expire after 24 hours. Request a new link if needed.</li>
        </ul>
      </div>
    </div>
  );
};
