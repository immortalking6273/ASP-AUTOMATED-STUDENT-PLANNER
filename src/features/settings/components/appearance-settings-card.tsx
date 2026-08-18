"use client";

import * as React from "react";
import { UserPreferencesRow } from "../types";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Laptop, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppearanceSettingsCardProps {
  preferences: UserPreferencesRow | null;
  onUpdatePreferences: (patch: Partial<UserPreferencesRow>) => Promise<void>;
}

export function AppearanceSettingsCard({
  preferences,
  onUpdatePreferences,
}: AppearanceSettingsCardProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "dark",
      label: "Dark (Black + Violet)",
      desc: "Deep pitch black background with vibrant violet accents.",
      icon: <Moon className="h-5 w-5 text-violet-400" />,
      previewBg: "bg-black border-violet-500/40 text-violet-400",
    },
    {
      id: "light",
      label: "Light",
      desc: "Clean white surface with violet highlights.",
      icon: <Sun className="h-5 w-5 text-amber-400" />,
      previewBg: "bg-white border-slate-300 text-violet-600",
    },
    {
      id: "system",
      label: "System Default",
      desc: "Automatically adapts to your device operating system theme.",
      icon: <Laptop className="h-5 w-5 text-muted-foreground" />,
      previewBg: "bg-gradient-to-r from-black via-slate-800 to-white text-violet-400",
    },
  ];

  const handleReduceMotionToggle = () => {
    if (!preferences) return;
    onUpdatePreferences({ reduce_motion: !preferences.reduce_motion });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-black tracking-tight text-foreground">Appearance Settings</h2>
        <p className="text-xs text-muted-foreground">
          Customize theme colors, UI contrast, and animation performance.
        </p>
      </div>

      {/* THEME SELECTOR */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-foreground">Theme Mode</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((item) => {
            const isSelected = theme === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={cn(
                  "group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                    : "border-border/80 bg-card/60 hover:bg-accent/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-background border border-border">
                    {item.icon}
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-foreground">{item.label}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REDUCE MOTION */}
      <div className="pt-2">
        <div
          onClick={handleReduceMotionToggle}
          className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-accent/40 cursor-pointer transition-colors"
        >
          <div className="space-y-0.5 pr-4">
            <h4 className="text-xs font-bold text-foreground">Reduce Motion & Animations</h4>
            <p className="text-[11px] text-muted-foreground">
              Minimizes transitions, page slide animations, and particle effects for accessibility and performance.
            </p>
          </div>

          <div
            className={cn(
              "h-6 w-11 rounded-full p-0.5 transition-colors flex items-center shrink-0 cursor-pointer",
              preferences?.reduce_motion ? "bg-primary" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "h-5 w-5 rounded-full bg-white shadow-md transform transition-transform",
                preferences?.reduce_motion ? "translate-x-5" : "translate-x-0"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
