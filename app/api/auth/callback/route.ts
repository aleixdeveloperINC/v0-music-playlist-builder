import { NextResponse } from "next/server";
import { getSpotifyToken, getUserProfile } from "@/lib/spotify";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("spotify_auth_state")?.value;

  if (error) {
    return NextResponse.redirect(`${origin}?error=${error}`);
  }

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${origin}?error=state_mismatch`);
  }

  try {
    const redirectUri = `${origin}/api/auth/callback`;
    const tokenData = await getSpotifyToken(code, redirectUri);
    const profile = await getUserProfile(tokenData.access_token);

    const sessionData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      user: {
        id: profile.id,
        name: profile.display_name,
        email: profile.email,
        image: profile.images?.[0]?.url,
      },
    };

    cookieStore.delete("spotify_auth_state");
    cookieStore.set("spotify_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.redirect(origin);
  } catch {
    return NextResponse.redirect(`${origin}?error=token_error`);
  }
}
