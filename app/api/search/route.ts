import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { searchTracks } from "@/lib/spotify";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

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
    const searchResult = await searchTracks(session.accessToken, query, limit, offset);
    const tracks = searchResult.tracks.items.map(
      (track: {
        id: string;
        name: string;
        uri: string;
        duration_ms: number;
        album: { name: string; images: { url: string }[] };
        artists: { name: string }[];
      }) => ({
        id: track.id,
        name: track.name,
        uri: track.uri,
        artists: track.artists.map((a: { name: string }) => a.name).join(", "),
        album: track.album.name,
        albumImage: track.album.images[0]?.url,
        duration: track.duration_ms,
        tempo: null,
        danceability: null,
        energy: null,
        audioFeaturesLoading: false,
      }),
    );

    return NextResponse.json({
      tracks,
      total: searchResult.tracks.total,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
