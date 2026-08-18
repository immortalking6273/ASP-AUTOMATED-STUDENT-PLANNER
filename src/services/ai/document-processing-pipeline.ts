/**
 * Document Processing Pipeline Orchestrator
 * Sequentially executes:
 * Validation -> Extraction -> Cleaning -> Chunking -> Metadata -> Embedding -> Storage -> Ready
 *
 * Accepts an authenticated SupabaseClient so that storage downloads and database writes
 * are performed with the user's session, correctly passing Supabase RLS policies.
 */

import "server-only";

import { TextExtractionService } from "./text-extraction-service";

import { TextCleaningService } from "./text-cleaning-service";
import { DocumentChunkingService, GeneratedChunk } from "./document-chunking-service";
import { MetadataGenerationService, DocumentMetadata } from "./metadata-generation-service";
import { getActiveEmbeddingProvider } from "./embedding-provider";
import { KnowledgeStorageService } from "./knowledge-storage-service";
import { UploadedDocumentRow } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export interface PipelineProgress {
  documentId: string;
  stage: "validation" | "extraction" | "cleaning" | "chunking" | "embedding" | "storage" | "ready" | "failed";
  progressPercent: number;
  currentStepMessage: string;
  chunkCount: number;
  estimatedTokens: number;
  error: string | null;
}

export class DocumentProcessingPipeline {
  /**
   * Run end-to-end processing pipeline for an uploaded document.
   * @param supabase - Authenticated Supabase client from the API route (carries user session + auth cookies)
   * @param document - The document row from the database
   * @param fileBuffer - Optional pre-loaded file buffer (skips storage download if provided)
   */
  static async processDocument(
    supabase: SupabaseClient,
    document: UploadedDocumentRow,
    fileBuffer?: ArrayBuffer | string
  ): Promise<{ success: boolean; metadata?: DocumentMetadata; chunks?: GeneratedChunk[]; error?: string }> {
    const documentId = document.id;
    const workspaceId = document.workspace_id;
    const fileName = document.original_name || document.file_name;

    try {
      console.log(`[Pipeline Started] Processing document ${documentId} (${fileName})`);

      // 1. Stage: Validation & Status Update to 'processing'
      await KnowledgeStorageService.updateDocumentStatus(supabase, documentId, "processing");

      // 2. Download file from Supabase Storage if not provided
      let contentBuffer = fileBuffer;
      if (!contentBuffer) {
        const storagePath = document.storage_path;
        console.log(`[Storage Download] Fetching document from bucket path: ${storagePath}`);

        const { data: fileData, error: downloadErr } = await supabase.storage
          .from("documents")
          .download(storagePath);

        if (downloadErr || !fileData) {
          const errMsg = downloadErr?.message || "Object not found in storage bucket";
          console.error(`[Storage Download Error] Failed for path "${storagePath}":`, downloadErr);
          throw new Error(`Failed to download document file from storage: ${errMsg}. Verify that the file exists in the 'documents' bucket at path: ${storagePath}`);
        }

        contentBuffer = await fileData.arrayBuffer();
        console.log(`[Storage Download Success] Downloaded ${fileData.size} bytes from storage bucket`);
      } else {
        const size = typeof contentBuffer === "string" ? contentBuffer.length : contentBuffer.byteLength;
        console.log(`[Storage Buffer] Direct memory buffer provided (${size} bytes)`);
      }

      // 3. Stage: Text Extraction
      const fileExt = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
      console.log(`[Text Extraction] Extracting text structure for format "${fileExt}"`);
      const extracted = await TextExtractionService.extractText(contentBuffer, fileExt, fileName);

      if (!extracted.rawText || extracted.rawText.trim().length === 0) {
        throw new Error(
          "Text extraction produced empty content. The file may be image-only, encrypted, or an unsupported format."
        );
      }
      console.log(
        `[Text Extraction Success] Extracted ${extracted.rawText.length} characters, ${extracted.sections.length} sections, ${extracted.headings.length} headings`
      );

      // 4. Stage: Text Cleaning
      console.log(`[Text Cleaning] Cleaning whitespace and normalizing structural elements`);
      const cleaned = TextCleaningService.cleanText(extracted.rawText, extracted.sections);
      console.log(`[Text Cleaning Success] Cleaned text length: ${cleaned.cleanedText.length} characters`);

      // 5. Stage: Chunking
      await KnowledgeStorageService.updateDocumentStatus(supabase, documentId, "chunking");
      console.log(`[Document Chunking] Generating semantic heading-aware chunks`);
      const chunks = DocumentChunkingService.generateChunks({
        documentId,
        workspaceId,
        rawText: cleaned.cleanedText,
        sections: cleaned.cleanedSections,
      });

      if (chunks.length === 0) {
        throw new Error("Chunking algorithm generated zero chunks. Document content may be too short.");
      }
      console.log(`[Document Chunking Success] Generated ${chunks.length} chunks`);

      // 6. Stage: Metadata Generation (via Groq LLM or heuristic fallback)
      console.log(`[Metadata Generation] Extracting document metadata and AI topics`);
      const metadata = await MetadataGenerationService.generateMetadata(
        fileName,
        cleaned.cleanedText,
        extracted.headings,
        chunks.length,
        workspaceId
      );
      console.log(
        `[Metadata Generation Success] Title: "${metadata.title}", Subject: "${metadata.subject}", Keywords: ${metadata.keywords.join(", ")}, Read Time: ${metadata.readingTimeMinutes}m, Tokens: ${metadata.estimatedTokens}`
      );

      // 7. Stage: Embedding Generation
      await KnowledgeStorageService.updateDocumentStatus(supabase, documentId, "embedding");
      const embeddingProvider = getActiveEmbeddingProvider();
      console.log(`[Embedding Generation] Generating vectors using provider "${embeddingProvider.name}"`);
      const chunkTexts = chunks.map((c) => `${c.heading ? c.heading + "\n" : ""}${c.content}`);
      const embeddings = await embeddingProvider.generateBatchEmbeddings(chunkTexts);
      console.log(`[Embedding Generation Success] Generated ${embeddings.length} embedding vectors`);

      // 8. Stage: Knowledge Storage & Finalization
      console.log(`[Knowledge Storage] Persisting chunks and finalizing document status as "ready"`);
      await KnowledgeStorageService.saveKnowledgeChunks(supabase, documentId, workspaceId, chunks, embeddings);
      await KnowledgeStorageService.finalizeDocumentProcessing(supabase, documentId, metadata);
      console.log(`[Pipeline Complete] Document ${documentId} is 100% indexed and Ready for AI Search`);

      return {
        success: true,
        metadata,
        chunks,
      };
    } catch (err: any) {
      const errorMessage = err?.message || "Unknown error during document processing";
      console.error(`[Pipeline Failed] Document ${documentId}:`, errorMessage);
      await KnowledgeStorageService.updateDocumentStatus(supabase, documentId, "failed", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
