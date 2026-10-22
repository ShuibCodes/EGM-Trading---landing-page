import { NextResponse } from "next/server";
import { createCallbackLead } from "@/lib/callback";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const supabase = createAdminClient();

  const result = await createCallbackLead(body, {
    insert: async (row) => {
      if (!supabase) return { error: { code: "unconfigured" } };
      const { error } = await supabase.from("callback_requests").insert(row);
      return { error: error ? { code: error.code } : null };
    },
  });

  if (result.ok) return NextResponse.json({ ok: true });

  const status = result.error === "already_requested" ? 409 : result.error === "unavailable" ? 503 : 400;
  return NextResponse.json({ ok: false, error: result.error }, { status });
}
