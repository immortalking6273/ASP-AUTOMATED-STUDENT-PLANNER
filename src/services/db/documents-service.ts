import { BaseDatabaseService } from "./base-service";
import { UploadedDocumentRow } from "@/types/database";
import { Logger } from "@/lib/logger";
import { generateUUID } from "@/lib/utils";

export interface DocumentFilterOptions {
  fileType?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  tag?: string;
}

export type DocumentSortOption =
  | "created_desc"
  | "created_asc"
  | "title_asc"
  | "title_desc"
  | "size_desc"
  | "size_asc";

export interface UploadOptions {
  description?: string;
  tags?: string[];
  displayName?: string;
}

export class DocumentsService extends BaseDatabaseService {
  /**
   * Fetch documents with filtering, live text search, and sorting
   */
  static async getDocuments(
    workspaceId?: string,
    filters?: DocumentFilterOptions,
    searchQuery?: string,
    sortBy: DocumentSortOption = "created_desc"
  ): Promise<UploadedDocumentRow[]> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      let query = supabase.from("uploaded_documents").select("*");

      if (workspaceId) {
        query = query.eq("workspace_id", workspaceId);
      }

      // Archiving filter (default: non-archived unless explicitly requested)
      if (filters?.isArchived !== undefined) {
        query = query.eq("is_archived", filters.isArchived);
      } else {
        query = query.eq("is_archived", false);
      }

      if (filters?.isFavorite !== undefined) {
        query = query.eq("is_favorite", filters.isFavorite);
      }

      if (filters?.fileType && filters.fileType !== "all") {
        query = query.eq("file_type", filters.fileType);
      }

      if (filters?.tag) {
        query = query.contains("tags", [filters.tag]);
      }

      // Search matching file_name, display_name, or description
      if (searchQuery && searchQuery.trim()) {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(`file_name.ilike.${q},display_name.ilike.${q},description.ilike.${q}`);
      }

      // Sorting
      switch (sortBy) {
        case "created_asc":
          query = query.order("created_at", { ascending: true });
          break;
        case "title_asc":
          query = query.order("display_name", { ascending: true });
          break;
        case "title_desc":
          query = query.order("display_name", { ascending: false });
          break;
        case "size_desc":
          query = query.order("file_size", { ascending: false });
          break;
        case "size_asc":
          query = query.order("file_size", { ascending: true });
          break;
        case "created_desc":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data, error } = await query;
      Logger.metric("DocumentsService.getDocuments", performance.now() - start);
      if (error) throw error;
      return (data || []) as UploadedDocumentRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Helper alias for getDocuments(workspaceId)
   */
  static async getDocumentsByWorkspace(workspaceId: string): Promise<UploadedDocumentRow[]> {
    return this.getDocuments(workspaceId);
  }

  private static isUUID(id?: string): boolean {
    if (!id) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  private static async resolveValidWorkspaceId(supabase: any, userId: string, rawWorkspaceId?: string): Promise<string> {
    if (this.isUUID(rawWorkspaceId)) {
      return rawWorkspaceId!;
    }

    console.log(`[DOCUMENT_UPLOAD] Invalid workspace ID "${rawWorkspaceId}". Resolving active workspace for user: ${userId}`);

    const { data: userWorkspaces } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: true })
      .limit(1);

    if (userWorkspaces && userWorkspaces.length > 0) {
      console.log(`[DOCUMENT_UPLOAD] Resolved user active workspace UUID: ${userWorkspaces[0].id}`);
      return userWorkspaces[0].id;
    }

    console.log("[DOCUMENT_UPLOAD] No workspaces found. Provisioning default workspace...");
    const { data: newWs, error: createWsErr } = await supabase
      .from("workspaces")
      .insert({
        owner_id: userId,
        title: "Main Workspace",
        description: "Default workspace for study notes and materials",
        icon: "BookOpen",
        color: "blue",
      })
      .select("id")
      .single();

    if (createWsErr || !newWs?.id) {
      console.error("[DOCUMENT_UPLOAD] Failed to provision default workspace:", createWsErr);
      throw new Error("Invalid workspace ID and unable to create a default workspace.");
    }

