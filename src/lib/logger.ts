/**
 * Environment-Aware Logging Utility for Database Queries, Errors, and Performance Metrics
 */

export type LogLevel = "info" | "warn" | "error" | "metric";

export class Logger {
  private static isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

  private static format(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    };
  }

  static info(message: string, meta?: any) {
    if (!this.isProd) {
      console.log(`[INFO] ${message}`, meta || "");
    }
  }

  static warn(message: string, meta?: any) {
    console.warn(`[WARN] ${message}`, meta || "");
  }

  static error(message: string, error?: any, meta?: any) {
    console.error(`[ERROR] ${message}`, error || "", meta || "");
  }

  static metric(queryName: string, durationMs: number, meta?: any) {
    if (!this.isProd) {
      console.log(`[METRIC] ${queryName} executed in ${durationMs.toFixed(2)}ms`, meta || "");
    }
  }
}
