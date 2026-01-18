import { NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/lib/spotify";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  let redirectUri;
  if (process.env.NODE_ENV === "development") {
    redirectUri = `http://127.0.0.1:3000/api/auth/callback`;
  } else {
    redirectUri = `${origin}/api/auth/callback`;
  }
  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  const authUrl = getSpotifyAuthUrl(redirectUri, state);
  return NextResponse.redirect(authUrl);
}
