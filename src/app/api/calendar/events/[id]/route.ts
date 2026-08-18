import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CalendarEventsService } from "@/services/db/calendar-events-service";

/**
 * PUT    /api/calendar/events/[id]  { title?, description?, ... }
 * DELETE /api/calendar/events/[id]
 */

async function resolveEvent(supabase: any, user: any, eventId: string) {
  const { data } = await supabase
    .from("calendar_events")
    .select("id, user_id, workspace_id")
    .eq("id", eventId)
    .maybeSingle();
  return data;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const event = await resolveEvent(supabase, user, id);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (event.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const updated = await CalendarEventsService.updateEvent(id, {
      title: body.title,
      description: body.description,
      startTime: body.startTime,
      endTime: body.endTime,
      allDay: body.allDay,
      location: body.location,
      eventType: body.eventType,
    }, supabase);

    return NextResponse.json({ event: updated });
  } catch (err: any) {
    console.error("[PUT /api/calendar/events/[id]]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const event = await resolveEvent(supabase, user, id);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (event.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await CalendarEventsService.deleteEvent(id, supabase);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/calendar/events/[id]]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
