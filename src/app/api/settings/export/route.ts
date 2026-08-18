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

    const data = await UserSettingsService.exportUserData(user.id, supabase);

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="asp-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err: any) {
    console.error("[GET /api/settings/export]", err);
    return NextResponse.json({ error: "Failed to export user data." }, { status: 500 });
  }
}
