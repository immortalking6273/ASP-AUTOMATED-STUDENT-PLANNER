/**
 * Supabase Storage Buckets Configuration & Path Helpers
 */

export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  DOCUMENTS: "documents",
  COVERS: "covers",
  ATTACHMENTS: "attachments",
} as const;

export function getPublicStorageUrl(bucket: keyof typeof STORAGE_BUCKETS, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKETS[bucket]}/${path}`;
}
