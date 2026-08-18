import { BaseDatabaseService } from "./base-service";
import { sanitizeHumanReadableText } from "@/lib/text-sanitizer";
import {
  KnowledgeStats,
  KnowledgeDocument,
  KnowledgeChunkDetail,
  KnowledgeSearchResult,
} from "@/features/knowledge-base/types";

export class KnowledgeBaseService extends BaseDatabaseService {
  /**
   * Fetch Knowledge Base overview statistics for a workspace
   */
  static async getKnowledgeStats(workspaceId: string): Promise<KnowledgeStats> {
    try {
      const supabase = this.getSupabase();

      const [docsRes, chunksRes] = await Promise.all([
        supabase.from("uploaded_documents").select("*").eq("workspace_id", workspaceId),
        supabase.from("document_chunks").select("id, token_estimate", { count: "exact" }).eq("workspace_id", workspaceId),
      ]);

      if (docsRes.error) throw docsRes.error;

      const docs = docsRes.data || [];
      const totalDocuments = docs.length;
      const totalChunks = chunksRes.count || 0;

      let readyCount = 0;
      let processingCount = 0;
      let failedCount = 0;
      let totalTokens = 0;

      docs.forEach((d: any) => {
        const st = (d.processing_status || "uploaded").toLowerCase();
        if (st === "ready" || st === "indexed") readyCount++;
        else if (st === "failed") failedCount++;
        else processingCount++;

        totalTokens += d.estimated_tokens || 0;
      });

      return {
        totalDocuments,
        totalChunks,
        readyCount,
        processingCount,
        failedCount,
        totalTokens,
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Fetch all documents in workspace enhanced with chunk count and embedding metadata
   */
  static async getKnowledgeDocuments(workspaceId: string): Promise<KnowledgeDocument[]> {
    try {
      const supabase = this.getSupabase();
      const { data: docs, error } = await supabase
        .from("uploaded_documents")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (docs || []).map((d: any) => ({
        ...d,
        chunk_count: d.total_chunks || 0,
        embedding_dimensions: 384, // asp-bow-trigram-v1 default
      })) as KnowledgeDocument[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Fetch sanitized chunks for a specific document (strictly hiding raw float vectors)
   */
  static async getDocumentChunkDetails(documentId: string): Promise<KnowledgeChunkDetail[]> {
    try {
      const supabase = this.getSupabase();

      // Fetch document name
      const { data: doc } = await supabase
        .from("uploaded_documents")
        .select("display_name, original_name")
        .eq("id", documentId)
        .maybeSingle();

      const docTitle = doc?.display_name || doc?.original_name || "Document";

      const { data: rawChunks } = await supabase
        .from("document_chunks")
        .select("*")
        .eq("document_id", documentId)
        .order("chunk_index", { ascending: true });

      return ((rawChunks || []) as any[]).map((c) => {
        const sanitized = sanitizeHumanReadableText(c.content);
        const metadata = c.metadata as any;
        return {
          id: c.id,
          documentId: c.document_id,
          documentTitle: docTitle,
          chunkIndex: c.chunk_index,
          heading: c.heading || metadata?.heading || null,
          content: sanitized,
          characterCount: c.character_count || sanitized.length,
          tokenEstimate: c.token_estimate || Math.ceil(sanitized.length / 4),
          pageNumber: metadata?.pageNumber || metadata?.page || null,
          hasEmbedding: Array.isArray(c.embedding) && (c.embedding as number[]).length > 0,
        };
      });
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Basic search against document chunks for database query fallback
   */
  static async searchKnowledge(
    workspaceId: string,
    queryText: string,
    limit: number = 10
  ): Promise<KnowledgeSearchResult[]> {
    try {
      const supabase = this.getSupabase();
      const qLower = queryText.toLowerCase().trim();

      const { data: rawChunks } = await supabase
        .from("document_chunks")
        .select("*")
        .eq("workspace_id", workspaceId)
        .limit(limit * 2);

      if (!rawChunks || rawChunks.length === 0) return [];

      const docIds = Array.from(new Set(rawChunks.map((c: any) => c.document_id)));
      const { data: docs } = await supabase
        .from("uploaded_documents")
        .select("id, display_name, original_name")
        .in("id", docIds);

      const docMap = new Map<string, string>();
      (docs || []).forEach((d: any) => {
        docMap.set(d.id, d.display_name || d.original_name || "Document");
      });

      const matched = rawChunks
        .filter((c: any) => (c.content || "").toLowerCase().includes(qLower))
        .slice(0, limit);

      return matched.map((c: any) => {
        const title = docMap.get(c.document_id) || "Document";
        const sanitizedContent = sanitizeHumanReadableText(c.content);
        return {
          chunkId: c.id,
          documentId: c.document_id,
          documentTitle: title,
          heading: c.heading || null,
          excerpt: sanitizedContent,
          similarityScore: 0.8,
          relevancePercentage: 80,
          relevanceLabel: "High Relevance",
        };
      });
    } catch (err) {
      throw this.transformError(err);
    }
  }
}


