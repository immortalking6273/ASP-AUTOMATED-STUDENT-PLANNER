import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-border bg-card/40 py-4 px-6 text-xs text-muted-foreground">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/help" className="hover:text-foreground transition-colors">
            Help & FAQ
          </Link>
          <Link href="/settings" className="hover:text-foreground transition-colors">
            Settings
          </Link>
          <span className="text-muted-foreground/40">|</span>
          <span>v{siteConfig.version}</span>
        </div>
      </div>
    </footer>
  );
};
