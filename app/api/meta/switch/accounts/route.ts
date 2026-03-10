import { NextResponse } from "next/server";
import { listInstagramAccounts } from "@/lib/meta";
import { supabaseAdmin } from "@/lib/supabase";

type MetaConnection = {
  ig_user_id: string;
  access_token: string;
};

export async function GET() {
  const { data: connection, error: connectionError } = await supabaseAdmin
    .from("meta_instagram_connections")
    .select("ig_user_id, access_token")
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

    return NextResponse.json({
      connectedIgUserId: typedConnection.ig_user_id,
      accounts
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Instagram accounts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

