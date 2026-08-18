import Link from "next/link";
import { ResetPasswordForm } from "@/features/authentication/components/reset-password-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata = {
  title: "Reset Password - ASP Workspace",
  description: "Set a new password for your Automated Student Planner account.",
};

export default function ResetPasswordPage() {
  return (
    <Card className="border border-border/80 shadow-2xl backdrop-blur-xl bg-card/95 rounded-3xl p-2 sm:p-4">
      <CardHeader className="text-center space-y-2 pb-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1 shadow-sm">
          <Lock className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
          Set New Password
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
          Please enter and confirm your new password below.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <ResetPasswordForm />
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
