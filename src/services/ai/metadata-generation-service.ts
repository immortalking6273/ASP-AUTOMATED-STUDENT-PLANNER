/**
 * Metadata Generation Service
 * Extracts metadata (Title, Author, Subject, Keywords, Language, Reading Time, Token Counts)
 * using Groq LLM when available, backed by heuristic fallback rules.
 */

import { NvidiaNimProvider } from "./nvidia-nim-provider";
import { GroqProvider } from "./groq-provider";
import { DocumentChunkingService } from "./document-chunking-service";

export interface DocumentMetadata {
  title: string;
  author: string | null;
  subject: string | null;
  keywords: string[];
  language: string;
  readingTimeMinutes: number;
  estimatedTokens: number;
  totalChunks: number;
  extractedAt: string;
}

export class MetadataGenerationService {
  /**
   * Generate comprehensive metadata for document
   */
  static async generateMetadata(
    fileName: string,
    rawText: string,
    headings: string[],
    chunkCount: number,
    workspaceId: string
  ): Promise<DocumentMetadata> {
    const estimatedTokens = DocumentChunkingService.estimateTokens(rawText);
    const words = rawText.trim().split(/\s+/).length;
    // Average reading speed: 200 words per minute
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

    // Default heuristic metadata
    let title = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
    let author: string | null = null;
    let subject: string | null = headings[0] || "Educational Material";
    let keywords: string[] = this.extractHeuristicKeywords(rawText, headings);
    let language = this.detectLanguageHeuristic(rawText);

    // AI Enrichment via NVIDIA NIM (or fallback Groq) if configured
    const isNvidiaConfigured = NvidiaNimProvider.isConfigured();
    const isGroqConfigured = GroqProvider.isConfigured();

    if ((isNvidiaConfigured || isGroqConfigured) && rawText.length > 50) {
      const sampleText = rawText.slice(0, 2000);
      const prompt = `Analyze this document text sample and extract key metadata in valid JSON format:
Text Sample:
"""
${sampleText}
"""

Return JSON matching this exact structure:
{
  "suggestedTitle": "Short descriptive document title",
  "author": "Author name or null",
  "subject": "Core academic subject area (e.g., Computer Science, Biology, History)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "language": "English, Spanish, French, etc."
}`;

      type MetaResult = {
        suggestedTitle?: string;
        author?: string;
        subject?: string;
        keywords?: string[];
        language?: string;
      };

      const aiMeta = isNvidiaConfigured
        ? await NvidiaNimProvider.completeJson<MetaResult>(prompt)
        : await GroqProvider.completeJson<MetaResult>(prompt);

      if (aiMeta) {
        if (aiMeta.suggestedTitle && aiMeta.suggestedTitle.length > 3) {
          title = aiMeta.suggestedTitle;
        }
        if (aiMeta.author) author = aiMeta.author;
        if (aiMeta.subject) subject = aiMeta.subject;
        if (Array.isArray(aiMeta.keywords) && aiMeta.keywords.length > 0) {
          keywords = aiMeta.keywords.slice(0, 8);
        }
        if (aiMeta.language) language = aiMeta.language;
      }
    }

    return {
      title,
      author,
      subject,
      keywords,
      language,
      readingTimeMinutes,
      estimatedTokens,
      totalChunks: chunkCount,
      extractedAt: new Date().toISOString(),
    };
  }

  /**
   * Rule-based keyword extraction fallback
   */
  private static extractHeuristicKeywords(text: string, headings: string[]): string[] {
    const candidates = new Set<string>();

    // Add headings as primary keywords
    headings.slice(0, 4).forEach((h) => {
      if (h.length > 3 && h.length < 30) candidates.add(h.toLowerCase());
    });

    // Frequency scan for capitalized words/terms
    const words = text.match(/\b[A-Z][a-z]{3,}\b/g) || [];
    const counts: Record<string, number> = {};
    words.forEach((w) => {
      const lower = w.toLowerCase();
      if (!["This", "That", "There", "Their", "Which", "Where", "When", "What"].includes(w)) {
        counts[lower] = (counts[lower] || 0) + 1;
      }
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([w]) => w);

    sorted.forEach((w) => candidates.add(w));

    return Array.from(candidates).slice(0, 6);
  }

  /**
   * Simple language detection heuristic
   */
  private static detectLanguageHeuristic(text: string): string {
    const sample = text.slice(0, 1000).toLowerCase();
    if (/\b(the|and|is|in|to|of|for|with)\b/.test(sample)) return "English";
    if (/\b(el|la|los|las|de|en|y|que)\b/.test(sample)) return "Spanish";
    if (/\b(le|la|les|de|et|un|une)\b/.test(sample)) return "French";
    if (/\b(der|die|das|und|ist|in)\b/.test(sample)) return "German";
    return "English";
  }
}
