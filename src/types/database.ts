/**
 * ASP Database TypeScript Definitions
 * Strictly maps Supabase PostgreSQL tables and JSON structures
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          timezone: string;
          preferred_theme: string;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          timezone?: string;
          preferred_theme?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          timezone?: string;
          preferred_theme?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          icon: string;
          color: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          icon?: string;
          color?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notebooks: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          description: string | null;
          icon: string;
          color: string;
          order_index: number;
          is_archived: boolean;
          is_favorite: boolean;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          description?: string | null;
          icon?: string;
          color?: string;
          order_index?: number;
          is_archived?: boolean;
          is_favorite?: boolean;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          order_index?: number;
          is_archived?: boolean;
          is_favorite?: boolean;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          notebook_id: string;
          parent_page_id: string | null;
          title: string;
          slug: string | null;
          icon: string | null;
          cover_image: string | null;
          order_index: number;
          is_favorite: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          parent_page_id?: string | null;
          title: string;
          slug?: string | null;
          icon?: string | null;
          cover_image?: string | null;
          order_index?: number;
          is_favorite?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          parent_page_id?: string | null;
          title?: string;
          slug?: string | null;
          icon?: string | null;
          cover_image?: string | null;
          order_index?: number;
          is_favorite?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      blocks: {
        Row: {
          id: string;
          page_id: string;
          block_type: string;
          content: Json;
          order_index: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          block_type: string;
          content?: Json;
          order_index?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          block_type?: string;
          content?: Json;
          order_index?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      uploaded_documents: {
        Row: {
          id: string;
          workspace_id: string;
          uploader_id: string;
          file_name: string;
          original_name: string;
          display_name: string | null;
          file_type: string | null;
          mime_type: string;
          file_size: number;
          storage_path: string;
          processing_status: string;
          tags: string[] | null;
          description: string | null;
          thumbnail_url: string | null;
          is_archived: boolean;
          is_favorite: boolean;
          last_opened_at: string | null;
          extracted_metadata: Json | null;
          total_chunks: number | null;
          estimated_tokens: number | null;
          reading_time_minutes: number | null;
          error_message: string | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          uploader_id: string;
          file_name: string;
          original_name: string;
          display_name?: string | null;
          file_type?: string | null;
          mime_type: string;
          file_size: number;
          storage_path: string;
          processing_status?: string;
          tags?: string[] | null;
          description?: string | null;
          thumbnail_url?: string | null;
          is_archived?: boolean;
          is_favorite?: boolean;
          last_opened_at?: string | null;
          extracted_metadata?: Json | null;
          total_chunks?: number | null;
          estimated_tokens?: number | null;
          reading_time_minutes?: number | null;
          error_message?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          uploader_id?: string;
          file_name?: string;
          original_name?: string;
          display_name?: string | null;
          file_type?: string | null;
          mime_type?: string;
          file_size?: number;
          storage_path?: string;
          processing_status?: string;
          tags?: string[] | null;
          description?: string | null;
          thumbnail_url?: string | null;
          is_archived?: boolean;
          is_favorite?: boolean;
          last_opened_at?: string | null;
          extracted_metadata?: Json | null;
          total_chunks?: number | null;
          estimated_tokens?: number | null;
          reading_time_minutes?: number | null;
          error_message?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          workspace_id: string;
          chunk_index: number;
          content: string;
          heading: string | null;
          character_count: number;
          token_estimate: number;
          metadata: Json | null;
          embedding: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          workspace_id: string;
          chunk_index: number;
          content: string;
          heading?: string | null;
          character_count?: number;
          token_estimate?: number;
          metadata?: Json | null;
          embedding?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          workspace_id?: string;
          chunk_index?: number;
          content?: string;
          heading?: string | null;
          character_count?: number;
          token_estimate?: number;
          metadata?: Json | null;
          embedding?: Json | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          title: string;
          description: string | null;
          subject: string | null;
          priority: string;
          status: string;
          due_date: string | null;
          estimated_minutes: number | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          title: string;
          description?: string | null;
          subject?: string | null;
          priority?: string;
          status?: string;
          due_date?: string | null;
          estimated_minutes?: number | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string | null;
          title?: string;
          description?: string | null;
          subject?: string | null;
          priority?: string;
          status?: string;
          due_date?: string | null;
          estimated_minutes?: number | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          workspace_id: string | null;
          user_id: string;
          title: string | null;
          subject: string | null;
          start_time: string | null;
          end_time: string | null;
          duration: number | null;
          notes: string | null;
          started_at: string | null;
          ended_at: string | null;
          created_at?: string | null;
        };
        Insert: {
          id?: string;
          workspace_id?: string | null;
          user_id: string;
          title?: string | null;
          subject?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          duration?: number | null;
          notes?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string | null;
          user_id?: string | null;
          title?: string | null;
          subject?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          duration?: number | null;
          notes?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string | null;
        };
      };
      reminders: {
        Row: {
          id: string;
          task_id: string;
          reminder_time: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          reminder_time: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          reminder_time?: string;
          status?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string | null;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          entity_type: string | null;
          entity_id: string | null;
          event_key: string | null;
          read_at: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id?: string | null;
          title: string;
          message: string;
          type?: string;
          is_read?: boolean;
          entity_type?: string | null;
          entity_id?: string | null;
          event_key?: string | null;
          read_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string | null;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          entity_type?: string | null;
          entity_id?: string | null;
          event_key?: string | null;
          read_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          task_reminders: boolean;
          deadline_reminders: boolean;
          overdue_alerts: boolean;
          study_session_reminders: boolean;
          quiz_reminders: boolean;
          flashcard_reminders: boolean;
          planner_notifications: boolean;
          ai_reminders: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_reminders?: boolean;
          deadline_reminders?: boolean;
          overdue_alerts?: boolean;
          study_session_reminders?: boolean;
          quiz_reminders?: boolean;
          flashcard_reminders?: boolean;
          planner_notifications?: boolean;
          ai_reminders?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_reminders?: boolean;
          deadline_reminders?: boolean;
          overdue_alerts?: boolean;
          study_session_reminders?: boolean;
          quiz_reminders?: boolean;
          flashcard_reminders?: boolean;
          planner_notifications?: boolean;
          ai_reminders?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          response_style: string;
          ai_language: string;
          show_citations: boolean;
          reduce_motion: boolean;
          save_chat_history: boolean;
          daily_study_goal_minutes: number;
          weekly_study_goal_minutes: number;
          preferred_start_time: string;
          preferred_end_time: string;
          default_session_minutes: number;
          default_break_minutes: number;
          default_workspace_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          response_style?: string;
          ai_language?: string;
          show_citations?: boolean;
          reduce_motion?: boolean;
          save_chat_history?: boolean;
          daily_study_goal_minutes?: number;
          weekly_study_goal_minutes?: number;
          preferred_start_time?: string;
          preferred_end_time?: string;
          default_session_minutes?: number;
          default_break_minutes?: number;
          default_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          response_style?: string;
          ai_language?: string;
          show_citations?: boolean;
          reduce_motion?: boolean;
          save_chat_history?: boolean;
          daily_study_goal_minutes?: number;
          weekly_study_goal_minutes?: number;
          preferred_start_time?: string;
          preferred_end_time?: string;
          default_session_minutes?: number;
          default_break_minutes?: number;
          default_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flashcard_decks: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          name: string;
          description: string | null;
          subject: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          name: string;
          description?: string | null;
          subject?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          subject?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string | null;
          deck_id: string | null;
          deck_name: string;
          front: string;
          back: string;
          hint: string | null;
          difficulty: "easy" | "medium" | "hard";
          mastery_level: number;
          review_count: number;
          correct_count: number;
          incorrect_count: number;
          last_reviewed_at: string | null;
          next_review_at: string | null;
          source_type: "manual" | "document" | "notebook" | "ai";
          source_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id?: string | null;
          deck_id?: string | null;
          deck_name?: string;
          front: string;
          back: string;
          hint?: string | null;
          difficulty?: "easy" | "medium" | "hard";
          mastery_level?: number;
          review_count?: number;
          correct_count?: number;
          incorrect_count?: number;
          last_reviewed_at?: string | null;
          next_review_at?: string | null;
          source_type?: "manual" | "document" | "notebook" | "ai";
          source_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string | null;
          deck_id?: string | null;
          deck_name?: string;
          front?: string;
          back?: string;
          hint?: string | null;
          difficulty?: "easy" | "medium" | "hard";
          mastery_level?: number;
          review_count?: number;
          correct_count?: number;
          incorrect_count?: number;
          last_reviewed_at?: string | null;
          next_review_at?: string | null;
          source_type?: "manual" | "document" | "notebook" | "ai";
          source_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flashcard_reviews: {
        Row: {
          id: string;
          flashcard_id: string;
          workspace_id: string;
          user_id: string;
          rating: "again" | "hard" | "good" | "easy";
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          flashcard_id: string;
          workspace_id: string;
          user_id: string;
          rating: "again" | "hard" | "good" | "easy";
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          flashcard_id?: string;
          workspace_id?: string;
          user_id?: string;
          rating?: "again" | "hard" | "good" | "easy";
          reviewed_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string | null;
          title: string;
          description: string | null;
          total_questions: number;
          source_type: string | null;
          source_id: string | null;
          difficulty: string | null;
          question_types: string | null;
          subject: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id?: string | null;
          title: string;
          description?: string | null;
          total_questions?: number;
          source_type?: string | null;
          source_id?: string | null;
          difficulty?: string | null;
          question_types?: string | null;
          subject?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string | null;
          title?: string;
          description?: string | null;
          total_questions?: number;
          source_type?: string | null;
          source_id?: string | null;
          difficulty?: string | null;
          question_types?: string | null;
          subject?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          workspace_id: string | null;
          user_id: string;
          question: string;
          question_type: "multiple_choice" | "true_false" | "short_answer";
          options: Json | null;
          correct_answer: string;
          explanation: string | null;
          difficulty: "easy" | "medium" | "hard";
          question_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          workspace_id?: string | null;
          user_id: string;
          question: string;
          question_type?: "multiple_choice" | "true_false" | "short_answer";
          options?: Json | null;
          correct_answer: string;
          explanation?: string | null;
          difficulty?: "easy" | "medium" | "hard";
          question_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          workspace_id?: string | null;
          user_id?: string;
          question?: string;
          question_type?: "multiple_choice" | "true_false" | "short_answer";
          options?: Json | null;
          correct_answer?: string;
          explanation?: string | null;
          difficulty?: "easy" | "medium" | "hard";
          question_order?: number;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          workspace_id: string | null;
          user_id: string;
          score: number;
          total_questions: number;
          correct_answers: number;
          incorrect_answers: number;
          unanswered: number;
          percentage: number;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          workspace_id?: string | null;
          user_id: string;
          score?: number;
          total_questions: number;
          correct_answers?: number;
          incorrect_answers?: number;
          unanswered?: number;
          percentage?: number;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          workspace_id?: string | null;
          user_id?: string;
          score?: number;
          total_questions?: number;
          correct_answers?: number;
          incorrect_answers?: number;
          unanswered?: number;
          percentage?: number;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      quiz_attempt_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          student_answer: string | null;
          is_correct: boolean;
          explanation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          student_answer?: string | null;
          is_correct?: boolean;
          explanation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          student_answer?: string | null;
          is_correct?: boolean;
          explanation?: string | null;
          created_at?: string;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string | null;
          role: string;
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id?: string | null;
          role: string;
          content: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string | null;
          role?: string;
          content?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          metric_type: string;
          metric_value: number;
          metadata: Json;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_type: string;
          metric_value: number;
          metadata?: Json;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_type?: string;
          metric_value?: number;
          metadata?: Json;
          logged_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          title: string;
          source_scope: Json;
          is_pinned: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          title?: string;
          source_scope?: Json;
          is_pinned?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string;
          title?: string;
          source_scope?: Json;
          is_pinned?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          workspace_id: string;
          role: string;
          content: string;
          citations: Json | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          workspace_id: string;
          role: string;
          content: string;
          citations?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          workspace_id?: string;
          role?: string;
          content?: string;
          citations?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      faq_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      faq_items: {
        Row: {
          id: string;
          category_id: string | null;
          question: string;
          answer: string;
          status: "draft" | "published" | "archived";
          sort_order: number;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          question: string;
          answer: string;
          status?: "draft" | "published" | "archived";
          sort_order?: number;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          question?: string;
          answer?: string;
          status?: "draft" | "published" | "archived";
          sort_order?: number;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      support_feedback: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          message: string;
          category: string;
          status: "pending" | "reviewed" | "resolved";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          message: string;
          category?: string;
          status?: "pending" | "reviewed" | "resolved";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          message?: string;
          category?: string;
          status?: "pending" | "reviewed" | "resolved";
          created_at?: string;
        };
      };
    };
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type WorkspaceRow = Database["public"]["Tables"]["workspaces"]["Row"];
export type NotebookRow = Database["public"]["Tables"]["notebooks"]["Row"];
export type PageRow = Database["public"]["Tables"]["pages"]["Row"];
export type BlockRow = Database["public"]["Tables"]["blocks"]["Row"];
export type UploadedDocumentRow = Database["public"]["Tables"]["uploaded_documents"]["Row"];
export type DocumentChunkRow = Database["public"]["Tables"]["document_chunks"]["Row"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type StudySessionRow = Database["public"]["Tables"]["study_sessions"]["Row"];
export type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type AIConversationRow = Database["public"]["Tables"]["ai_conversations"]["Row"];
export type AIChatMessageRow = Database["public"]["Tables"]["ai_chat_messages"]["Row"];
export type FaqCategoryRow = Database["public"]["Tables"]["faq_categories"]["Row"];
export type FaqItemRow = Database["public"]["Tables"]["faq_items"]["Row"];
export type SupportFeedbackRow = Database["public"]["Tables"]["support_feedback"]["Row"];


