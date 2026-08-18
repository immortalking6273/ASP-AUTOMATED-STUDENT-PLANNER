import Link from "next/link";
import { ForgotPasswordForm } from "@/features/authentication/components/forgot-password-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, KeyRound } from "lucide-react";

export const metadata = {
  title: "Forgot Password - ASP Workspace",
  description: "Request a password reset link for your Automated Student Planner account.",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="border border-border/80 shadow-2xl backdrop-blur-xl bg-card/95 rounded-3xl p-2 sm:p-4">
      <CardHeader className="text-center space-y-2 pb-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1 shadow-sm">
          <KeyRound className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
          Forgot Password?
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
          No worries! Enter your registered email address and we&apos;ll send you a password reset link.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <ForgotPasswordForm />
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/50 py-4 text-xs text-muted-foreground mt-2">
        <Link href="/login" className="flex items-center gap-1.5 font-bold text-primary hover:underline transition-all">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
