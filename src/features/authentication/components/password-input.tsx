"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, InputProps } from "@/components/ui/input";
import { getPasswordStrength } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<InputProps, "type" | "rightIcon"> {
  showStrengthMeter?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value, onChange, showStrengthMeter = false, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const pwdValue = typeof value === "string" ? value : "";

    const strength = React.useMemo(
      () => getPasswordStrength(pwdValue),
      [pwdValue]
    );

    return (
      <div className="w-full space-y-2">
        <Input
          type={showPassword ? "text" : "password"}
          ref={ref}
          value={value}
          onChange={onChange}
          className={className}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...props}
        />

        {showStrengthMeter && pwdValue.length > 0 && (
          <div className="space-y-1.5 pt-1 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Password strength:</span>
              <span className={cn("font-medium", strength.score >= 80 ? "text-emerald-600" : "text-amber-500")}>
                {strength.label}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-1">
              <div
                className={cn("h-full transition-all duration-300 rounded-full", strength.color)}
                style={{ width: `${strength.score}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground pt-1">
              <span className={strength.hasMinLength ? "text-emerald-600 font-medium" : ""}>
                ✓ 8+ characters
              </span>
              <span className={strength.hasUppercase ? "text-emerald-600 font-medium" : ""}>
                ✓ Uppercase letter
              </span>
              <span className={strength.hasLowercase ? "text-emerald-600 font-medium" : ""}>
                ✓ Lowercase letter
              </span>
              <span className={strength.hasNumber ? "text-emerald-600 font-medium" : ""}>
                ✓ Number (0-9)
              </span>
              <span className={strength.hasSpecial ? "text-emerald-600 font-medium" : ""}>
                ✓ Special character (!@#$)
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
