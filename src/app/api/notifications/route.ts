import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NotificationsService } from "@/services/db/notifications-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const filter = searchParams.get("filter") || "all";

    const [notifications, unreadCount] = await Promise.all([
      NotificationsService.getNotifications(user.id, workspaceId, filter, supabase),
      NotificationsService.getUnreadCount(user.id, supabase),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (err: any) {
    console.error("[GET /api/notifications]", err);
    return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, notificationId, workspaceId } = body;

    if (action === "mark_read" && notificationId) {
      await NotificationsService.markAsRead(notificationId, supabase);
      return NextResponse.json({ success: true });
    }

    if (action === "mark_all_read") {
      await NotificationsService.markAllAsRead(user.id, supabase);
      return NextResponse.json({ success: true });
    }

    if (action === "generate_reminders") {
      const generated = await NotificationsService.generateAutomaticReminders(
        user.id,
        workspaceId,
        supabase
      );
      return NextResponse.json({ success: true, generated });
    }

    if (action === "clear_read") {
      await NotificationsService.clearReadNotifications(user.id, supabase);
      return NextResponse.json({ success: true });
    }

    if (action === "delete" && notificationId) {
      await NotificationsService.deleteNotification(notificationId, supabase);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[POST /api/notifications]", err);
    return NextResponse.json({ error: "Failed to process notification request." }, { status: 500 });
  }
}
