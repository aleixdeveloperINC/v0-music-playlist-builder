import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { searchTracks, getAudioFeatures } from "@/lib/spotify";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const minBpm = searchParams.get("minBpm");
  const maxBpm = searchParams.get("maxBpm");

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const searchResult = await searchTracks(session.accessToken, query);
    const tracks = searchResult.tracks.items;

    if (tracks.length === 0) {
      return NextResponse.json({ tracks: [] });
    }

    const trackIds = tracks.map((t: { id: string }) => t.id);
    const audioFeatures = await getAudioFeatures(session.accessToken, trackIds);

    let tracksWithBpm = tracks.map((track: {
      id: string;
      name: string;
      uri: string;
      duration_ms: number;
      album: { name: string; images: { url: string }[] };
      artists: { name: string }[];
    }, index: number) => ({
      id: track.id,
      name: track.name,
      uri: track.uri,
      artists: track.artists.map((a: { name: string }) => a.name).join(", "),
      album: track.album.name,
      albumImage: track.album.images[0]?.url,
      duration: track.duration_ms,
      bpm: audioFeatures.audio_features[index]?.tempo
        ? Math.round(audioFeatures.audio_features[index].tempo)
        : null,
    }));

    if (minBpm || maxBpm) {
      tracksWithBpm = tracksWithBpm.filter((track: { bpm: number | null }) => {
        if (!track.bpm) return false;
        if (minBpm && track.bpm < parseInt(minBpm)) return false;
        if (maxBpm && track.bpm > parseInt(maxBpm)) return false;
        return true;
      });
    }

    return NextResponse.json({ tracks: tracksWithBpm });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