    console.log(`[DOCUMENT_UPLOAD] Provisioned default workspace UUID: ${newWs.id}`);
    return newWs.id;
  }

  /**
   * Upload file to Supabase Storage ('documents' bucket) and insert DB metadata
   */
  static async uploadDocumentFile(
    workspaceId: string,
    file: File,
    options?: UploadOptions
  ): Promise<UploadedDocumentRow> {
    const start = performance.now();
    try {
      console.log(`[DOCUMENT_UPLOAD] uploadDocumentFile called with raw workspaceId: "${workspaceId}", file: "${file.name}"`);
      const supabase = this.getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user required for upload.");
      console.log(`[DOCUMENT_UPLOAD] authenticated userId: ${user.id}`);

      const targetWorkspaceId = await this.resolveValidWorkspaceId(supabase, user.id, workspaceId);
      console.log(`[DOCUMENT_UPLOAD] resolved targetWorkspaceId: ${targetWorkspaceId}`);

      // Determine file extension and file_type category
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      let fileType = "pdf";
      if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) fileType = "image";
      else if ([".docx", ".doc"].includes(ext)) fileType = "word";
      else if ([".pptx", ".ppt"].includes(ext)) fileType = "powerpoint";
      else if ([".txt", ".md"].includes(ext)) fileType = "text";

      const docId = generateUUID();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      // Align storage path with Supabase Storage RLS policy: {user_id}/{workspace_id}/{doc_id}/{file_name}
      const storagePath = `${user.id}/${targetWorkspaceId}/${docId}/${sanitizedFileName}`;

      console.log(`[Storage Upload] Uploading document to storage path: ${storagePath}`);

      // Upload to Supabase Storage 'documents' bucket
      const { error: storageErr } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (storageErr) {
        console.error("[Storage Upload Error] Failed to upload file to storage bucket:", storageErr);
        throw new Error(`Storage bucket upload failed: ${storageErr.message}`);
      }

      console.log(`[Storage Upload Success] File successfully written to bucket path: ${storagePath}`);

      // Create record in public.uploaded_documents with status 'uploaded'
      const { data: docRecord, error: dbErr } = await supabase
        .from("uploaded_documents")
        .insert({
          id: docId,
          workspace_id: targetWorkspaceId,
          uploader_id: user.id,
          file_name: sanitizedFileName,
          original_name: file.name,
          display_name: options?.displayName || file.name,
          file_type: fileType,
          mime_type: file.type || "application/octet-stream",
          file_size: file.size,
          storage_path: storagePath,
          processing_status: "uploaded",
          tags: options?.tags || [],
          description: options?.description || null,
          is_archived: false,
          is_favorite: false,
        })
        .select()
        .single();

      Logger.metric("DocumentsService.uploadDocumentFile", performance.now() - start);
      if (dbErr) throw dbErr;
      return docRecord as UploadedDocumentRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Update document metadata (display_name, description, tags)
   */
  static async updateDocument(id: string, updates: Partial<UploadedDocumentRow>): Promise<UploadedDocumentRow> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("uploaded_documents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      Logger.metric("DocumentsService.updateDocument", performance.now() - start);
      if (error) throw error;
      return data as UploadedDocumentRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Toggle favorite
   */
  static async toggleFavorite(id: string, isFavorite: boolean): Promise<UploadedDocumentRow> {
    return this.updateDocument(id, { is_favorite: isFavorite });
  }

  /**
   * Toggle archive (soft delete)
   */
  static async toggleArchive(id: string, isArchived: boolean): Promise<UploadedDocumentRow> {
    return this.updateDocument(id, { is_archived: isArchived });
  }

  /**
   * Move document to another workspace
   */
  static async moveDocument(id: string, targetWorkspaceId: string): Promise<UploadedDocumentRow> {
    return this.updateDocument(id, { workspace_id: targetWorkspaceId });
  }

  /**
   * Delete document (soft archive or hard delete)
   */
  static async deleteDocument(id: string, hardDelete: boolean = false): Promise<boolean> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      if (!hardDelete) {
        await this.toggleArchive(id, true);
        return true;
      }

      // Fetch storage path before deletion
      const { data: doc } = await supabase
        .from("uploaded_documents")
        .select("storage_path")
        .eq("id", id)
        .single();

      if (doc?.storage_path) {
        await supabase.storage.from("documents").remove([doc.storage_path]);
      }

      const { error } = await supabase.from("uploaded_documents").delete().eq("id", id);
      Logger.metric("DocumentsService.deleteDocument", performance.now() - start);
      if (error) throw error;
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Touch last_opened_at timestamp
   */
  static async touchLastOpened(id: string): Promise<void> {
    try {
      const supabase = this.getSupabase();
      await supabase
        .from("uploaded_documents")
        .update({ last_opened_at: new Date().toISOString() })
        .eq("id", id);
    } catch {
      // Non-blocking metadata touch
    }
  }

  /**
   * Fetch recent documents for active user
   */
  static async getRecentDocuments(userId: string, limit: number = 5): Promise<UploadedDocumentRow[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("uploaded_documents")
        .select("*")
        .eq("uploader_id", userId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as UploadedDocumentRow[];
    } catch (err) {
      return [];
    }
  }

  /**
   * Get signed or public download URL for document
   */
  static async getDownloadUrl(storagePath: string): Promise<string | null> {
    try {
      const supabase = this.getSupabase();
      const { data } = await supabase.storage.from("documents").createSignedUrl(storagePath, 3600);
      if (data?.signedUrl) return data.signedUrl;

      const { data: pub } = supabase.storage.from("documents").getPublicUrl(storagePath);
      return pub.publicUrl || null;
    } catch {
      return null;
    }
  }
}
