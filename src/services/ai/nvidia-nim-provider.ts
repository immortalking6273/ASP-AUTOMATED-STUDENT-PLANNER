/**
 * NVIDIA NIM Hosted API Integration Provider
 * Configurable via server-side NVIDIA_API_KEY, NVIDIA_NIM_BASE_URL, and NVIDIA_NIM_MODEL environment variables.
 *
 * Base URL: https://integrate.api.nvidia.com/v1
 * Chat Endpoint: POST /chat/completions
 *
 * NEVER expose the API key to client-side code or browser logs.
 */

import { GroqProvider } from "./groq-provider";

export interface NvidiaNimCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" | "text" };
  timeoutMs?: number;
}

export interface NvidiaNimMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class NvidiaNimProvider {
  /**
   * Get server-side NVIDIA API Key lazily.
   */
  public static getApiKey(): string | null {
    if (typeof window !== "undefined") {
      throw new Error("NVIDIA_API_KEY must ONLY be accessed on the server side.");
    }
    return process.env.NVIDIA_API_KEY || null;
  }

  /**
   * Get Base URL for NVIDIA NIM Hosted API lazily.
   */
  public static getBaseUrl(): string {
    return process.env.NVIDIA_NIM_BASE_URL || "https://integrate.api.nvidia.com/v1";
  }

  /**
   * Get target model for NVIDIA NIM lazily.
   */
  public static getModel(): string {
    return process.env.NVIDIA_NIM_MODEL || "meta/llama-3.1-70b-instruct";
  }

  /**
   * Check if NVIDIA NIM API is configured on the server.
   */
  public static isConfigured(): boolean {
    return typeof window === "undefined" && Boolean(process.env.NVIDIA_API_KEY);
  }

  /**
   * Server-side health diagnostic method checking API key, model, and endpoint connectivity.
   */
  public static async checkHealth(): Promise<{
    provider: string;
    apiKeyConfigured: boolean;
    baseUrlConfigured: boolean;
    modelConfigured: boolean;
    modelName: string;
    modelAvailable: boolean;
    chatCompletionAvailable: boolean;
    errorDetails?: string;
  }> {
    const apiKey = this.getApiKey();
    const baseUrl = this.getBaseUrl();
    const model = this.getModel();

    const result = {
      provider: "nvidia-nim",
      apiKeyConfigured: Boolean(apiKey),
      baseUrlConfigured: Boolean(baseUrl),
      modelConfigured: Boolean(model),
      modelName: model,
      modelAvailable: false,
      chatCompletionAvailable: false,
    };

    if (!apiKey) {
      return { ...result, errorDetails: "NVIDIA_API_KEY is not configured" };
    }

    try {
      // 1. Check Chat Completion with 1 token
      const compRes = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
        }),
      });

      if (compRes.ok) {
        result.modelAvailable = true;
        result.chatCompletionAvailable = true;
      } else {
        const errText = await compRes.text();
        return {
          ...result,
          errorDetails: `HTTP ${compRes.status}: ${errText.substring(0, 150)}`,
        };
      }
    } catch (err: any) {
      return {
        ...result,
        errorDetails: err?.message || String(err),
      };
    }

    return result;
  }

  /**
   * Non-streaming completion request with timeout and failover support.
   */
  public static async complete(
    prompt: string,
    systemPrompt: string = "You are an expert educational AI assistant.",
    options: NvidiaNimCompletionOptions = {}
  ): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn("[NVIDIA NIM Provider] NVIDIA_API_KEY is not configured.");
      if (GroqProvider.isConfigured()) {
        console.log("[NVIDIA NIM Provider] Failing over to GroqProvider...");
        return GroqProvider.complete(prompt, systemPrompt, options);
      }
      return null;
    }

    const baseUrl = this.getBaseUrl();
    const model = options.model || this.getModel();
    const temperature = options.temperature ?? 0.2;
    const maxTokens = options.maxTokens ?? 4096;
    const timeoutMs = options.timeoutMs ?? 18000;
    const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
          ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[NVIDIA NIM Provider] HTTP ${response.status} for model "${model}":`, errText);

        if (GroqProvider.isConfigured()) {
          console.log("[NVIDIA NIM Provider] API error. Failing over to GroqProvider...");
          return GroqProvider.complete(prompt, systemPrompt, options);
        }
        return null;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      return text ? text.trim() : null;
    } catch (err: any) {
      clearTimeout(timer);
      console.error(`[NVIDIA NIM Provider Exception] (${err?.name || "FetchError"}):`, err?.message || err);

      if (GroqProvider.isConfigured()) {
        console.log("[NVIDIA NIM Provider] Connection exception. Failing over to GroqProvider...");
        return GroqProvider.complete(prompt, systemPrompt, options);
      }
      return null;
    }
  }

  /**
   * Extract JSON structure using NVIDIA NIM
   */
  public static async completeJson<T>(
    prompt: string,
    systemPrompt: string = "You extract structured JSON metadata from text.",
    options: NvidiaNimCompletionOptions = {}
  ): Promise<T | null> {
    const raw = await this.complete(prompt, systemPrompt, {
      responseFormat: { type: "json_object" },
      temperature: 0.1,
      maxTokens: 4096,
      ...options,
    });

    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
      try {
        return JSON.parse(cleaned) as T;
      } catch {
        return null;
      }
    }
  }
}
