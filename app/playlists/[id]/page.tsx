import { cookies } from "next/headers";
import { getPlaylist, getReccobeatsAudioFeatures, getPlaybackState } from "@/lib/spotify";
import { PlaylistDetailClient } from "./PlaylistDetailClient";
import type { Playlist, Track } from "@/lib/types";
import { redirect } from "next/navigation";
// Simple in-memory cache for audio features
interface AudioFeaturesResponse {
  content: {
    id: string;
    energy: number;
    danceability: number;
    tempo: number;
    href?: string;
  }[];
}

class AudioFeaturesCache {
  private cache = new Map<string, { data: AudioFeaturesResponse; timestamp: number }>();
  private readonly TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  get(trackIds: string[]): AudioFeaturesResponse | null {
    const key = trackIds.sort().join(",");
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      console.log(`Cache hit for ${trackIds.length} tracks`);
      return cached.data;
    }

    return null;
  }
  set(trackIds: string[], data: AudioFeaturesResponse): void {
    const key = trackIds.sort().join(",");
    this.cache.set(key, { data, timestamp: Date.now() });
    console.log(`Cached audio features for ${trackIds.length} tracks`);
  }
  clear(): void {
    this.cache.clear();
  }
}
const audioFeaturesCache = new AudioFeaturesCache();
interface TrackWithoutFeatures extends Omit<
  Track,
  "tempo" | "danceability" | "energy" | "audioFeaturesLoading" | "featuresError"
> {
  tempo: number | null;
  danceability: number | null;
  energy: number | null;
  audioFeaturesLoading: boolean;
  featuresError?: boolean;
}

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("spotify_session")?.value;

  if (!sessionCookie) {
    redirect("/api/auth/login");
  }

  try {
    const session = JSON.parse(sessionCookie);
    const [playlistData, playbackState] = await Promise.all([
      getPlaylist(session.accessToken, id),
      getPlaybackState(session.accessToken).catch(() => null),
    ]);

    const playlistUri = `spotify:playlist:${id}`;
    const isCurrentlyPlaying = playbackState?.context?.uri === playlistUri && playbackState?.is_playing;

    const playlistInfo: Playlist = {
      id: playlistData.id,
      name: playlistData.name,
      description: playlistData.description,
      image: playlistData.images?.[0]?.url,
      trackCount: playlistData.tracks?.total,
      ownerId: playlistData.owner?.id,
      isPlaying: isCurrentlyPlaying,
      uri: playlistUri,
    };

    const tracks: TrackWithoutFeatures[] = playlistData.tracks.items
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

    if (tracks.length > 0) {
      try {
        const trackIds = tracks.map((t: { id: string }) => t.id);

        // Check cache first
        let featuresData = audioFeaturesCache.get(trackIds);
        if (!featuresData) {

          featuresData = await getReccobeatsAudioFeatures(trackIds);
          // Cache the result
          if (featuresData?.content) {
            audioFeaturesCache.set(trackIds, featuresData);
          }
        }
        if (featuresData?.content) {
          const featuresMap = new Map<
            string,
            {
              id: string;
              energy: number;
              danceability: number;
              tempo: number;
              href?: string;
            }
          >(
            featuresData.content.map(
              (f: {
                id: string;
                energy: number;
                danceability: number;
                tempo: number;
                href?: string;
              }) => {
                // Extract Spotify track ID from href if available
                let spotifyId = f.id;
                if (f.href) {
                  const match = f.href.match(/\/track\/([a-zA-Z0-9]{22})$/);
                  if (match) {
                    spotifyId = match[1];
                  }
                }
                return [spotifyId, f];
              },
            ),
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
    return (
      <PlaylistDetailClient
        initialPlaylist={playlistInfo}
        initialTracks={tracks}
        playlistId={id}
      />
    );
  } catch (error) {
    console.error("Playlist data fetch error:", error);
    return (
      <PlaylistDetailClient
        initialPlaylist={null}
        initialTracks={[]}
        playlistId={id}

      />
    );
  }
}
