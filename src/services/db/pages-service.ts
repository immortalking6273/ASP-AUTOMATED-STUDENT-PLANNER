import { BaseDatabaseService, QueryOptions } from "./base-service";
import { PageRow } from "@/types/database";
import { Logger } from "@/lib/logger";

export interface PageQueryOptions extends QueryOptions {
  search?: string;
  isArchived?: boolean;
  isFavorite?: boolean;
  parentPageId?: string | null;
}

export interface CreatePageData {
  title: string;
  parent_page_id?: string | null;
  icon?: string | null;
  cover_image?: string | null;
  slug?: string | null;
}

export interface UpdatePageData {
  title?: string;
  parent_page_id?: string | null;
  icon?: string | null;
  cover_image?: string | null;
  slug?: string | null;
  order_index?: number;
  is_favorite?: boolean;
  is_archived?: boolean;
}

export interface PageTreeNode extends PageRow {
  children: PageTreeNode[];
}

export class PagesService extends BaseDatabaseService {
  /**
   * Fetch flat list of pages for a notebook
   */
  static async getPagesByNotebook(
    notebookId: string,
    options?: PageQueryOptions
  ): Promise<PageRow[]> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      let query = supabase
        .from("pages")
        .select("*")
        .eq("notebook_id", notebookId);

      // Archiving filter
      if (options?.isArchived !== undefined) {
        query = query.eq("is_archived", options.isArchived);
      } else {
        query = query.eq("is_archived", false);
      }

      // Favorite filter
      if (options?.isFavorite !== undefined) {
        query = query.eq("is_favorite", options.isFavorite);
      }

      // Parent page filter
      if (options?.parentPageId !== undefined) {
        if (options.parentPageId === null) {
          query = query.is("parent_page_id", null);
        } else {
          query = query.eq("parent_page_id", options.parentPageId);
        }
      }

      // Search query across title
      if (options?.search && options.search.trim() !== "") {
        query = query.ilike("title", `%${options.search.trim()}%`);
      }

      query = query.order("order_index", { ascending: true }).order("created_at", { ascending: true });

      const { data, error } = await query;
      Logger.metric("PagesService.getPagesByNotebook", performance.now() - start);
      if (error) throw error;
      return (data || []) as PageRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Fetch pages and construct hierarchical parent-child PageTreeNode tree structure
   */
  static async getPageTree(notebookId: string, isArchived = false): Promise<PageTreeNode[]> {
    const pages = await this.getPagesByNotebook(notebookId, { isArchived });
    
    const pageMap = new Map<string, PageTreeNode>();
    const rootNodes: PageTreeNode[] = [];

    // Initialize nodes
    pages.forEach((page) => {
      pageMap.set(page.id, { ...page, children: [] });
    });

    // Link children to parents
    pages.forEach((page) => {
      const node = pageMap.get(page.id)!;
      if (page.parent_page_id && pageMap.has(page.parent_page_id)) {
        pageMap.get(page.parent_page_id)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  /**
   * Get single page by ID
   */
  static async getPageById(id: string): Promise<PageRow | null> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

      Logger.metric("PagesService.getPageById", performance.now() - start);
      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data as PageRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Create a new page under a notebook or parent page
   */
  static async createPage(
    notebookId: string,
    data: CreatePageData
  ): Promise<PageRow> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();

      // Determine next order_index
      const { data: maxOrderData } = await supabase
        .from("pages")
        .select("order_index")
        .eq("notebook_id", notebookId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 ? (maxOrderData[0].order_index || 0) + 1 : 0;
      const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const { data: created, error } = await supabase
        .from("pages")
        .insert({
          notebook_id: notebookId,
          parent_page_id: data.parent_page_id || null,
          title: data.title.trim(),
          slug: slug || "untitled",
          icon: data.icon || "FileText",
          cover_image: data.cover_image || null,
          order_index: nextOrder,
          is_favorite: false,
          is_archived: false,
        })
        .select()
        .single();

      Logger.metric("PagesService.createPage", performance.now() - start);
      if (error) throw error;
      return created as PageRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Update page fields
   */
  static async updatePage(id: string, updates: UpdatePageData): Promise<PageRow> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { data: updated, error } = await supabase
        .from("pages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      Logger.metric("PagesService.updatePage", performance.now() - start);
      if (error) throw error;
      return updated as PageRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Move page to a different parent page (re-parenting)
   */
  static async movePage(id: string, targetParentPageId: string | null): Promise<PageRow> {
    // Prevent self-nesting loop
    if (id === targetParentPageId) {
      throw new Error("A page cannot be moved inside itself.");
    }
    return await this.updatePage(id, { parent_page_id: targetParentPageId });
  }

  /**
   * Reorder page siblings or update order indices
   */
  static async reorderPages(
    notebookId: string,
    orders: { id: string; order_index: number; parent_page_id?: string | null }[]
  ): Promise<boolean> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const updates = orders.map((item) =>
        supabase
          .from("pages")
          .update({
            order_index: item.order_index,
            ...(item.parent_page_id !== undefined ? { parent_page_id: item.parent_page_id } : {}),
          })
          .eq("id", item.id)
      );

      await Promise.all(updates);
      Logger.metric("PagesService.reorderPages", performance.now() - start);
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(id: string, currentStatus: boolean): Promise<PageRow> {
    return await this.updatePage(id, { is_favorite: !currentStatus });
  }

  /**
   * Archive page (soft delete)
   */
  static async archivePage(id: string): Promise<boolean> {
    await this.updatePage(id, { is_archived: true });
    return true;
  }

  /**
   * Restore an archived page
   */
  static async restorePage(id: string): Promise<boolean> {
    await this.updatePage(id, { is_archived: false });
    return true;
  }

  /**
   * Delete page permanently
   */
  static async deletePage(id: string): Promise<boolean> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from("pages").delete().eq("id", id);
      Logger.metric("PagesService.deletePage", performance.now() - start);
      if (error) throw error;
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Duplicate page
   */
  static async duplicatePage(id: string): Promise<PageRow> {
    const original = await this.getPageById(id);
    if (!original) throw new Error("Page not found.");

    return await this.createPage(original.notebook_id, {
      title: `${original.title} (Copy)`,
      parent_page_id: original.parent_page_id,
      icon: original.icon,
      cover_image: original.cover_image,
    });
  }
}
