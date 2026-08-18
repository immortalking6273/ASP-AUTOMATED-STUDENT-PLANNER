import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CalendarEventsService } from "@/services/db/calendar-events-service";

/**
 * GET  /api/calendar/events?workspaceId=&start=&end=
 * POST /api/calendar/events  { workspaceId, title, ... }
 */

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const start = searchParams.get("start") || new Date().toISOString();
    const end = searchParams.get("end") || new Date(Date.now() + 30 * 86400000).toISOString();

    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const { data: ws } = await supabase
      .from("workspaces").select("id").eq("id", workspaceId).eq("owner_id", user.id).maybeSingle();
    if (!ws) return NextResponse.json({ error: "Workspace not found" }, { status: 403 });

    const events = await CalendarEventsService.getEvents(workspaceId, start, end, supabase);
    return NextResponse.json({ events });
  } catch (err: any) {
    console.error("[GET /api/calendar/events]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, title, description, startTime, endTime, allDay, location, eventType } = body;

    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

    const { data: ws } = await supabase
      .from("workspaces").select("id").eq("id", workspaceId).eq("owner_id", user.id).maybeSingle();
    if (!ws) return NextResponse.json({ error: "Workspace not found" }, { status: 403 });

    const event = await CalendarEventsService.createEvent({
      workspaceId, title, description, startTime, endTime,
      allDay: Boolean(allDay), location, eventType,
    }, supabase);

    return NextResponse.json({ event }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/calendar/events]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
