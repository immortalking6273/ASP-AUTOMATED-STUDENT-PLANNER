import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProfilesService } from "@/services/db/profiles-service";

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
    const { fullName, bio, avatarUrl, timezone, language } = body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

    const updated = await ProfilesService.updateProfile(
      user.id,
      {
        full_name: fullName.trim(),
        bio: bio ? String(bio).trim() : null,
        avatar_url: avatarUrl || undefined,
        timezone: timezone || undefined,
        language: language || undefined,
        updated_at: new Date().toISOString(),
      },
      supabase
    );

    return NextResponse.json({ success: true, profile: updated });
  } catch (err: any) {
    console.error("[POST /api/settings/profile] Server error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
