import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPlaylistTracks, updatePlaylistDetails, removeTracksFromPlaylist } from "@/lib/spotify";

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
    const playlistData = await getPlaylistTracks(session.accessToken, id);

    const playlistInfo = {
      id: playlistData.id,
      name: playlistData.name,
      description: playlistData.description,
      image: playlistData.images?.[0]?.url,
      trackCount: playlistData.tracks?.total,
      ownerId: playlistData.owner?.id,
    };

    const tracks = playlistData.items
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
        }),
      );

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
