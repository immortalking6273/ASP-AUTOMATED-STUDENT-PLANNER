import { z } from "zod";

/**
 * Password Strength Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must not exceed 100 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Calculates password strength metrics (0 to 100)
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: "Too Weak" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
} {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let passedCriteria = 0;
  if (hasMinLength) passedCriteria++;
  if (hasUppercase) passedCriteria++;
  if (hasLowercase) passedCriteria++;
  if (hasNumber) passedCriteria++;
  if (hasSpecial) passedCriteria++;

  const score = (passedCriteria / 5) * 100;

  if (score <= 20) return { score, label: "Too Weak", color: "bg-destructive", hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
  if (score <= 40) return { score, label: "Weak", color: "bg-amber-500", hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
  if (score <= 60) return { score, label: "Fair", color: "bg-yellow-500", hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
  if (score <= 80) return { score, label: "Good", color: "bg-emerald-400", hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
  return { score: 100, label: "Strong", color: "bg-emerald-600", hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
}
