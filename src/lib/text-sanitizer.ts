/**
 * Text Sanitizer — pure string operations, zero Node.js dependencies.
 *
 * This module is intentionally kept free of any server-only imports so it can be
 * used safely in both server and client contexts.  The full PDF extraction logic
 * lives in TextExtractionService (server-only).
 */

/**
 * Sanitize raw extracted text to guarantee only human-readable UTF-8 content
 * flows into the RAG vector pipeline.  Strips control characters, PDF stream
 * markers, binary noise, and normalises whitespace.
 */
export function sanitizeHumanReadableText(text: string): string {
  if (!text) return "";

  // 1. Remove non-printable control characters (keep \n, \r, \t)
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");

  // 2. Filter out PDF object streams and xref table artifacts
  cleaned = cleaned.replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, " ");
  cleaned = cleaned.replace(/\b\d{10}\s+\d{5}\s+[fn]\b/gi, " ");
  cleaned = cleaned.replace(/(?:xref|trailer|startxref|endstream|endobj)\s*/gi, " ");

  // 3. Fix hyphenated line breaks (e.g. "comput-\ner" → "computer")
  cleaned = cleaned.replace(/(\w+)-\r?\n(\w+)/g, "$1$2");

  // 4. Normalise multiple spaces & excessive blank lines
  cleaned = cleaned.replace(/[ \t]+/g, " ");
  cleaned = cleaned.replace(/(\r?\n){3,}/g, "\n\n");

  // 5. Discard lines that are PDF stream markers or binary noise
  const lines = cleaned.split("\n");
  const validLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^\d+\s+\d+\s+obj/i.test(trimmed)) return false;
    if (/^(xref|trailer|endstream|endobj|startxref|stream)$/i.test(trimmed)) return false;
    if (/^\d{10}\s+\d{5}\s+[fn]/i.test(trimmed)) return false;
    // Discard lines where >45% of chars are non-alphanumeric symbols (binary noise)
    const nonAlphaNum = trimmed.replace(/[a-zA-Z0-9\s.,!?:;'"()\--]/g, "").length;
    if (trimmed.length > 10 && nonAlphaNum / trimmed.length > 0.45) return false;
    return true;
  });

  return validLines.join("\n").trim();
}

/**
 * Defensive Validator for RAG Chunk Text.
 *
 * Guarantees that chunk text is human-readable, UTF-8 encoded text and NOT:
 * - Null, undefined, empty, or whitespace-only
 * - JavaScript stringified object/array literals ("[object Object]", "[object Uint8Array]")
 * - Serialized float vector arrays ("[0.0123, -0.456, ...]")
 * - Raw PDF stream markers or xref tables
 * - Compressed PDF font table garbage ("MeTG FuSP 1kVFFzj rEuf qLWw...")
 *
 * DO NOT over-filter legitimate programming code (Java, Python, JS), math formulas,
 * tables, or technical terms.
 */
export function isValidChunkText(text: string | null | undefined): boolean {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;

  // Reject JS stringified object/array literals
  if (
    trimmed === "[object Object]" ||
    trimmed === "[object Uint8Array]" ||
    trimmed === "undefined" ||
    trimmed === "null" ||
    trimmed === "NaN"
  ) {
    return false;
  }

  // Reject serialized float vector arrays, e.g. "[0.123, -0.456, ...]" or "[0,1,2]"
  if (/^\s*\[\s*-?\d+(?:\.\d+)?(?:[\s,]+-?\d+(?:\.\d+)?)*\s*\]\s*$/.test(trimmed)) {
    return false;
  }

  // Reject PDF stream / obj syntax markers
  if (
    /^\s*\d+\s+\d+\s+obj/i.test(trimmed) ||
    /^\s*(xref|trailer|endstream|endobj|startxref|stream)\s*$/i.test(trimmed)
  ) {
    return false;
  }

  // Detect font table / compressed stream ASCII noise:
  // Random mixed-case tokens with numbers and letters with low word structure (e.g. "MeTG FuSP 1kVFFzj rEuf qLWw")
  const words = trimmed.split(/\s+/);
  if (words.length >= 4) {
    const noiseWords = words.filter(
      (w) => /^[a-zA-Z0-9]{4,15}$/.test(w) && /[a-z]/.test(w) && /[A-Z]/.test(w) && /\d/.test(w)
    );
    if (noiseWords.length / words.length > 0.35) {
      return false;
    }
  }

  // Count alphanumeric characters (letters + numbers)
  const alphaNumCount = trimmed.replace(/[^a-zA-Z0-9]/g, "").length;
  if (alphaNumCount < 3) return false;

  return true;
}

