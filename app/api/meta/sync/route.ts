import { NextResponse } from "next/server";
import { fetchInstagramReels, fetchReelInsights } from "@/lib/meta";
import { supabaseAdmin } from "@/lib/supabase";

type MetaConnection = {
  ig_user_id: string;
  access_token: string;
};

const toDate = (timestamp?: string) => {
  if (!timestamp) return new Date().toISOString().slice(0, 10);
  return timestamp.slice(0, 10);
};

const toTitle = (caption: string | undefined, mediaId: string) => {
  const firstLine = (caption ?? "").split("\n")[0]?.trim();
  if (firstLine) return firstLine.slice(0, 200);
  return `Reel ${mediaId.slice(-8)}`;
};

export async function POST() {
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

  const typedConnection = connection as MetaConnection;

  try {
    const reels = await fetchInstagramReels(
      typedConnection.access_token,
      typedConnection.ig_user_id
    );

    if (reels.length === 0) {
      return NextResponse.json({ imported: 0, message: "No reels found" });
    }

    const rows = [] as Array<Record<string, string | number | null>>;

    for (const reel of reels) {
      const insights = await fetchReelInsights(typedConnection.access_token, reel.id);

      rows.push({
        date: toDate(reel.timestamp),
        title: toTitle(reel.caption, reel.id),
        url: reel.permalink ?? null,
        views: insights.plays,
        likes: reel.like_count ?? null,
        comments: reel.comments_count ?? null,
        saves: insights.saved,
        shares: insights.shares,
        accounts_reached: insights.reach,
        top_source_of_views: "Reels tab"
      });
    }

    const { error: upsertError } = await supabaseAdmin
      .from("reel_metrics")
      .upsert(rows, { onConflict: "date,title,url" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ imported: rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync reels";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
