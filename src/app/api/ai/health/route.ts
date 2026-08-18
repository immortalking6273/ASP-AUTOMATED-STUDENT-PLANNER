import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NvidiaNimProvider } from "@/services/ai/nvidia-nim-provider";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
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
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Run server-side NVIDIA NIM health diagnostic
    const health = await NvidiaNimProvider.checkHealth();
    return NextResponse.json(health, { status: health.chatCompletionAvailable ? 200 : 503 });
  } catch (err: any) {
    return NextResponse.json(
      {
        provider: "nvidia-nim",
        error: "Health check error",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
