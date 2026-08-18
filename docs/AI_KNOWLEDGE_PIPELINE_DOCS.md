# Module 9 — AI Knowledge Processing & Document Intelligence Pipeline (RAG Preparation Layer)

## 1. Overview & Objectives

Module 9 builds a complete **Document Intelligence and RAG Preparation Layer** for ASP (Automated Student Planner). It transforms uploaded student documents (PDF, DOCX, PPTX, TXT, Markdown) into structured, semantically chunked, metadata-enriched knowledge records stored in Supabase PostgreSQL and prepared for Retrieval-Augmented Generation (RAG).

```
Document Uploaded → Validation → Text Extraction → Cleaning → Chunking → Metadata Generation → Embedding Generation → Knowledge Storage → Ready for AI
```

---

## 2. Processing Pipeline Architecture

### Pipeline Stages & Statuses
1. **Uploaded**: Initial state upon file upload to Supabase `documents` bucket.
2. **Processing (Text Extraction & Cleaning)**:
   - `TextExtractionService`: Extracts text, headings, lists, tables from PDF, DOCX, PPTX, TXT, and Markdown files.
   - `TextCleaningService`: Normalizes spaces, repairs broken hyphenated line breaks, strips non-printable control characters while preserving headings, lists, and code blocks.
3. **Chunking**:
   - `DocumentChunkingService`: Semantic, heading-aware chunking algorithm splitting text by heading boundaries (`#`, `##`, uppercase headings) with a target character budget (~1000 chars / ~250 tokens per chunk) and sliding window overlap (~150 chars).
4. **Metadata Generation**:
   - `MetadataGenerationService`: Extracts document-level metadata (Title, Author, Subject, Keywords, Language, Reading Time, Estimated Tokens). Leverages **Groq LLM** (`llama-3.3-70b-versatile`) when configured, backed by rule-based heuristic fallback.
5. **Embedding Preparation**:
   - `EmbeddingProvider` abstraction layer allowing pluggable backends (`OpenAIEmbeddingProvider`, `VoyageEmbeddingProvider`, `LocalMockEmbeddingProvider`, `HuggingFaceEmbeddingProvider`).
6. **Knowledge Storage**:
   - `KnowledgeStorageService`: Batch inserts document chunks into `public.document_chunks` table and updates `public.uploaded_documents` status to `ready`.
7. **Ready for AI**: Knowledge indexed and searchable for future AI modules (NotebookLM-style chat, study planner, etc.).

---

## 3. Database Schema Extensions

### `public.uploaded_documents` Extended Columns
- `extracted_metadata` (`JSONB`): Title, Author, Subject, Keywords, Language.
- `total_chunks` (`INTEGER`): Number of indexed chunks.
- `estimated_tokens` (`INTEGER`): Estimated total token count.
- `reading_time_minutes` (`INTEGER`): Calculated reading duration.
- `error_message` (`TEXT`): Failure details if pipeline encounters errors.
- `processed_at` (`TIMESTAMPTZ`): Completion timestamp.

### `public.document_chunks` Table
```sql
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  heading TEXT,
  character_count INTEGER NOT NULL DEFAULT 0,
  token_estimate INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/documents/process` | `POST` | Triggers background processing pipeline for a document |
| `/api/documents/[id]/status` | `GET` | Returns processing progress, chunk stats, and error details |
| `/api/documents/[id]/reprocess` | `POST` | Retries failed pipeline or re-indexes document chunks |
| `/api/documents/[id]/knowledge` | `GET / DELETE` | Inspects or clears stored knowledge chunks |

---

## 5. UI Components Created

1. `DocumentStatusBadge`: Styled status pill badge with animated indicators (`Uploaded`, `Processing`, `Chunking`, `Embedding`, `Ready`, `Failed`).
2. `AIProcessingStatus`: Progress bar and active step status renderer.
3. `ChunkProgress`: Metrics component displaying total chunks, token density, and reading time.
4. `KnowledgeSummary`: Renders extracted document metadata (Subject, Keywords, Language, Author).
5. `ProcessingTimeline`: Interactive visual timeline showing pipeline execution stages.
6. `AIReadinessCard`: Readiness indicator card integrated into the document details panel.
7. `RetryProcessingDialog`: Confirmation modal for re-indexing or retrying processing.
8. `ErrorRecoveryPanel`: Error diagnostic panel with actionable retry buttons.
9. `ProcessingQueue`: Active workspace job queue widget.

---

## 6. Internal Retrieval Service (RAG Preparation)

`RetrievalService` provides workspace-isolated vector similarity search and metadata filtering:
```typescript
const searchResults = await RetrievalService.searchWorkspaceChunks(workspaceId, "machine learning concepts", {
  limit: 5,
  minSimilarity: 0.2,
});
```

---

## 7. Security & Isolation

- **Workspace Isolation**: RLS policies enforce that users can only query or process document chunks belonging to workspaces they own (`auth.uid() = owner_id`).
- **API Key Protection**: Groq API keys (`GROQ_API_KEY`) and embedding keys remain strictly server-side; keys are never sent to the browser.
- **Fail-safe Fallbacks**: Heuristic fallbacks ensure offline / local mode functionality without API failures.
