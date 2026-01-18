import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAudioFeature } from "@/lib/spotify";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const { trackId } = await params;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const audioFeature = await getAudioFeature(session.accessToken, trackId);

    return NextResponse.json({
      tempo: audioFeature.tempo ? Math.round(audioFeature.tempo) : null,
      danceability: audioFeature.danceability ? Math.round(audioFeature.danceability * 100) : null,
      energy: audioFeature.energy ? Math.round(audioFeature.energy * 100) : null,
    });
  } catch (error) {
    console.error("Audio feature error:", error);
    return NextResponse.json({ error: "Failed to get audio feature" }, { status: 500 });
  }
}
