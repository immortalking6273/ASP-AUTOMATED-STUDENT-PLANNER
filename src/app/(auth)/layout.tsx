import * as React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";
import { AuthBrandPanel } from "@/features/authentication/components/auth-brand-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-6 max-w-7xl mx-auto w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight text-base text-foreground">
            {siteConfig.shortName}
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
          {/* Left Brand Panel (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6 h-full min-h-[620px]">
            <AuthBrandPanel />
          </div>

          {/* Right Auth Card Panel */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-md my-auto">{children}</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/40">
        © {new Date().getFullYear()} {siteConfig.name}. Secure Authentication Module.
      </footer>
    </div>
  );
}
