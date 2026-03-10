import { NextResponse } from "next/server";
import { buildInstagramAuthUrl, createInstagramOAuthState } from "@/lib/meta";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceRerequest = url.searchParams.get("force") === "1";
    const state = createInstagramOAuthState();
    const authUrl = buildInstagramAuthUrl(state, { forceRerequest });
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start Instagram auth";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
