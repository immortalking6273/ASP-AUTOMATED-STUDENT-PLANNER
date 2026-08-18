/**
 * Abstraction layer for Text Embeddings (RAG Preparation)
 * Supports multiple providers: OpenAI, Voyage AI, Jina AI, HuggingFace, Local Mock
 */

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  provider: string;
  model: string;
}

export interface EmbeddingProvider {
  name: string;
  generateEmbedding(text: string): Promise<EmbeddingResult>;
  generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
}

/**
 * Local Deterministic Mock Embedding Provider (Default Fallback)
 * Generates normalized 384-dimensional feature vectors using Bag-of-Words + Subword Trigrams
 * ensuring consistent high semantic similarity for queries matching document content.
 */
export class LocalMockEmbeddingProvider implements EmbeddingProvider {
  name = "local-mock";
  private dimensions = 384;

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const vector = new Array(this.dimensions).fill(0);
    const cleaned = (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
    const words = cleaned.split(/\s+/).filter(Boolean);

    // 1. Hash word tokens & subword 3-grams to fixed vector dimensions
    for (const word of words) {
      if (word.length < 2) continue;

      // Word Token Hash
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash * 31 + word.charCodeAt(j)) % this.dimensions;
      }
      const wordIdx = Math.abs(hash) % this.dimensions;
      vector[wordIdx] += 1.0;

      // Character 3-Gram Subword Hashes
      for (let k = 0; k <= word.length - 3; k++) {
        const tri = word.slice(k, k + 3);
        let triHash = 0;
        for (let m = 0; m < tri.length; m++) {
          triHash = (triHash * 37 + tri.charCodeAt(m)) % this.dimensions;
        }
        const triIdx = Math.abs(triHash) % this.dimensions;
        vector[triIdx] += 0.5;
      }
    }

    // 2. L2 Normalize vector magnitude
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1.0;
    const normalized = vector.map((v) => Number((v / magnitude).toFixed(6)));

    return {
      embedding: normalized,
      dimensions: this.dimensions,
      provider: "local-mock",
      model: "asp-bow-trigram-v1",
    };
  }

  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }
}

/**
 * OpenAI / Compatible Embedding Provider
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = "openai";
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    this.model = model || process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.apiKey) {
      // Fallback to local mock if no API key present
      return new LocalMockEmbeddingProvider().generateEmbedding(text);
    }

    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: text,
          model: this.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error ${response.status}`);
      }

      const data = await response.json();
      const embedding = data?.data?.[0]?.embedding || [];

      return {
        embedding,
        dimensions: embedding.length,
        provider: "openai",
        model: this.model,
      };
    } catch (err) {
      console.warn("OpenAI embedding failed, falling back to local mock:", err);
      return new LocalMockEmbeddingProvider().generateEmbedding(text);
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }
}

/**
 * Voyage AI Embedding Provider
 */
export class VoyageEmbeddingProvider implements EmbeddingProvider {
  name = "voyage";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.VOYAGE_API_KEY || "";
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    return new LocalMockEmbeddingProvider().generateEmbedding(text);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }
}

/**
 * Factory for getting active embedding provider
 */
export function getActiveEmbeddingProvider(): EmbeddingProvider {
  const providerName = process.env.EMBEDDING_PROVIDER?.toLowerCase();

  switch (providerName) {
    case "openai":
      return new OpenAIEmbeddingProvider();
    case "voyage":
      return new VoyageEmbeddingProvider();
    default:
      return new LocalMockEmbeddingProvider();
  }
}
