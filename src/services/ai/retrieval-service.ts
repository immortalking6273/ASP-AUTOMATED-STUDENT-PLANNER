import "server-only";

import { DocumentChunkRow } from "@/types/database";
import { getActiveEmbeddingProvider } from "./embedding-provider";
import { sanitizeHumanReadableText, isValidChunkText } from "@/lib/text-sanitizer";
import { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface SearchOptions {
  candidateLimit?: number;
  rerankLimit?: number;
  minSimilarity?: number;
  documentIds?: string[];
  headings?: string[];
}

export interface SearchResultChunk {
  chunk: DocumentChunkRow;
  similarityScore: number; // Combined final score (0.0 to 1.0)
  vectorScore: number;     // Cosine similarity
  keywordScore: number;    // Keyword overlap
  headingScore: number;    // Section/heading match
  titleScore: number;      // Document title match
  phraseScore: number;     // Verbatim phrase match
  elementType: string;     // Unstructured element category
  pageNumber?: number;     // Page number from metadata
  documentTitle: string;   // Document name
}

export interface RetrievalResult {
  chunks: SearchResultChunk[];
  confidenceLevel: ConfidenceLevel;
  topScore: number;
  averageTopScore: number;
  candidateCount: number;
  retrievalDurationMs: number;
  docMap: Map<string, string>;
}

export class RetrievalService {
  private static readonly STOP_WORDS = new Set([
    "what", "is", "a", "an", "the", "in", "on", "at", "for", "to", "of", "with", "and", "or",
    "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "can", "could", "should", "would", "will", "shall", "may", "might", "must", "tell", "me",
    "about", "explain", "how", "why", "which", "where", "who", "whom", "this", "that", "these",
    "those", "give", "list", "show", "describe", "define"
  ]);

  /**
   * Normalize user query for retrieval
   */
  public static normalizeQuery(query: string): string {
    return (query || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  /**
   * Calculate keyword overlap score (0.0 to 1.0) with stopword filtering & stemming
   */
  private static calculateKeywordOverlap(query: string, content: string): number {
    const allWords = (query || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1);

    const meaningfulWords = allWords.filter((w) => !this.STOP_WORDS.has(w));
    const targetWords = meaningfulWords.length > 0 ? meaningfulWords : allWords;

    if (targetWords.length === 0) return 0;

    const contentLower = (content || "").toLowerCase();
    let matches = 0;

    for (const word of targetWords) {
      const stem = word.endsWith("s") && word.length > 3 ? word.slice(0, -1) : word;
      if (contentLower.includes(word) || contentLower.includes(stem)) {
        matches++;
      }
    }

    return Number((matches / targetWords.length).toFixed(4));
  }

  /**
   * Calculate heading match score
   */
  private static calculateHeadingMatch(query: string, heading: string | null): number {
    if (!heading) return 0;
    const hLower = heading.toLowerCase();
    const qWords = (query || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !this.STOP_WORDS.has(w));

    if (qWords.length === 0) return 0;

    let hits = 0;
    for (const w of qWords) {
      if (hLower.includes(w)) hits++;
    }

    return Number((hits / qWords.length).toFixed(4));
  }

  /**
   * Calculate document title match score
   */
  private static calculateTitleMatch(query: string, docTitle: string): number {
    if (!docTitle) return 0;
    const tLower = docTitle.toLowerCase();
    const qWords = (query || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !this.STOP_WORDS.has(w));

    if (qWords.length === 0) return 0;

    let hits = 0;
    for (const w of qWords) {
      if (tLower.includes(w)) hits++;
    }

    return Number((hits / qWords.length).toFixed(4));
  }

  /**
   * Calculate exact phrase match score
   */
  private static calculatePhraseMatch(query: string, content: string): number {
    const cleanQuery = (query || "").trim().toLowerCase();
    if (cleanQuery.length < 4) return 0;

    const contentLower = (content || "").toLowerCase();
    return contentLower.includes(cleanQuery) ? 1.0 : 0.0;
  }

  /**
   * Cosine similarity helper
   */
  private static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.max(0, Math.min(1, sim));
  }

  /**
   * Compute text similarity ratio for deduplication (0.0 to 1.0)
   */
  private static textOverlapRatio(textA: string, textB: string): number {
    if (!textA || !textB) return 0;
    if (textA === textB) return 1.0;

    const setA = new Set(textA.toLowerCase().split(/\s+/));
    const setB = new Set(textB.toLowerCase().split(/\s+/));
    let intersection = 0;

    for (const w of setA) {
      if (setB.has(w)) intersection++;
    }

    const minSize = Math.min(setA.size, setB.size);
    if (minSize === 0) return 0;

    return intersection / minSize;
  }

  /**
   * Main High-Confidence Strict Hybrid RAG Retrieval Engine
   */
  static async retrieveContext(
    supabase: SupabaseClient,
    workspaceId: string,
    queryText: string,
    options: SearchOptions = {}
  ): Promise<RetrievalResult> {
    const startTime = performance.now();
    const candidateLimit = options.candidateLimit ?? 20;
    const rerankLimit = options.rerankLimit ?? 6;

    // 1. Generate query vector embedding
    const embeddingProvider = getActiveEmbeddingProvider();
    const queryEmb = await embeddingProvider.generateEmbedding(queryText);

    // 2. Fetch candidate chunks for target workspace (enforcing RLS & workspace isolation)
    let candidateQuery = supabase
      .from("document_chunks")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (options.documentIds && options.documentIds.length > 0) {
      candidateQuery = candidateQuery.in("document_id", options.documentIds);
    }

    let { data: rawChunks, error } = await candidateQuery;
    if (error) {
      console.error("[ RAG ] Candidate chunk fetch database error:", error);
      throw error;
    }

    // Fallback: If documentIds filter returned 0 chunks, retry querying workspace wide
    if ((!rawChunks || rawChunks.length === 0) && options.documentIds && options.documentIds.length > 0) {
      const fallbackQuery = await supabase
        .from("document_chunks")
        .select("*")
        .eq("workspace_id", workspaceId);
      rawChunks = fallbackQuery.data;
    }

    const candidateChunks = (rawChunks || []) as DocumentChunkRow[];

    if (candidateChunks.length === 0) {
      if (env.RAG_DEBUG) {
        console.log(`[ RAG ] 0 candidates found for workspaceId=${workspaceId}`);
      }
      return {
        chunks: [],
        confidenceLevel: "LOW",
        topScore: 0,
        averageTopScore: 0,
        candidateCount: 0,
        retrievalDurationMs: Number((performance.now() - startTime).toFixed(1)),
        docMap: new Map(),
      };
    }

    // Fetch document metadata map for document titles
    const docIds = Array.from(new Set(candidateChunks.map((c) => c.document_id)));
    const docMap = new Map<string, string>();
    if (docIds.length > 0) {
      const { data: docs } = await supabase
        .from("uploaded_documents")
        .select("id, display_name, original_name")
        .in("id", docIds);

      if (docs) {
        docs.forEach((d: any) => {
          docMap.set(d.id, d.display_name || d.original_name || "Document");
        });
      }
    }

    // 3. Multi-Signal Hybrid Reranking (Stage 2)
    const scoredCandidates: SearchResultChunk[] = [];

    for (const rawChunk of candidateChunks) {
      const sanitized = sanitizeHumanReadableText(rawChunk.content);
      if (!isValidChunkText(sanitized)) {
        if (env.RAG_DEBUG) {
          console.log(`[RAG_VALIDATION] Rejected invalid chunk content during retrieval (chunk ${rawChunk.id})`);
        }
        continue;
      }

      const chunk: DocumentChunkRow = { ...rawChunk, content: sanitized };
      const docTitle = docMap.get(chunk.document_id) || "Document";
      const metadata = (chunk.metadata as any) || {};

      const vecScore = this.cosineSimilarity(queryEmb.embedding, (chunk.embedding as number[]) || []);
      const kwScore = this.calculateKeywordOverlap(queryText, sanitized);
      const headingScore = this.calculateHeadingMatch(queryText, chunk.heading || metadata.heading || null);
      const titleScore = this.calculateTitleMatch(queryText, docTitle);
      const phraseScore = this.calculatePhraseMatch(queryText, sanitized);
      const elementType = metadata.type || metadata.category || (chunk.heading ? "Header" : "NarrativeText");
      const pageNumber = metadata.page_number ?? metadata.page ?? undefined;

      // Weighted Multi-Signal Combination:
      // Preserves vector match baseline while boosting for keyword, heading, title, and phrase signals
      const weightedSignal = 0.40 * vecScore + 0.25 * kwScore + 0.15 * headingScore + 0.10 * titleScore + 0.10 * phraseScore;
      const compositeScore = Number(Math.max(vecScore, weightedSignal).toFixed(4));

      scoredCandidates.push({
        chunk,
        similarityScore: compositeScore,
        vectorScore: vecScore,
        keywordScore: kwScore,
        headingScore,
        titleScore,
        phraseScore,
        elementType,
        pageNumber,
        documentTitle: docTitle,
      });
    }

    // Sort candidates by composite similarity score descending
    scoredCandidates.sort((a, b) => b.similarityScore - a.similarityScore);
    const topCandidates = scoredCandidates.slice(0, candidateLimit);

    // 4. Deduplication: Filter out near-identical chunks (>85% text overlap)
    const deduplicated: SearchResultChunk[] = [];
    for (const cand of topCandidates) {
      let isDuplicate = false;
      for (const existing of deduplicated) {
        if (existing.chunk.document_id === cand.chunk.document_id && this.textOverlapRatio(cand.chunk.content, existing.chunk.content) > 0.85) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        deduplicated.push(cand);
      }
    }

    // 5. Contiguous Neighboring Chunk Expansion
    const finalChunks: SearchResultChunk[] = [];
    const includedChunkIds = new Set<string>();

    for (const item of deduplicated.slice(0, rerankLimit)) {
      if (!includedChunkIds.has(item.chunk.id)) {
        finalChunks.push(item);
        includedChunkIds.add(item.chunk.id);
      }

      // Check if neighboring chunk exists in top candidates to preserve explanation flow
      const neighbor = candidateChunks.find(
        (c) =>
          c.document_id === item.chunk.document_id &&
          c.chunk_index === item.chunk.chunk_index + 1 &&
          !includedChunkIds.has(c.id)
      );

      if (neighbor && finalChunks.length < rerankLimit) {
        const nSanitized = sanitizeHumanReadableText(neighbor.content);
        if (nSanitized && nSanitized.length >= 10) {
          const nDocTitle = docMap.get(neighbor.document_id) || "Document";
          const nMeta = (neighbor.metadata as any) || {};
          const nVecScore = this.cosineSimilarity(queryEmb.embedding, (neighbor.embedding as number[]) || []);
          const nKwScore = this.calculateKeywordOverlap(queryText, nSanitized);

          finalChunks.push({
            chunk: { ...neighbor, content: nSanitized },
            similarityScore: Number((0.5 * nVecScore + 0.5 * nKwScore).toFixed(4)),
            vectorScore: nVecScore,
            keywordScore: nKwScore,
            headingScore: 0,
            titleScore: 0,
            phraseScore: 0,
            elementType: nMeta.type || "NarrativeText",
            pageNumber: nMeta.page_number ?? nMeta.page ?? undefined,
            documentTitle: nDocTitle,
          });
          includedChunkIds.add(neighbor.id);
        }
      }
    }

    // 6. Calculate Confidence Level
    const topScore = finalChunks.length > 0 ? finalChunks[0].similarityScore : 0;
    const avgScore =
      finalChunks.length > 0
        ? Number((finalChunks.reduce((acc, c) => acc + c.similarityScore, 0) / finalChunks.length).toFixed(4))
        : 0;

    let confidenceLevel: ConfidenceLevel = "LOW";
    if (topScore >= env.RAG_HIGH_CONFIDENCE_THRESHOLD) {
      confidenceLevel = "HIGH";
    } else if (topScore >= env.RAG_MEDIUM_CONFIDENCE_THRESHOLD || (options.documentIds && options.documentIds.length > 0 && finalChunks.length > 0)) {
      confidenceLevel = "MEDIUM";
    }

    const durationMs = Number((performance.now() - startTime).toFixed(1));

    // Structured server-side RAG logging
    if (env.RAG_DEBUG) {
      console.log(`[ RAG ] Query: "${queryText}" | Workspace: ${workspaceId}`);
      console.log(`[ RAG ] Candidates: ${candidateChunks.length} | Selected: ${finalChunks.length} | Duration: ${durationMs}ms`);
      console.log(`[ RAG ] Top Score: ${topScore} | Avg Score: ${avgScore} | Confidence: ${confidenceLevel}`);
      if (finalChunks.length > 0) {
        console.log(`[ RAG Top Document ] "${finalChunks[0].documentTitle}" (Section: "${finalChunks[0].chunk.heading || 'N/A'}", Score: ${finalChunks[0].similarityScore})`);
      }
    }

    return {
      chunks: finalChunks,
      confidenceLevel,
      topScore,
      averageTopScore: avgScore,
      candidateCount: candidateChunks.length,
      retrievalDurationMs: durationMs,
      docMap,
    };
  }

  /**
   * Backwards-compatible legacy method wrapper
   */
  static async searchWorkspaceChunks(
    supabase: SupabaseClient,
    workspaceId: string,
    queryText: string,
    options: SearchOptions = {}
  ): Promise<SearchResultChunk[]> {
    const res = await this.retrieveContext(supabase, workspaceId, queryText, options);
    return res.chunks;
  }

  /**
   * Fetch all chunks for a specific document
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

    return ((data || []) as DocumentChunkRow[]).map((c) => ({
      ...c,
      content: sanitizeHumanReadableText(c.content),
    }));
  }
}
