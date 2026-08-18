import { BaseDatabaseService } from "./base-service";
import { AIConversationRow, AIChatMessageRow } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export interface SourceScope {
  type: "workspace" | "notebook" | "documents";
  notebookId?: string;
  notebookTitle?: string;
  documentIds?: string[];
  documentTitles?: string[];
}

export interface CitationItem {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  heading: string | null;
  snippet: string;
  similarityScore: number;
}

export interface MessageMetadata {
  feedback?: "up" | "down" | null;
  isBookmarked?: boolean;
  tokenCount?: number;
  processingTimeMs?: number;
}

export interface CreateConversationInput {
  workspaceId: string;
  userId: string;
  title?: string;
  sourceScope?: SourceScope;
}

export interface AddMessageInput {
  conversationId: string;
  workspaceId: string;
  userId: string;
  role: "user" | "assistant" | "system" | "error";
  content: string;
  citations?: CitationItem[];
  metadata?: MessageMetadata;
}

export class ChatService extends BaseDatabaseService {
  /**
   * Helper to resolve either passed authenticated server client or fallback browser client
   */
  private static getClient(customClient?: SupabaseClient): SupabaseClient {
    return customClient || this.getSupabase();
  }

  /**
   * List all conversations for a user within a workspace
   */
  static async getConversations(
    workspaceId: string,
    userId: string,
    customClient?: SupabaseClient
  ): Promise<AIConversationRow[]> {
    try {
      const supabase = this.getClient(customClient);
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .eq("is_archived", false)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) {
        console.warn(`[ChatService.getConversations] Table error: Code=${error.code}, Message=${error.message}`);
        return [];
      }

      return (data || []) as AIConversationRow[];
    } catch (err: any) {
      console.error("[ChatService.getConversations] Exception:", err);
      return [];
    }
  }

  /**
   * Create a new conversation thread with full diagnostic logging
   */
  static async createConversation(
    input: CreateConversationInput,
    customClient?: SupabaseClient
  ): Promise<{ conversation: AIConversationRow | null; error: string | null }> {
    const payload = {
      user_id: input.userId,
      workspace_id: input.workspaceId,
      title: input.title || "New AI Conversation",
      source_scope: input.sourceScope || { type: "workspace" },
      is_pinned: false,
      is_archived: false,
    };

    console.log("[ChatService.createConversation] Attempting insert:", {
      authenticatedUserId: input.userId,
      workspaceId: input.workspaceId,
      payload,
    });

    try {
      const supabase = this.getClient(customClient);
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("[ChatService.createConversation] Supabase DB Error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          payload,
        });
        return {
          conversation: null,
          error: `[Database Error ${error.code}]: ${error.message} (${error.details || error.hint || "No details"})`,
        };
      }

      console.log("[ChatService.createConversation] Success! Inserted row ID:", data.id);
      return { conversation: data as AIConversationRow, error: null };
    } catch (err: any) {
      console.error("[ChatService.createConversation] Unhandled Exception:", err);
      return {
        conversation: null,
        error: err?.message || "Unhandled exception creating conversation row",
      };
    }
  }

  /**
   * Update conversation title, sourceScope, or pinned/archived state
   */
  static async updateConversation(
    conversationId: string,
    updates: Partial<{
      title: string;
      source_scope: SourceScope;
      is_pinned: boolean;
      is_archived: boolean;
    }>,
    customClient?: SupabaseClient
  ): Promise<boolean> {
    try {
      const supabase = this.getClient(customClient);
      const { error } = await supabase
        .from("ai_conversations")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      if (error) {
        console.error(`[ChatService.updateConversation] Error: Code=${error.code}, Msg=${error.message}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[ChatService.updateConversation] Exception:", err);
      return false;
    }
  }

  /**
   * Delete conversation and all its messages
   */
  static async deleteConversation(
    conversationId: string,
    customClient?: SupabaseClient
  ): Promise<boolean> {
    try {
      const supabase = this.getClient(customClient);
      const { error } = await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", conversationId);

      if (error) {
        console.error(`[ChatService.deleteConversation] Error: Code=${error.code}, Msg=${error.message}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[ChatService.deleteConversation] Exception:", err);
      return false;
    }
  }

  /**
   * Get all messages for a specific conversation
   */
  static async getMessages(
    conversationId: string,
    customClient?: SupabaseClient
  ): Promise<AIChatMessageRow[]> {
    try {
      const supabase = this.getClient(customClient);
      const { data, error } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn(`[ChatService.getMessages] Error: Code=${error.code}, Msg=${error.message}`);
        return [];
      }

      return (data || []) as AIChatMessageRow[];
    } catch (err) {
      console.error("[ChatService.getMessages] Exception:", err);
      return [];
    }
  }

  /**
   * Append a user or assistant message to a conversation
   */
  static async addMessage(
    input: AddMessageInput,
    customClient?: SupabaseClient
  ): Promise<AIChatMessageRow | null> {
    const payload = {
      conversation_id: input.conversationId,
      workspace_id: input.workspaceId,
      user_id: input.userId,
      role: input.role,
      content: input.content,
      citations: (input.citations as any) || [],
      metadata: (input.metadata as any) || {},
    };

    try {
      const supabase = this.getClient(customClient);

      // 1. Insert message
      const { data, error } = await supabase
        .from("ai_chat_messages")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("[ChatService.addMessage] Supabase DB Error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          payload,
        });
        return null;
      }

      console.log("[ChatService.addMessage] Success! Inserted message ID:", data.id);

      // 2. Touch conversation updated_at
      await supabase
        .from("ai_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", input.conversationId);

      return data as AIChatMessageRow;
    } catch (err) {
      console.error("[ChatService.addMessage] Exception:", err);
      return null;
    }
  }

  /**
   * Update message metadata (feedback rating, bookmarked flag)
   */
  static async updateMessageMetadata(
    messageId: string,
    metadata: Partial<MessageMetadata>,
    customClient?: SupabaseClient
  ): Promise<boolean> {
    try {
      const supabase = this.getClient(customClient);

      // First fetch current metadata
      const { data: existing } = await supabase
        .from("ai_chat_messages")
        .select("metadata")
        .eq("id", messageId)
        .single();

      const currentMeta = (existing?.metadata as any) || {};
      const mergedMeta = { ...currentMeta, ...metadata };

      const { error } = await supabase
        .from("ai_chat_messages")
        .update({ metadata: mergedMeta })
        .eq("id", messageId);

      if (error) {
        console.error(`[ChatService.updateMessageMetadata] Error: Code=${error.code}, Msg=${error.message}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[ChatService.updateMessageMetadata] Exception:", err);
      return false;
    }
  }
}
