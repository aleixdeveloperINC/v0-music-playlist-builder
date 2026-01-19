import { NextResponse } from "next/server";

const RECCOBEATS_API_BASE = "https://api.reccobeats.com/v1";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const { trackId } = await params;

  try {
    const response = await fetch(
      `${RECCOBEATS_API_BASE}/audio-features?ids=${trackId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to get audio features");
    }

    const data = await response.json();
    const audioFeature = data.content?.[0];

    if (!audioFeature) {
      return NextResponse.json({ error: "Audio features not found" }, { status: 404 });
    }

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
