import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserSettingsService } from "@/services/db/settings-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await UserSettingsService.getPreferences(user.id, supabase);
    return NextResponse.json(preferences);
  } catch (err: any) {
    console.error("[GET /api/settings/preferences]", err);
    return NextResponse.json({ error: "Failed to fetch settings preferences." }, { status: 500 });
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
    const updated = await UserSettingsService.updatePreferences(user.id, body, supabase);

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[POST /api/settings/preferences]", err);
    return NextResponse.json({ error: "Failed to update settings preferences." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reset = await UserSettingsService.resetPreferences(user.id, supabase);
    return NextResponse.json(reset);
  } catch (err: any) {
    console.error("[PUT /api/settings/preferences]", err);
    return NextResponse.json({ error: "Failed to reset settings preferences." }, { status: 500 });
  }
}
