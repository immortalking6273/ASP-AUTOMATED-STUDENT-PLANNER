/**
 * Groq API Integration Provider
 * Configurable via GROQ_API_KEY and GROQ_MODEL environment variables
 */

export interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" | "text" };
}

export class GroqProvider {
  private static getApiKey(): string | null {
    return process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || null;
  }

  private static getModel(): string {
    return (
      process.env.GROQ_MODEL ||
      process.env.NEXT_PUBLIC_GROQ_MODEL ||
      "llama-3.3-70b-versatile"
    );
  }

  /**
   * Check if Groq API is configured
   */
  static isConfigured(): boolean {
    return !!this.getApiKey();
  }

  /**
   * Generate text completion using Groq LLM API
   */
  static async complete(
    prompt: string,
    systemPrompt: string = "You are an expert educational AI assistant.",
    options: GroqCompletionOptions = {}
  ): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn("GroqProvider: GROQ_API_KEY is not set. Skipping AI generation.");
      return null;
    }

    const model = options.model || this.getModel();
    const temperature = options.temperature ?? 0.2;
    const maxTokens = options.maxTokens ?? 1024;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Groq API Error (${response.status}):`, errText);
        return null;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      return text ? text.trim() : null;
    } catch (err) {
      console.error("GroqProvider fetch failed:", err);
      return null;
    }
  }

  /**
   * Extract JSON structure using Groq
   */
  static async completeJson<T>(
    prompt: string,
    systemPrompt: string = "You extract structured JSON metadata from text."
  ): Promise<T | null> {
    const raw = await this.complete(prompt, systemPrompt, {
      responseFormat: { type: "json_object" },
      temperature: 0.1,
    });

    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      // Attempt clean extract if wrapped in backticks
      const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
      try {
        return JSON.parse(cleaned) as T;
      } catch {
        return null;
      }
    }
  }
}
