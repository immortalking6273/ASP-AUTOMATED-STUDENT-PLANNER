# Future Module Integration Guide

This guide outlines how future development modules will plug into the Module 1 foundation architecture.

---

## Module 2: Authentication (Supabase Auth)
- **Target Feature**: `src/features/authentication/`
- **Integration Points**:
  1. Add `@supabase/supabase-js` and `@supabase/ssr`.
  2. Implement client/server Supabase authentication helpers in `src/services/supabase/`.
  3. Wire route protection into `src/middleware.ts`.
  4. Update `src/providers/app-provider.tsx` to include `AuthProvider`.

---

## Module 3: Database & Workspace Persistence (Supabase PostgreSQL)
- **Target Feature**: `src/features/workspace/`, `src/features/notes/`, `src/features/documents/`
- **Integration Points**:
  1. Define database schema migrations for `workspaces`, `notes`, `documents`, `tasks`.
  2. Connect typed Supabase database clients to `src/config/database.ts`.
  3. Create repositories in `src/services/` connecting UI feature stores to Supabase tables.

---

## Module 4: Document Upload & Storage (PDF, PPT, DOCX)
- **Target Feature**: `src/features/documents/`
- **Integration Points**:
  1. Configure Supabase Storage buckets for documents.
  2. Integrate document parsers (PDF.js, mammoth.js, pptx parsers) in `src/services/document-parser/`.
  3. Build upload progress dropzone components in `src/features/documents/components/`.

---

## Module 5: AI Engine & RAG Integration (Groq API)
- **Target Feature**: `src/features/chat/`, `src/features/flashcards/`, `src/features/quizzes/`
- **Integration Points**:
  1. Connect `GROQ_API_KEY` to Groq SDK client in `src/services/ai/groq.ts`.
  2. Implement vector store embeddings for document chunk querying (RAG architecture).
  3. Wire AI streaming chat hook into `src/features/chat/hooks/use-ai-chat.ts`.
  4. Generate flashcards and practice quizzes via structured JSON output prompts.
