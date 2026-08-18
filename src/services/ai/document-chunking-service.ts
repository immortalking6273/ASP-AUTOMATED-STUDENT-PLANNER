/**
 * Document Chunking Service
 * Implements semantic, heading-aware, and sliding window chunking algorithms.
 * Handles large paragraph blocks by applying sliding window sub-splitting when
 * a single section exceeds the target chunk size.
 */

import { ExtractedSection } from "./text-extraction-service";
import { isValidChunkText } from "@/lib/text-sanitizer";

export interface DocumentChunkInput {
  documentId: string;
  workspaceId: string;
  rawText: string;
  sections: ExtractedSection[];
  targetChunkSize?: number; // Target characters per chunk (default: 1500 ~ 375 tokens)
  chunkOverlap?: number;    // Character overlap (default: 200)
}

export interface GeneratedChunk {
  id?: string;
  documentId: string;
  workspaceId: string;
  chunkIndex: number;
  content: string;
  heading: string | null;
  characterCount: number;
  tokenEstimate: number;
  metadata: {
    headingHierarchy: string[];
    sectionType: string;
    startChar: number;
    endChar: number;
  };
}

export class DocumentChunkingService {
  /**
   * Estimate token count from character count (standard heuristic ~4 chars per token for English text)
   */
  static estimateTokens(text: string): number {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    const charBased = Math.ceil(text.length / 4);
    return Math.max(words, charBased);
  }

  /**
   * Semantic chunking: groups sections by heading boundary and size constraints.
   * Large paragraph blocks are automatically sub-chunked using a sliding window.
   */
  static generateChunks(input: DocumentChunkInput): GeneratedChunk[] {
    const {
      documentId,
      workspaceId,
      rawText,
      sections,
      targetChunkSize = 1500,
      chunkOverlap = 200,
    } = input;

    const chunks: GeneratedChunk[] = [];
    let currentHeading = "Overview";
    let headingHierarchy: string[] = ["Overview"];
    let currentBuffer: string[] = [];
    let currentBufferLength = 0;
    let chunkIndex = 0;
    let charOffset = 0;

    const finalizeChunk = (sectionType: string = "paragraph") => {
      if (currentBuffer.length === 0) return;

      const content = currentBuffer.join("\n\n").trim();
      if (content.length === 0) return;

      // If the buffered content is still larger than target, split via sliding window
      if (content.length > targetChunkSize * 1.5) {
        const subChunks = this.slidingWindowChunking(
          documentId,
          workspaceId,
          content,
          targetChunkSize,
          chunkOverlap,
          chunkIndex,
          charOffset,
          currentHeading,
          headingHierarchy,
          sectionType
        );
        chunks.push(...subChunks);
        chunkIndex += subChunks.length;
        charOffset += content.length;
      } else {
        const tokenEst = this.estimateTokens(content);
        const startChar = charOffset;
        const endChar = charOffset + content.length;
        charOffset = endChar;

        chunks.push({
          documentId,
          workspaceId,
          chunkIndex,
          content,
          heading: currentHeading,
          characterCount: content.length,
          tokenEstimate: tokenEst,
          metadata: {
            headingHierarchy: [...headingHierarchy],
            sectionType,
            startChar,
            endChar,
          },
        });
        chunkIndex++;
      }
    };

    if (!sections || sections.length === 0) {
      // Fallback: sliding window on raw text
      return this.slidingWindowChunking(
        documentId,
        workspaceId,
        rawText,
        targetChunkSize,
        chunkOverlap,
        0,
        0,
        "Overview",
        ["Overview"],
        "window"
      );
    }

    for (const section of sections) {
      if (section.type === "heading") {
        // Heading boundary: finalize prior chunk if non-empty
        if (currentBufferLength > 200) {
          finalizeChunk("heading-group");
          currentBuffer = [];
          currentBufferLength = 0;
        }

        currentHeading = section.content;
        const level = section.level || 1;
        headingHierarchy = headingHierarchy.slice(0, level - 1);
        headingHierarchy.push(section.content);

        currentBuffer.push(`## ${section.content}`);
        currentBufferLength += section.content.length + 5;
      } else {
        const text = section.content;

        // If a single section text alone exceeds target size, flush and sub-chunk it directly
        if (text.length > targetChunkSize) {
          // First flush any existing buffer
          if (currentBufferLength > 0) {
            finalizeChunk(section.type);
            currentBuffer = [];
            currentBufferLength = 0;
          }
          // Sub-chunk the large section text via sliding window
          const subChunks = this.slidingWindowChunking(
            documentId,
            workspaceId,
            text,
            targetChunkSize,
            chunkOverlap,
            chunkIndex,
            charOffset,
            currentHeading,
            headingHierarchy,
            section.type
          );
          chunks.push(...subChunks);
          chunkIndex += subChunks.length;
          charOffset += text.length;
          continue;
        }

        if (currentBufferLength + text.length > targetChunkSize && currentBufferLength > 0) {
          finalizeChunk(section.type);

          // Overlap: keep previous item if within overlap window
          const lastItem = currentBuffer[currentBuffer.length - 1];
          currentBuffer = lastItem && lastItem.length <= chunkOverlap ? [lastItem] : [];
          currentBufferLength = currentBuffer.reduce((sum, s) => sum + s.length, 0);
        }

        currentBuffer.push(text);
        currentBufferLength += text.length;
      }
    }

    finalizeChunk("final-group");

    // If chunking yielded nothing, fallback to sliding window
    if (chunks.length === 0 && rawText.trim().length > 0) {
      return this.slidingWindowChunking(
        documentId,
        workspaceId,
        rawText,
        targetChunkSize,
        chunkOverlap,
        0,
        0,
        "Overview",
        ["Overview"],
        "window"
      );
    }

    return chunks.filter((c) => isValidChunkText(c.content));
  }

  /**
   * Sliding window chunker — used as fallback and for large single sections
   */
  private static slidingWindowChunking(
    documentId: string,
    workspaceId: string,
    text: string,
    chunkSize: number = 1500,
    overlap: number = 200,
    startIndex: number = 0,
    startCharOffset: number = 0,
    heading: string = "Overview",
    headingHierarchy: string[] = ["Overview"],
    sectionType: string = "window"
  ): GeneratedChunk[] {
    const chunks: GeneratedChunk[] = [];
    const step = Math.max(chunkSize - overlap, 300);
    let localIndex = 0;

    for (let i = 0; i < text.length; i += step) {
      // Try to break at a sentence boundary within a tolerance range
      let end = i + chunkSize;
      if (end < text.length) {
        const boundary = text.lastIndexOf(".", end);
        if (boundary > i + Math.floor(chunkSize * 0.6)) {
          end = boundary + 1;
        }
      }

      const slice = text.slice(i, end).trim();
      if (!slice || slice.length < 50) continue;

      const label = localIndex === 0 ? heading : `${heading} (cont. ${localIndex + 1})`;

      chunks.push({
        documentId,
        workspaceId,
        chunkIndex: startIndex + localIndex,
        content: slice,
        heading: label,
        characterCount: slice.length,
        tokenEstimate: this.estimateTokens(slice),
        metadata: {
          headingHierarchy: [...headingHierarchy],
          sectionType,
          startChar: startCharOffset + i,
          endChar: startCharOffset + Math.min(end, i + slice.length),
        },
      });

      localIndex++;
    }

    return chunks;
  }
}
