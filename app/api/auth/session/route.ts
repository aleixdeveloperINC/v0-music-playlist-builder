import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshSpotifyToken } from "@/lib/spotify";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const session = JSON.parse(sessionCookie);

    if (Date.now() > session.expiresAt - 60000) {
      const tokenData = await refreshSpotifyToken(session.refreshToken);
      session.accessToken = tokenData.access_token;
      session.expiresAt = Date.now() + tokenData.expires_in * 1000;
      if (tokenData.refresh_token) {
        session.refreshToken = tokenData.refresh_token;
      }

      cookieStore.set("spotify_session", JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.json({
      user: session.user,
      accessToken: session.accessToken,
    });
  } catch {
    cookieStore.delete("spotify_session");
    return NextResponse.json({ user: null });
  }
}
