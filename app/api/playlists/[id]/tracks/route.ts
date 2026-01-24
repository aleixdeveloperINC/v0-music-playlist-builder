import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  addTracksToPlaylist,
  removeTracksFromPlaylist,
  reorderPlaylistTracks,
  getPlaylistTracks,
} from "@/lib/spotify";
import type { Track } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    const spotifyResponse = await getPlaylistTracks(session.accessToken, id);
    return NextResponse.json({ tracks: spotifyResponse.items.map((item: { track: Track }) => item.track) });
  } catch (error) {
    console.error("Get playlist tracks error:", error);
    return NextResponse.json({ error: "Failed to get playlist tracks" }, { status: 500 });
  }
}

export async function POST(
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
    const { trackUris } = await request.json();

    if (!trackUris || !trackUris.length) {
      return NextResponse.json({ error: "Track URIs required" }, { status: 400 });
    }

    await addTracksToPlaylist(session.accessToken, id, trackUris);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add tracks error:", error);
    return NextResponse.json({ error: "Failed to add tracks" }, { status: 500 });
  }
}

export async function DELETE(
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
    const { trackUris } = await request.json();

    if (!trackUris || !trackUris.length) {
      return NextResponse.json({ error: "Track URIs required" }, { status: 400 });
    }

    await removeTracksFromPlaylist(session.accessToken, id, trackUris);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove tracks error:", error);
    return NextResponse.json({ error: "Failed to remove tracks" }, { status: 500 });
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
    const { rangeStart, insertBefore } = await request.json();

    if (rangeStart === undefined || insertBefore === undefined) {
      return NextResponse.json({ error: "Position data required" }, { status: 400 });
    }

    await reorderPlaylistTracks(session.accessToken, id, rangeStart, insertBefore);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder tracks error:", error);
    return NextResponse.json({ error: "Failed to reorder tracks" }, { status: 500 });
  }
}
