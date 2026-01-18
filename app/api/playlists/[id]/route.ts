import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getPlaylistTracks,
  updatePlaylistDetails,
  getAudioFeatures,
} from "@/lib/spotify";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const playlistData = await getPlaylistTracks(session.accessToken, id);

    const tracks = playlistData.items
      .filter((item: { track: unknown }) => item.track)
      .map((item: {
        track: {
          id: string;
          name: string;
          uri: string;
          duration_ms: number;
          album: { name: string; images: { url: string }[] };
          artists: { name: string }[];
        };
      }) => item.track);

    if (tracks.length === 0) {
      return NextResponse.json({ tracks: [] });
    }

    const trackIds = tracks.map((t: { id: string }) => t.id);
    const audioFeatures = await getAudioFeatures(session.accessToken, trackIds);

    const tracksWithBpm = tracks.map((track: {
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

    return NextResponse.json({ tracks: tracksWithBpm });
  } catch (error) {
    console.error("Playlist tracks error:", error);
    return NextResponse.json({ error: "Failed to get tracks" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const { name, description } = await request.json();

    await updatePlaylistDetails(session.accessToken, id, name, description);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update playlist error:", error);
    return NextResponse.json({ error: "Failed to update playlist" }, { status: 500 });
  }
}
