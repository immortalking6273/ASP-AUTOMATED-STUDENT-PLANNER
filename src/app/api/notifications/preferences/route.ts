import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NotificationPreferencesService } from "@/services/db/notifications-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await NotificationPreferencesService.getPreferences(user.id, supabase);
    return NextResponse.json(preferences);
  } catch (err: any) {
    console.error("[GET /api/notifications/preferences]", err);
    return NextResponse.json({ error: "Failed to fetch notification preferences." }, { status: 500 });
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
    const updated = await NotificationPreferencesService.updatePreferences(user.id, body, supabase);

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[POST /api/notifications/preferences]", err);
    return NextResponse.json({ error: "Failed to update notification preferences." }, { status: 500 });
  }
}
