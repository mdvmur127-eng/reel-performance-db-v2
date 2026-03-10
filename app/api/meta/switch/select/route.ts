import { NextRequest, NextResponse } from "next/server";
import { listInstagramAccounts } from "@/lib/meta";
import { supabaseAdmin } from "@/lib/supabase";

type MetaConnection = {
  access_token: string;
  token_expires_at: string | null;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { igUserId?: string };
  const igUserId = String(body.igUserId ?? "").trim();

  if (!igUserId) {
    return NextResponse.json({ error: "igUserId is required" }, { status: 400 });
  }

  const { data: connection, error: connectionError } = await supabaseAdmin
    .from("meta_instagram_connections")
    .select("access_token, token_expires_at")
    .eq("id", 1)
    .maybeSingle();

  if (connectionError) {
    return NextResponse.json({ error: connectionError.message }, { status: 500 });
  }

  if (!connection) {
    return NextResponse.json(
      { error: "Instagram is not connected. Click Connect IG first." },
      { status: 400 }
    );
  }

  try {
    const typedConnection = connection as MetaConnection;
    const accounts = await listInstagramAccounts(typedConnection.access_token);
    const selected = accounts.find((account) => account.igUserId === igUserId);

    if (!selected) {
      return NextResponse.json(
        { error: "Selected Instagram account is not available for this connection" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("meta_instagram_connections").upsert(
      {
        id: 1,
        ig_user_id: selected.igUserId,
        ig_username: selected.username,
        access_token: typedConnection.access_token,
        token_expires_at: typedConnection.token_expires_at
      },
      { onConflict: "id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      connected: true,
      account: selected
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to switch Instagram account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

