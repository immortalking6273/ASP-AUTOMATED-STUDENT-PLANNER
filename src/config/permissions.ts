import { Role } from "@/types";

export type Permission =
  | "read:workspace"
  | "write:workspace"
  | "delete:workspace"
  | "upload:document"
  | "generate:ai"
  | "manage:users"
  | "access:analytics";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "read:workspace",
    "write:workspace",
    "delete:workspace",
    "upload:document",
    "generate:ai",
    "manage:users",
    "access:analytics",
  ],
  educator: [
    "read:workspace",
    "write:workspace",
    "upload:document",
    "generate:ai",
    "access:analytics",
  ],
  student: [
    "read:workspace",
    "write:workspace",
    "upload:document",
    "generate:ai",
    "access:analytics",
  ],
  guest: ["read:workspace"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
