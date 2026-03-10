import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("meta_instagram_connections")
    .select("ig_user_id, ig_username, token_expires_at, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    connected: Boolean(data),
    account: data
      ? {
          ig_user_id: data.ig_user_id,
          ig_username: data.ig_username,
          token_expires_at: data.token_expires_at,
          updated_at: data.updated_at
        }
      : null
  });
}
