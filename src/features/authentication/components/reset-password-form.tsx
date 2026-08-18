"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "./password-input";
import { Lock, KeyRound, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export const ResetPasswordForm: React.FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const pwdValue = useWatch({ control, name: "password" });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setAuthError(null);
    try {
      await resetPassword(data);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setAuthError(err.message || "Failed to reset password.");
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4 animate-fadeIn">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 shadow-sm">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Password Reset Successfully</h3>
          <p className="text-xs text-muted-foreground">
            Your password has been updated. Redirecting you to sign in...
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => router.push("/login")} className="w-full">
          Proceed to Sign In
        </Button>
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
        <label className="text-xs font-semibold text-foreground">New Password</label>
        <PasswordInput
          {...register("password")}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          disabled={isLoading}
          showStrengthMeter
          value={pwdValue}
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
        <PasswordInput
          {...register("confirmPassword")}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold"
        rightIcon={<KeyRound className="h-4 w-4" />}
      >
        Update Password
      </Button>
    </form>
  );
};
