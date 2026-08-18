import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Automated Student Planner"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  
  // Future Supabase Auth & DB Placeholders
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // NVIDIA NIM AI Engine Credentials
  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_NIM_BASE_URL: z.string().default("https://integrate.api.nvidia.com/v1"),
  NVIDIA_NIM_MODEL: z.string().default("meta/llama-3.3-70b-instruct"),

  // Legacy Groq AI Model Placeholder
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),

  // Python Unstructured Extraction Service
  DOCUMENT_EXTRACTION_SERVICE_URL: z.string().default("http://127.0.0.1:8000"),

  // RAG Engine Confidence & Debug Settings
  RAG_HIGH_CONFIDENCE_THRESHOLD: z.coerce.number().default(0.50),
  RAG_MEDIUM_CONFIDENCE_THRESHOLD: z.coerce.number().default(0.25),
  RAG_DEBUG: z.coerce.boolean().default(true),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  NVIDIA_NIM_BASE_URL: process.env.NVIDIA_NIM_BASE_URL,
  NVIDIA_NIM_MODEL: process.env.NVIDIA_NIM_MODEL,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL,
  DOCUMENT_EXTRACTION_SERVICE_URL: process.env.DOCUMENT_EXTRACTION_SERVICE_URL,
  RAG_HIGH_CONFIDENCE_THRESHOLD: process.env.RAG_HIGH_CONFIDENCE_THRESHOLD,
  RAG_MEDIUM_CONFIDENCE_THRESHOLD: process.env.RAG_MEDIUM_CONFIDENCE_THRESHOLD,
  RAG_DEBUG: process.env.RAG_DEBUG,
});


