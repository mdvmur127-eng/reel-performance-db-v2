import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { buildInstagramAuthUrl } from "@/lib/meta";

export async function GET() {
  try {
    const state = randomUUID();
    const authUrl = buildInstagramAuthUrl(state);
    const response = NextResponse.redirect(authUrl);

    response.cookies.set("ig_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start Instagram auth";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
