import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS, getPublicStorageUrl } from "@/config/storage";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Validate file type & size (5MB max)
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image format. Supported formats: PNG, JPG, WEBP." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image file size exceeds 5MB limit." }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "png";
    const path = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      console.error("[Avatar Upload Error]", uploadErr);
      return NextResponse.json({ error: `Avatar upload failed: ${uploadErr.message}` }, { status: 500 });
    }

    const { data: pubUrlData } = supabase.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .getPublicUrl(path);

    const avatarUrl = pubUrlData.publicUrl;

    // Update profiles table with new avatar_url
    await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return NextResponse.json({ avatarUrl });
  } catch (err: any) {
    console.error("[POST /api/settings/avatar]", err);
    return NextResponse.json({ error: "Failed to upload avatar." }, { status: 500 });
  }
}
