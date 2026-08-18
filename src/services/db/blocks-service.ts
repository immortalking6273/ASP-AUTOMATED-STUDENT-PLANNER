import { BaseDatabaseService } from "./base-service";
import { BlockRow } from "@/types/database";
import { Logger } from "@/lib/logger";

export interface CreateBlockData {
  block_type: string;
  content?: Record<string, any>;
  metadata?: Record<string, any>;
  order_index?: number;
}

export interface UpdateBlockData {
  block_type?: string;
  content?: Record<string, any>;
  metadata?: Record<string, any>;
  order_index?: number;
}

export interface BatchSaveResult {
  success: boolean;
  idMap: Record<string, string>; // Maps temp block ID -> real database UUID
}

export class BlocksService extends BaseDatabaseService {
  /**
   * Helper method to determine if a block ID is a temporary client-side ID
   */
  static isTemporaryBlockId(id: string | null | undefined): boolean {
    if (!id) return true;
    if (typeof id !== "string") return true;
    if (id.startsWith("temp-")) return true;
    // Standard UUID v4 pattern check
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !uuidPattern.test(id);
  }

  /**
   * Fetch all blocks for a page, ordered by order_index ascending
   */
  static async getBlocksByPage(pageId: string): Promise<BlockRow[]> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("blocks")
        .select("*")
        .eq("page_id", pageId)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true });

      Logger.metric("BlocksService.getBlocksByPage", performance.now() - start);
      if (error) throw error;
      return (data || []) as BlockRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Create a new block on a page
   */
  static async createBlock(pageId: string, data: CreateBlockData): Promise<BlockRow> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();

      let orderIndex = data.order_index;
      if (orderIndex === undefined) {
        const { data: maxData } = await supabase
          .from("blocks")
          .select("order_index")
          .eq("page_id", pageId)
          .order("order_index", { ascending: false })
          .limit(1);

        orderIndex = maxData && maxData.length > 0 ? (maxData[0].order_index || 0) + 1 : 0;
      }

      const { data: created, error } = await supabase
        .from("blocks")
        .insert({
          page_id: pageId,
          block_type: data.block_type,
          content: data.content || {},
          metadata: data.metadata || {},
          order_index: orderIndex,
        })
        .select()
        .single();

      Logger.metric("BlocksService.createBlock", performance.now() - start);
      if (error) throw error;
      return created as BlockRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Batch save blocks for debounced auto-save engine.
   * Correctly separates existing UUID blocks (upsert) from temporary client IDs (insert without ID).
   */
  static async batchSaveBlocks(pageId: string, blocks: any[]): Promise<BatchSaveResult> {
    const start = performance.now();
    const idMap: Record<string, string> = {};

    try {
      const supabase = this.getSupabase();

      const existingBlocks = blocks.filter((b) => !this.isTemporaryBlockId(b.id));
      const newBlocks = blocks.filter((b) => this.isTemporaryBlockId(b.id));

      // 1. Batch upsert existing blocks with valid database UUIDs
      if (existingBlocks.length > 0) {
        const existingPayload = existingBlocks.map((b, idx) => ({
          id: b.id,
          page_id: pageId,
          block_type: b.block_type || "paragraph",
          content: b.content || {},
          metadata: b.metadata || {},
          order_index: b.order_index !== undefined ? b.order_index : idx,
        }));

        const { error: upsertErr } = await supabase
          .from("blocks")
          .upsert(existingPayload, { onConflict: "id" });

        if (upsertErr) throw upsertErr;
      }

      // 2. Batch insert new blocks WITHOUT sending client temporary ID to PostgreSQL UUID column
      if (newBlocks.length > 0) {
        const newPayload = newBlocks.map((b, idx) => ({
          page_id: pageId,
          block_type: b.block_type || "paragraph",
          content: b.content || {},
          metadata: b.metadata || {},
          order_index: b.order_index !== undefined ? b.order_index : idx,
        }));

        const { data: createdRows, error: insertErr } = await supabase
          .from("blocks")
          .insert(newPayload)
          .select();

        if (insertErr) throw insertErr;

        // Map client temporary IDs to PostgreSQL generated UUIDs
        if (createdRows) {
          newBlocks.forEach((nb, idx) => {
            if (createdRows[idx]?.id) {
              idMap[nb.id] = createdRows[idx].id;
              console.log(`[AutoSave] Resolved temporary ID "${nb.id}" -> database UUID "${createdRows[idx].id}"`);
            }
          });
        }
      }

      Logger.metric("BlocksService.batchSaveBlocks", performance.now() - start);
      return { success: true, idMap };
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Update single block
   */
  static async updateBlock(id: string, updates: UpdateBlockData): Promise<BlockRow> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { data: updated, error } = await supabase
        .from("blocks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      Logger.metric("BlocksService.updateBlock", performance.now() - start);
      if (error) throw error;
      return updated as BlockRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Delete single block
   */
  static async deleteBlock(id: string): Promise<boolean> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from("blocks").delete().eq("id", id);
      Logger.metric("BlocksService.deleteBlock", performance.now() - start);
      if (error) throw error;
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Duplicate block
   */
  static async duplicateBlock(id: string): Promise<BlockRow> {
    const supabase = this.getSupabase();
    const { data: original, error: fetchErr } = await supabase
      .from("blocks")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !original) throw new Error("Block not found.");

    return await this.createBlock(original.page_id, {
      block_type: original.block_type,
      content: original.content,
      metadata: original.metadata,
      order_index: (original.order_index || 0) + 1,
    });
  }

  /**
   * Reorder blocks
   */
  static async reorderBlocks(
    pageId: string,
    blockOrders: { id: string; order_index: number }[]
  ): Promise<boolean> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const updates = blockOrders.map((item) =>
        supabase.from("blocks").update({ order_index: item.order_index }).eq("id", item.id)
      );

      await Promise.all(updates);
      Logger.metric("BlocksService.reorderBlocks", performance.now() - start);
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
