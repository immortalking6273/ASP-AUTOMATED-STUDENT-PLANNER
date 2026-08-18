import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats date string to readable format
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Truncates text to given max length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Safely resolves the public browser-facing base URL of the application.
 * Prevents returning 0.0.0.0 as a browser-facing host.
 */
export function getPublicSiteUrl(): string {
  // 1. Explicit env variables (NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL)
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    const sanitized = envUrl.replace("0.0.0.0", "localhost").replace(/\/$/, "");
    if (sanitized) return sanitized;
  }

  // 2. Client-side window.location.origin if valid
  if (typeof window !== "undefined" && window.location.origin) {
    const origin = window.location.origin;
    const sanitizedOrigin = origin.replace("0.0.0.0", "localhost").replace(/\/$/, "");
    if (sanitizedOrigin) return sanitizedOrigin;
  }

  // 3. Fallback for local development
  return "http://localhost:3000";
}

/**
 * Generates a UUID v4 string compatible with both secure and insecure contexts (e.g. HTTP over LAN).
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

