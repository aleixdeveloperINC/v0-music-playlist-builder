import { cookies } from "next/headers";
import { refreshSpotifyToken } from "./spotify";

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie);

    // Refresh token if it's about to expire (1 minute buffer)
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

    return session.accessToken;
  } catch {
    // If session is invalid, delete it and return null
    cookieStore.delete("spotify_session");
    return null;
  }
}