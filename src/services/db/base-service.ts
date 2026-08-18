import { createClient } from "@/lib/supabase/client";
import { Logger } from "@/lib/logger";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface QueryOptions extends PaginationParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class BaseDatabaseService {
  protected static getSupabase() {
    return createClient();
  }

  protected static transformError(error: any): Error {
    const safeError = {
      message: error?.message || (typeof error === "string" ? error : String(error)),
      details: error?.details || null,
      hint: error?.hint || null,
      code: error?.code || null,
      name: error?.name || null,
      status: error?.status || null,
      statusCode: error?.statusCode || null,
    };

    Logger.error("Database operation failed", safeError);
    console.error("[Supabase Error Diagnostic]", JSON.stringify(safeError, null, 2));
    
    // PGRST205 / PGRST204: Table or column not found in schema cache / missing migration
    if (
      error?.code === "PGRST205" ||
      error?.code === "PGRST204" ||
      error?.message?.includes("schema cache") ||
      error?.message?.includes("Could not find the table") ||
      error?.message?.includes("Could not find the column")
    ) {
      return new Error(
        "Database schema mismatch. Please run the SQL migration script (supabase/migrations/20260809_study_planner_schema.sql) in your Supabase SQL Editor."
      );
    }

    // 23503: Foreign Key constraint violation
    if (error?.code === "23503" || error?.message?.includes("foreign key constraint")) {
      return new Error(
        "Referential constraint error: Workspace or user ID reference is invalid."
      );
    }

    if (error?.code === "PGRST116") {
      return new Error("Requested record was not found.");
    }

    if (error?.code === "42501") {
      return new Error("Access denied. You do not have permission for this resource.");
    }

    if (error?.code === "23505") {
      return new Error("A record with this unique attribute already exists.");
    }

    return new Error(error?.message || "An unexpected database error occurred.");
  }
}
