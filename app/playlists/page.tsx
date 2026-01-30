import { cookies } from "next/headers";
import { getPlaybackState, getUserPlaylists } from "@/lib/spotify";
import PlaylistsClient from "./PlaylistsClient";
import { redirect } from "next/navigation";
import type { Playlist } from "@/lib/types";

export default async function PlaylistsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    redirect("/api/auth/login");
  }

  let playlists: Playlist[] = [];

  try {
    const session = JSON.parse(sessionCookie);
    const playlistsData = await getUserPlaylists(session.accessToken);
    const playbackState = await getPlaybackState(session.accessToken);


    const contextUri = playbackState?.context?.uri
    const isPlayingAny = playbackState?.is_playing

    playlists = playlistsData.items.map(
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
        isPlaying: isPlayingAny && contextUri === p.uri,
      }),
    );
  } catch (error) {
    console.error("Failed to fetch playlists in SSR:", error);
  }

  return <PlaylistsClient initialPlaylists={playlists} />;
}
