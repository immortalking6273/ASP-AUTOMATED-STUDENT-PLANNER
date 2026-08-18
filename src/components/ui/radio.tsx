import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent/50",
            selectedValue === opt.value && "border-primary bg-primary/5",
            opt.disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={selectedValue === opt.value}
            disabled={opt.disabled}
            onChange={() => onChange?.(opt.value)}
            className="mt-0.5 h-4 w-4 text-primary focus:ring-primary accent-primary"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">{opt.label}</span>
            {opt.description && (
              <span className="text-xs text-muted-foreground mt-1">{opt.description}</span>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};
