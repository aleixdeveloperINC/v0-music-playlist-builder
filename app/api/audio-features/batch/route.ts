import { RECCOBEATS_API_BASE } from "@/lib/env";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  if (!ids) {
    return NextResponse.json({ error: "IDs required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${RECCOBEATS_API_BASE}/audio-features?ids=${ids}`,
    );

    if (!response.ok) {
      throw new Error("Failed to get audio features");
    }

    const data = await response.json();

    const features = (data.content || []).map(
      (f: {
        id: string;
        energy: number;
        danceability: number;
        tempo: number;
      }) => ({
        id: f.id,
        tempo: f.tempo ? Math.round(f.tempo) : null,
        danceability: f.danceability ? Math.round(f.danceability * 100) : null,
        energy: f.energy ? Math.round(f.energy * 100) : null,
      }),
    );

    return NextResponse.json({ features });
  } catch (error) {
    console.error("Audio features error:", error);
    return NextResponse.json(
      { error: "Failed to get audio features" },
      { status: 500 },
    );
  }
}
