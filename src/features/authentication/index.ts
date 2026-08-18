/**
 * Authentication Feature Module Public API Exports
 */

export * from "./components/login-form";
export * from "./components/register-form";
export * from "./components/forgot-password-form";
export * from "./components/reset-password-form";
export * from "./components/password-input";
export * from "./components/google-button";
export * from "./components/oauth-buttons";
export * from "./components/auth-brand-panel";
export * from "./components/email-verification-banner";
export * from "./components/email-verification-content";
export * from "./components/protected-route";
export * from "./components/user-menu";

export * from "@/services/auth";
export * from "@/lib/validations/auth";
export * from "@/contexts/auth-context";
export * from "@/hooks/use-auth";

export const AUTH_MODULE_STATUS = "module_2_authentication_active";
