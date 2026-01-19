"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { TrackList } from "@/components/track-list";
import type { Playlist, Track } from "@/lib/types";
import { Loader2, Music, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TrackWithoutFeatures extends Omit<
  Track,
  "tempo" | "danceability" | "energy" | "audioFeaturesLoading" | "featuresError"
> {
  tempo: null;
  danceability: null;
  energy: null;
  audioFeaturesLoading: false;
  featuresError?: false;
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const playlistId = params.id as string;
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<TrackWithoutFeatures[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaylist = useCallback(async () => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}`);
      const data = await response.json();

      if (data.playlist) {
        setPlaylist(data.playlist);
      }
      if (data.tracks) {
        setTracks(
          data.tracks.map((t: Track) => ({
            ...t,
            tempo: null,
            danceability: null,
            energy: null,
            audioFeaturesLoading: false,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch playlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylist();
    }
  }, [isAuthenticated, fetchPlaylist]);

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-spotify/20 flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-spotify animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-spotify/20 flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-spotify" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
              Find Songs by BPM
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Search for tracks by tempo, build the perfect playlist for your
              workout, run, or dance party. Connect your Spotify account to get
              started.
            </p>
            <a
              href="/api/auth/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-spotify text-primary-foreground hover:bg-spotify/90 h-11 px-8 text-lg"
            >
              Connect with Spotify
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Link
          href="/playlists"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to playlists
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !playlist ? (
          <div className="text-center py-12 text-muted-foreground">
            Playlist not found
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {playlist.image ? (
                <img
                  src={playlist.image || "/placeholder.svg"}
                  alt={playlist.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                  <Music className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {playlist.name}
                </h1>
                {playlist.description && (
                  <p className="text-muted-foreground mt-1">
                    {playlist.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {tracks.length} tracks
                </p>
              </div>
            </div>

            <TrackList
              tracks={tracks}
              selectedTracks={new Set()}
              onToggleTrack={() => {}}
              showCheckboxes={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
