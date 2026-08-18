"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";
import { User, Mail, Lock, UserPlus } from "lucide-react";

export const RegisterForm: React.FC = () => {
  const { register: registerAuth, isLoading } = useAuth();
  const [authError, setAuthError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const pwdValue = useWatch({ control, name: "password" });

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    try {
      await registerAuth(data);
    } catch (err: any) {
      setAuthError(err.message || "Failed to create account");
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
        <label className="text-xs font-medium text-foreground">Full Name</label>
        <Input
          {...register("fullName")}
          type="text"
          placeholder="Alex Morgan"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.fullName?.message}
          disabled={isLoading}
          autoComplete="name"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Email Address</label>
        <Input
          {...register("email")}
          type="email"
          placeholder="alex@university.edu"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Create Password</label>
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
        <label className="text-xs font-medium text-foreground">Confirm Password</label>
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
        className="w-full mt-2"
        rightIcon={<UserPlus className="h-4 w-4" />}
      >
        Create Student Account
      </Button>
    </form>
  );
};
