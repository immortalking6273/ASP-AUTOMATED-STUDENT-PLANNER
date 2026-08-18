/**
 * Text Cleaning Service
 * Normalizes spacing, repairs broken line breaks, and cleans invalid characters
 * while preserving markdown structure, headings, lists, and code blocks.
 */

import { ExtractedSection } from "./text-extraction-service";

export interface CleaningOptions {
  normalizeWhitespace?: boolean;
  fixHyphenatedWords?: boolean;
  removeControlChars?: boolean;
  preserveCodeBlocks?: boolean;
}

export class TextCleaningService {
  /**
   * Clean raw text and sections
   */
  static cleanText(
    rawText: string,
    sections: ExtractedSection[],
    options: CleaningOptions = {}
  ): { cleanedText: string; cleanedSections: ExtractedSection[] } {
    const normalize = options.normalizeWhitespace ?? true;
    const fixHyphenation = options.fixHyphenatedWords ?? true;
    const removeControl = options.removeControlChars ?? true;

    // 1. Remove non-printable control characters (except newline \n and tab \t)
    let cleaned = rawText;
    if (removeControl) {
      cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
    }

    // 2. Fix hyphenated word breaks at end of line (e.g., "stud-\nent" -> "student")
    if (fixHyphenation) {
      cleaned = cleaned.replace(/(\w+)-\r?\n(\w+)/g, "$1$2");
    }

    // 3. Normalize multiple spaces & blank lines
    if (normalize) {
      // Replace horizontal tab and multiple spaces with a single space
      cleaned = cleaned.replace(/[ \t]+/g, " ");
      // Replace 3+ consecutive newlines with 2 newlines (preserving paragraph breaks)
      cleaned = cleaned.replace(/(\r?\n){3,}/g, "\n\n");
    }

    // 4. Clean each extracted section
    const cleanedSections: ExtractedSection[] = sections
      .map((sec) => {
        let content = sec.content;
        if (removeControl) {
          content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
        }
        if (sec.type !== "code" && normalize) {
          content = content.replace(/\s+/g, " ").trim();
        }
        return {
          ...sec,
          content,
        };
      })
      .filter((sec) => sec.content.length > 0);

    return {
      cleanedText: cleaned.trim(),
      cleanedSections,
    };
  }
}
