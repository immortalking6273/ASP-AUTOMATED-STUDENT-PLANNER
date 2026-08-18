/**
 * Text Extraction Service
 * Extract raw text, headings, paragraphs, lists, and tables from PDF, DOCX, PPTX, TXT, and Markdown.
 * Uses official pdf-parse (v1.1.1) for robust PDF text extraction and strict UTF-8 sanitization
 * to guarantee no binary/compressed byte garbage or PDF stream headers enter the RAG vector pipeline.
 *
 * SERVER-ONLY: This module uses pdf-parse which depends on Node.js `fs`. It must never be
 * imported by client components or any module that is part of the client bundle.
 */
import "server-only";
import { sanitizeHumanReadableText as sharedSanitize } from "@/lib/text-sanitizer";
import { UnstructuredExtractionService, UnstructuredElement } from "./unstructured-extraction-service";

export interface ExtractedSection {
  type: "heading" | "paragraph" | "list" | "table" | "code";
  level?: number;
  content: string;
  pageNumber?: number;
}

export interface TextExtractionResult {
  rawText: string;
  sections: ExtractedSection[];
  headings: string[];
  fileType: string;
  charCount: number;
  metadata: {
    title?: string;
    extractedAt: string;
    format: string;
    pageCount?: number;
    elementCount?: number;
  };
}

export class TextExtractionService {
  /**
   * Sanitize text to ensure only human-readable UTF-8 characters proceed to RAG pipeline.
   * Strips control characters, PDF object stream noise, and binary byte artifacts.
   */
  public static sanitizeHumanReadableText(text: string): string {
    return sharedSanitize(text);
  }

  /**
   * Extract content from array buffer or string based on file extension
   */
  static async extractText(
    buffer: ArrayBuffer | string,
    fileExtension: string,
    originalFileName: string
  ): Promise<TextExtractionResult> {
    const ext = fileExtension.toLowerCase().replace(/^\./, "");
    let rawText = "";
    let format = ext;
    let pageCount: number | undefined = undefined;
    let sections: ExtractedSection[] = [];

    if (typeof buffer === "string") {
      rawText = buffer;
      sections = this.parseStructuredSections(rawText, ext);
    } else {
      const bufferObj = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
      console.log(`[TextExtractionService] Buffer size: ${bufferObj.byteLength} bytes for "${originalFileName}"`);

      try {
        // Primary path: Use FastAPI extraction service
        const unstructuredResult = await UnstructuredExtractionService.extractDocument(bufferObj, originalFileName);
        
        rawText = unstructuredResult.text || "";
        
        if (!rawText || rawText.trim().length === 0) {
          throw new Error(`Extracted document text from "${originalFileName}" is empty.`);
        }

        // Map elements to ExtractedSections
        if (unstructuredResult.elements && unstructuredResult.elements.length > 0) {
          sections = unstructuredResult.elements.map((el) => this.mapUnstructuredElementToSection(el));

          // Calculate page count if present in element metadata
          let maxPage = 0;
          unstructuredResult.elements.forEach((el) => {
            if (typeof el.metadata?.page_number === "number" && el.metadata.page_number > maxPage) {
              maxPage = el.metadata.page_number;
            }
          });
          if (maxPage > 0) {
            pageCount = maxPage;
          }
        }
      } catch (unstructuredErr: any) {
        console.error(
          `[TextExtractionService Error] Extraction service failed for "${originalFileName}":`,
          unstructuredErr?.message || unstructuredErr
        );
        throw new Error(
          `Document extraction service error: ${unstructuredErr?.message || "Extraction service failed"}`
        );
      }
    }

    // Sanitize text to ensure 100% human-readable output
    const sanitizedText = this.sanitizeHumanReadableText(rawText);

    if (!sanitizedText || sanitizedText.trim().length === 0) {
      throw new Error("Document contains no extractable text.");
    }

    const finalRawText = sanitizedText;

    if (sections.length === 0) {
      sections = this.parseStructuredSections(finalRawText, ext);
    }

    const headings = sections
      .filter((s) => s.type === "heading")
      .map((s) => s.content.trim());

    return {
      rawText: finalRawText,
      sections,
      headings,
      fileType: format,
      charCount: finalRawText.length,
      metadata: {
        title: this.cleanDocTitle(originalFileName),
        extractedAt: new Date().toISOString(),
        format,
        pageCount,
        elementCount: sections.length,
      },
    };
  }

