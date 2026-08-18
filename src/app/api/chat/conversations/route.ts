import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ChatService } from "@/services/db/chat-service";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      console.warn("[GET /api/chat/conversations] Unauthorized user access attempt");
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId parameter is required" }, { status: 400 });
    }

    // Pass authenticated supabase server client to respect RLS policies
    const conversations = await ChatService.getConversations(workspaceId, user.id, supabase);
    return NextResponse.json({ conversations });
  } catch (err: any) {
    console.error("[GET /api/chat/conversations] Server exception:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // 1. Authenticated User check
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      console.warn("[POST /api/chat/conversations] Unauthorized user access attempt");
      return NextResponse.json({ error: "Unauthorized access: Please sign in" }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, title, sourceScope } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId parameter is required" }, { status: 400 });
    }

    // 2. Validate workspace ownership/membership
    const { data: ws, error: wsErr } = await supabase
      .from("workspaces")
      .select("id, title, owner_id")
      .eq("id", workspaceId)
      .single();

    if (wsErr || !ws) {
      console.error("[POST /api/chat/conversations] Workspace verification failed:", wsErr);
      return NextResponse.json(
        { error: `Workspace not found or access denied: ${wsErr?.message || "Invalid workspaceId"}` },
        { status: 404 }
      );
    }

    if (ws.owner_id !== user.id) {
      console.warn(`[POST /api/chat/conversations] User ${user.id} does not own workspace ${workspaceId}`);
      return NextResponse.json(
        { error: "Access denied: You do not own this workspace" },
        { status: 403 }
      );
    }

    console.log(`[POST /api/chat/conversations] Creating conversation for user=${user.id}, workspace=${workspaceId}`);

    // 3. Create conversation using authenticated server client
    const result = await ChatService.createConversation(
      {
        workspaceId,
        userId: user.id,
        title: title || "New AI Conversation",
        sourceScope: sourceScope || { type: "workspace" },
      },
      supabase
    );

    if (result.error || !result.conversation) {
      console.error("[POST /api/chat/conversations] Failed to create row:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to create conversation in database" },
        { status: 500 }
      );
    }

    console.log(`[POST /api/chat/conversations] Successfully created conversation ID=${result.conversation.id}`);

    return NextResponse.json({ conversation: result.conversation });
  } catch (err: any) {
    console.error("[POST /api/chat/conversations] Server exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error creating conversation" },
      { status: 500 }
    );
  }
}
