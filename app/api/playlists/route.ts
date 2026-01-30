import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserPlaylists,
  createPlaylist,
  getUserProfile,
} from "@/lib/spotify";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const playlists = await getUserPlaylists(session.accessToken);

    return NextResponse.json({
      playlists: playlists.items.map(
        (p: {
          id: string;
          name: string;
          description: string;
          images: { url: string }[];
          tracks: { total: number };
          owner: { id: string };
          uri: string;
        }) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.images?.[0]?.url,
          trackCount: p.tracks?.total,
          ownerId: p.owner.id,
          uri: p.uri,
        }),
      ),
    });
  } catch (error) {
    console.error("Playlists error:", error);
    return NextResponse.json(
      { error: "Failed to get playlists" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const profile = await getUserProfile(session.accessToken);
    const playlist = await createPlaylist(
      session.accessToken,
      profile.id,
      name,
      description,
    );

    return NextResponse.json({
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        image: playlist.images[0]?.url,
        trackCount: 0,
        ownerId: playlist.owner.id,
      },
    });
  } catch (error) {
    console.error("Create playlist error:", error);
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 },
    );
  }
}