  /**
   * Map an UnstructuredElement to an ASP ExtractedSection
   */
  private static mapUnstructuredElementToSection(element: UnstructuredElement): ExtractedSection {
    const category = (element.type || "").toLowerCase();
    const content = element.text || "";
    const pageNumber = element.metadata?.page_number;

    if (["title", "header", "subheadline", "heading"].includes(category)) {
      return {
        type: "heading",
        level: category === "title" ? 1 : 2,
        content,
        pageNumber,
      };
    }

    if (["listitem", "list-item", "bullet"].includes(category)) {
      return {
        type: "list",
        content,
        pageNumber,
      };
    }

    if (["table"].includes(category)) {
      return {
        type: "table",
        content,
        pageNumber,
      };
    }

    if (["code", "codesnippet", "code_snippet"].includes(category)) {
      return {
        type: "code",
        content,
        pageNumber,
      };
    }

    return {
      type: "paragraph",
      content,
      pageNumber,
    };
  }


  /**
   * Clean filename to human title
   */
  private static cleanDocTitle(fileName: string): string {
    return fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Fallback text extractor for PDF buffer streams if pdf-parse fails
   */
  private static fallbackPdfExtraction(buffer: Buffer, fileName: string): string {
    const str = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    const textMatches = str.match(/\(([^()]{1,})\)\s*T[jJ]/g);

    if (textMatches && textMatches.length > 0) {
      const chunks = textMatches
        .map((m) => m.replace(/^\(/, "").replace(/\)\s*T[jJ]$/, "").trim())
        .filter((c) => c.length > 0 && /^[a-zA-Z0-9\s.,!?-]+$/.test(c));

      if (chunks.length > 0) {
        return chunks.join(" ");
      }
    }

    // Filter printable words excluding PDF stream keywords
    const printable = str.replace(/[^\x20-\x7E\n]/g, " ");
    const words = printable
      .split(/\s+/)
      .filter((w) => w.length >= 2 && /^[a-zA-Z0-9]+$/.test(w))
      .filter((w) => !["stream", "endstream", "endobj", "trailer", "xref", "obj", "font", "subtype"].includes(w.toLowerCase()));

    if (words.length > 0) {
      return words.join(" ");
    }

    return `Document Title: ${this.cleanDocTitle(fileName)}`;
  }

  /**
   * XML Text extractor for DOCX/PPTX archive streams
   */
  private static extractFromXmlArchive(
    buffer: Buffer,
    targetPattern: string,
    fileName: string
  ): string {
    const raw = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    const tagRegex = /<[wa]:t[^>]*>([^<]+)<\/[wa]:t>/g;
    const textNodes: string[] = [];
    let match;

    while ((match = tagRegex.exec(raw)) !== null) {
      if (match[1] && match[1].trim()) {
        textNodes.push(match[1].trim());
      }
    }

    if (textNodes.length > 0) {
      return textNodes.join(" ");
    }

    const printable = raw.replace(/<[^>]+>/g, " ").replace(/[^\x20-\x7E\n]/g, " ");
    const words = printable.split(/\s+/).filter((w) => w.length > 2 && /^[a-zA-Z0-9.,-]+$/.test(w));
    return words.join(" ") || `Document: ${this.cleanDocTitle(fileName)}`;
  }

  /**
   * Parse extracted raw text into structured headings, paragraphs, lists, code blocks
   */
  private static parseStructuredSections(text: string, ext: string): ExtractedSection[] {
    const lines = text.split(/\r?\n/);
    const sections: ExtractedSection[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const content = currentParagraph.join(" ").trim();
        if (content.length > 0) {
          sections.push({ type: "paragraph", content });
        }
        currentParagraph = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushParagraph();
        continue;
      }

      if (/^#{1,6}\s+/.test(line)) {
        flushParagraph();
        const level = (line.match(/^#+/) || ["#"])[0].length;
        const content = line.replace(/^#{1,6}\s+/, "").trim();
        sections.push({ type: "heading", level, content });
      } else if (/^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
        flushParagraph();
        const content = line.replace(/^([-*+]\s+|\d+\.\s+)/, "").trim();
        sections.push({ type: "list", content });
      } else if (line.startsWith("```")) {
        flushParagraph();
        sections.push({ type: "code", content: line });
      } else if (
        line.length < 80 &&
        line === line.toUpperCase() &&
        /^[A-Z0-9\s:,-]+$/.test(line) &&
        !line.endsWith(".")
      ) {
        flushParagraph();
        sections.push({ type: "heading", level: 2, content: line });
      } else {
        currentParagraph.push(line);
      }
    }

    flushParagraph();

    if (sections.length === 0 && text.trim().length > 0) {
      sections.push({ type: "paragraph", content: text.trim() });
    }

    return sections;
  }
}
