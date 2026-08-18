import "server-only";

export interface UnstructuredElementMetadata {
  page_number?: number;
  filename?: string;
  [key: string]: any;
}

export interface UnstructuredElement {
  type: string;
  text: string;
  metadata: UnstructuredElementMetadata;
}

export interface UnstructuredExtractionResult {
  success: boolean;
  filename: string;
  element_count: number;
  text: string;
  elements: UnstructuredElement[];
}

export interface ExtractionClientOptions {
  timeoutMs?: number;
}

export class UnstructuredExtractionService {
  private static get ServiceUrl(): string {
    const rawUrl = process.env.EXTRACTION_SERVICE_URL || process.env.DOCUMENT_EXTRACTION_SERVICE_URL || "http://localhost:8000";
    return rawUrl.replace(/\/+$/, "");
  }

  /**
   * Health check endpoint to verify extraction service connectivity
   */
  public static async checkHealth(timeoutMs = 5000): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `${this.ServiceUrl}/health`;
      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      if (!res.ok) {
        console.warn(`[ExtractionService Health] Returned HTTP ${res.status}`);
        return false;
      }

      const data = await res.json();
      return data?.status === "ok";
    } catch (err: any) {
      console.error(`[ExtractionService Health Failed] ${err?.message || err}`);
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Extract content from document buffer using Python Unstructured Service
   */
  public static async extractDocument(
    fileBuffer: ArrayBuffer | Buffer,
    fileName: string,
    options: ExtractionClientOptions = {}
  ): Promise<UnstructuredExtractionResult> {
    const timeoutMs = options.timeoutMs ?? 60000; // 60s default timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const serviceBaseUrl = this.ServiceUrl;
    if (!serviceBaseUrl) {
      throw new Error("Document extraction service configuration error: EXTRACTION_SERVICE_URL is not configured.");
    }

    const extractEndpoint = `${serviceBaseUrl}/extract`;
    console.log(`[ExtractionClient] Submitting "${fileName}" (${fileBuffer.byteLength} bytes) to ${extractEndpoint}`);

    try {
      const bufferObj = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
      const blob = new Blob([bufferObj as any]);


      const formData = new FormData();
      formData.append("file", blob, fileName);

      const response = await fetch(extractEndpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        let errDetail = "";
        try {
          const errJson = await response.json();
          errDetail = errJson.detail || errJson.error || JSON.stringify(errJson);
        } catch {
          errDetail = await response.text();
        }

        console.error(`[ExtractionClient HTTP ${response.status}] ${extractEndpoint}: ${errDetail}`);

        if (response.status === 400) {
          throw new Error(`Document extraction rejected by service: ${errDetail || "Invalid file payload"}`);
        } else if (response.status === 500) {
          throw new Error(`Document extraction failed on service: ${errDetail || "Internal extraction error"}`);
        } else {
          throw new Error(`Document extraction service returned HTTP ${response.status}: ${errDetail}`);
        }
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("Document extraction returned malformed response.");
      }

      // Step 2: Accept BOTH response.text AND response.elements[].text
      let fullText = typeof data.text === "string" ? data.text.trim() : "";
      const rawElements = Array.isArray(data.elements) ? data.elements : [];

      if (!fullText && rawElements.length > 0) {
        fullText = rawElements
          .map((el: any) => String(el.text || "").trim())
          .filter((t: string) => t.length > 0)
          .join("\n\n");
      }

      const parsedElements: UnstructuredElement[] = rawElements.map((el: any) => ({
        type: String(el.type || "UncategorizedText"),
        text: String(el.text || "").trim(),
        metadata: {
          page_number: el.metadata?.page_number ?? undefined,
          filename: el.metadata?.filename || fileName,
          ...el.metadata,
        },
      }));

      // Normalize response
      const normalized: UnstructuredExtractionResult = {
        success: Boolean(data.success) || fullText.length > 0 || parsedElements.length > 0,
        filename: data.filename || fileName,
        element_count: typeof data.element_count === "number" ? data.element_count : parsedElements.length,
        text: fullText,
        elements: parsedElements,
      };

      // Step 1: Diagnostic Logging
      const elementTypes = parsedElements.map((e) => e.type);
      console.log(
        `[UNSTRUCTURED_RESPONSE] success=${normalized.success} filename="${normalized.filename}" element_count=${normalized.element_count} text_len=${normalized.text.length} element_types=[${elementTypes.join(", ")}] preview="${normalized.text.slice(0, 100)}"`
      );

      return normalized;
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.error(`[ExtractionClient Timeout] Request exceeded timeout of ${timeoutMs}ms`);
        throw new Error(`Document extraction timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
      }

      if (err.code === "ECONNREFUSED" || err.message?.includes("fetch failed") || err.message?.includes("Connection refused")) {
        console.error(`[ExtractionClient Connection Error] Cannot reach extraction service at ${extractEndpoint}`);
        throw new Error("Document extraction service is unavailable.");
      }

      // Re-throw formatted errors
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
