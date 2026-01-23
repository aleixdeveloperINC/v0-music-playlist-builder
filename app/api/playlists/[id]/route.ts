import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getPlaylist,
  updatePlaylistDetails,
  removeTracksFromPlaylist,
} from "@/lib/spotify";
import { RECCOBEATS_API_BASE } from "@/lib/env";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const playlistData = await getPlaylist(session.accessToken, id);

    const playlistInfo = {
      id: playlistData.id,
      name: playlistData.name,
      description: playlistData.description,
      image: playlistData.images?.[0]?.url,
      trackCount: playlistData.tracks?.total,
      ownerId: playlistData.owner?.id,
    };

    const tracks = playlistData.tracks.items
      .filter((item: { track: unknown }) => item.track)
      .map(
        (item: {
          track: {
            id: string;
            name: string;
            uri: string;
            duration_ms: number;
            album: { name: string; images: { url: string }[] };
            artists: { name: string }[];
          };
        }) => ({
          id: item.track.id,
          name: item.track.name,
          uri: item.track.uri,
          artists: item.track.artists.map((a) => a.name).join(", "),
          album: item.track.album.name,
          albumImage: item.track.album.images[0]?.url,
          duration: item.track.duration_ms,
          tempo: null,
          danceability: null,
          energy: null,
          audioFeaturesLoading: false,
          featuresError: false,
        }),
      );

    if (tracks.length <= 20 && tracks.length > 0) {
      try {
        const trackIds = tracks.map((t: { id: string }) => t.id).join(",");
        const response = await fetch(
          `${RECCOBEATS_API_BASE}/audio-features?ids=${trackIds}`,
        );

        if (response.ok) {
          const data = await response.json();
          const featuresMap = new Map<
            string,
            { id: string; energy: number; danceability: number; tempo: number }
          >(
            data.content?.map(
              (f: {
                id: string;
                energy: number;
                danceability: number;
                tempo: number;
              }) => [f.id, f],
            ) || [],
          );

          for (const track of tracks) {
            const features = featuresMap.get(track.id);
            if (features) {
              track.tempo = Math.round(features.tempo);
              track.danceability = Math.round(features.danceability * 100);
              track.energy = Math.round(features.energy * 100);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch audio features:", error);
      }
    }

    return NextResponse.json({ playlist: playlistInfo, tracks });
  } catch (error) {
    console.error("Playlist tracks error:", error);
    return NextResponse.json(
      { error: "Failed to get tracks" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
    return NextResponse.json(
      { error: "Failed to update playlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const { trackUris } = await request.json();

    await removeTracksFromPlaylist(session.accessToken, id, trackUris);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove tracks error:", error);
    return NextResponse.json(
      { error: "Failed to remove tracks" },
      { status: 500 },
    );
  }
}
