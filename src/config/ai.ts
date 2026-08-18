/**
 * Future AI Integration Configuration (Placeholder for Groq / LLM Integration in Future Module)
 */

export const aiConfig = {
  provider: "nvidia-nim" as const,
  baseUrl: process.env.NVIDIA_NIM_BASE_URL || "https://integrate.api.nvidia.com/v1",
  model: process.env.NVIDIA_NIM_MODEL || "meta/llama-3.3-70b-instruct",
  temperature: 0.7,
  maxTokens: 4096,
  embeddingModel: "text-embedding-3-small",
  ragChunkSize: 1000,
  ragChunkOverlap: 200,
  systemPrompts: {
    tutor: "You are ASP AI, a patient and intelligent academic study assistant. Help students synthesize information, summarize documents, create flashcards, and solve academic challenges.",
    summarizer: "You are a concise document summarizer. Extract key concepts, actionable bullet points, and core definitions.",
    quizGenerator: "You are an expert exam author. Create multiple-choice and short-answer practice questions testing deep conceptual understanding.",
  },
  status: "configured_active",
};
