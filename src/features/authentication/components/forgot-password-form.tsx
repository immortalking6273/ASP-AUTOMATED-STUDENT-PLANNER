"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send, CheckCircle2, RotateCcw } from "lucide-react";

export const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword, isLoading } = useAuth();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [sentEmail, setSentEmail] = React.useState("");
  const [authError, setAuthError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setAuthError(null);
    try {
      await forgotPassword(data);
      setSentEmail(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      setAuthError(err.message || "Failed to send password reset email.");
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4 animate-fadeIn">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 shadow-sm">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Reset Link Sent</h3>
          <p className="text-xs text-muted-foreground">
            We&apos;ve sent password reset instructions to <span className="font-semibold text-foreground">{sentEmail}</span>.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSuccess(false)}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Resend to different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      {authError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2 animate-fadeIn">
          <span>⚠️ {authError}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Email Address</label>
        <Input
          {...register("email")}
          type="email"
          placeholder="student@university.edu"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold"
        rightIcon={<Send className="h-4 w-4" />}
      >
        Send Reset Link
      </Button>
    </form>
  );
};
