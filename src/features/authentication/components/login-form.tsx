"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, LogIn } from "lucide-react";

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [authError, setAuthError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      await login(data);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      {authError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2 animate-fadeIn">
          <span>⚠️ {authError}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Email Address</label>
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

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground">Password</label>
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:underline font-medium transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <PasswordInput
          {...register("password")}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <Checkbox
          {...register("rememberMe")}
          label="Remember me on this device"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-2"
        rightIcon={<LogIn className="h-4 w-4" />}
      >
        Sign In to Workspace
      </Button>
    </form>
  );
};
