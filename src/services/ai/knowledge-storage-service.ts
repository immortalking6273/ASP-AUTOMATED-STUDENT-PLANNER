/**
 * Knowledge Storage Service
 * Handles persistence of document chunks, metadata, and status transitions in Supabase database.
 * Accepts an authenticated SupabaseClient to ensure RLS-compliant operations and proper
 * storage access using the user's session credentials.
 */

import { GeneratedChunk } from "./document-chunking-service";
import { DocumentMetadata } from "./metadata-generation-service";
import { EmbeddingResult } from "./embedding-provider";
import { DocumentChunkRow, UploadedDocumentRow } from "@/types/database";
import { Logger } from "@/lib/logger";
import { SupabaseClient } from "@supabase/supabase-js";
import { isValidChunkText } from "@/lib/text-sanitizer";

export type DocumentProcessingStage =
  | "uploaded"
  | "processing"
  | "chunking"
  | "embedding"
  | "ready"
  | "failed";

export class KnowledgeStorageService {
  /**
   * Update processing status of a document
   */
  static async updateDocumentStatus(
    supabase: SupabaseClient,
    documentId: string,
    status: DocumentProcessingStage,
    errorMessage: string | null = null
  ): Promise<void> {
    const { error } = await supabase
      .from("uploaded_documents")
      .update({
        processing_status: status,
        error_message: errorMessage,
        ...(status === "ready" ? { processed_at: new Date().toISOString() } : {}),
      })
      .eq("id", documentId);

    if (error) {
      console.error("[KnowledgeStorageService] updateDocumentStatus error:", error);
    }
  }

  /**
   * Delete existing chunks for a document (used during re-indexing)
   */
  static async clearDocumentChunks(supabase: SupabaseClient, documentId: string): Promise<void> {
    const { error } = await supabase.from("document_chunks").delete().eq("document_id", documentId);
    if (error) {
      console.error("[KnowledgeStorageService] clearDocumentChunks error:", error);
    }
  }

  /**
   * Save chunks and embeddings into document_chunks table with Step 5 & 6 verification logging
   */
  static async saveKnowledgeChunks(
    supabase: SupabaseClient,
    documentId: string,
    workspaceId: string,
    chunks: GeneratedChunk[],
    embeddings: EmbeddingResult[]
  ): Promise<void> {
    const start = performance.now();

    // 1. Clear existing chunks to avoid duplicates
    await this.clearDocumentChunks(supabase, documentId);

    // Filter valid chunks
    const validChunksWithIdx = chunks.map((c, idx) => ({ chunk: c, emb: embeddings[idx] })).filter((item) => {
      const valid = isValidChunkText(item.chunk.content);
      if (!valid) {
        console.warn(`[RAG_VALIDATION] Rejected invalid chunk content prior to insertion (document ${documentId})`);
      }
      return valid;
    });

    if (validChunksWithIdx.length === 0) return;

    // 2. Map chunks for insertion
    const insertPayload = validChunksWithIdx.map(({ chunk, emb }) => {
      const e = emb || { embedding: [] };
      return {
        document_id: documentId,
        workspace_id: workspaceId,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        heading: chunk.heading,
        character_count: chunk.characterCount,
        token_estimate: chunk.tokenEstimate,
        metadata: chunk.metadata as any,
        embedding: e.embedding as any,
      };
    });

    // Step 5 Audit Logging: Inspect content payload immediately before INSERT
    console.log(`\n============== [STEP 5 INSERT AUDIT] ==============`);
    console.log(`Document ID: ${documentId} | Total Chunks To Insert: ${insertPayload.length}`);
    if (insertPayload.length > 0) {
      const sample = insertPayload[0];
      console.log(`[Chunk 0] Index: ${sample.chunk_index}`);
      console.log(`[Chunk 0] Content Length: ${sample.content.length} characters`);
      console.log(`[Chunk 0] Content First 500 Characters:\n"${sample.content.substring(0, 500)}"\n`);
    }
    console.log(`====================================================\n`);

    // 3. Batch insert chunks
    const { error } = await supabase.from("document_chunks").insert(insertPayload);
    Logger.metric("KnowledgeStorageService.saveKnowledgeChunks", performance.now() - start);

    if (error) {
      console.error("[KnowledgeStorageService] Failed to insert document_chunks:", error);
      throw error;
    }

    // Step 6 Audit Logging: Re-read inserted row from Supabase to verify stored content matches
    try {
      const { data: readBack } = await supabase
        .from("document_chunks")
        .select("*")
        .eq("document_id", documentId)
        .order("chunk_index", { ascending: true })
        .limit(1);

      if (readBack && readBack.length > 0) {
        const storedRow = readBack[0];
        console.log(`\n============== [STEP 6 VERIFICATION AUDIT] ==============`);
        console.log(`Re-read Stored Row ID: ${storedRow.id}`);
        console.log(`Stored Content Length: ${storedRow.content.length} characters`);
        console.log(`Stored Content First 500 Characters:\n"${storedRow.content.substring(0, 500)}"\n`);
        console.log(`Content Integrity Match: ${storedRow.content === insertPayload[0].content ? "100% PERFECT MATCH" : "MISMATCH DETECTED"}`);
        console.log(`=========================================================\n`);
      }
    } catch (readErr) {
      console.warn("[KnowledgeStorageService] Verification re-read warning:", readErr);
    }
  }

  /**
   * Complete document processing metadata and mark status as Ready
   */
  static async finalizeDocumentProcessing(
    supabase: SupabaseClient,
    documentId: string,
    metadata: DocumentMetadata
  ): Promise<UploadedDocumentRow> {
    const { data, error } = await supabase
      .from("uploaded_documents")
      .update({
        processing_status: "ready",
        extracted_metadata: metadata as any,
        total_chunks: metadata.totalChunks,
        estimated_tokens: metadata.estimatedTokens,
        reading_time_minutes: metadata.readingTimeMinutes,
        error_message: null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", documentId)
      .select()
      .single();

    if (error) throw error;
    return data as UploadedDocumentRow;
  }

  /**
   * Fetch all chunks for a given document
   */
  static async getDocumentChunks(
    supabase: SupabaseClient,
    documentId: string
  ): Promise<DocumentChunkRow[]> {
    const { data, error } = await supabase
      .from("document_chunks")
      .select("*")
      .eq("document_id", documentId)
      .order("chunk_index", { ascending: true });

    if (error) throw error;
    return (data || []) as DocumentChunkRow[];
  }
}
