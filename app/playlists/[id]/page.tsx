"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { TrackList } from "@/components/track-list";
import type { Playlist, Track } from "@/lib/types";
import { Loader2, Music, ArrowLeft, Plus, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

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

  const fetchPlaylists = useCallback(async () => {
    try {
      const response = await fetch("/api/playlists");
      const data = await response.json();
      if (data.playlists) {
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylist();
      fetchPlaylists();
    }
  }, [isAuthenticated, fetchPlaylist, fetchPlaylists]);

  const handleToggleTrack = useCallback((trackId: string) => {
    setSelectedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedTracks.size === tracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(tracks.map((t) => t.id)));
    }
  };

  const handleAddToPlaylist = async (targetPlaylistId: string) => {
    const selected = tracks.filter((t) => selectedTracks.has(t.id));
    if (selected.length === 0 || targetPlaylistId === playlistId) return;

    setIsAdding(true);
    try {
      await fetch(`/api/playlists/${targetPlaylistId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUris: selected.map((t) => t.uri) }),
      });

      await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUris: selected.map((t) => t.uri) }),
      });

      setSelectedTracks(new Set());
      fetchPlaylist();
    } catch (error) {
      console.error("Failed to move tracks:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const otherPlaylists = playlists.filter((p) => p.id !== playlistId);

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

            {tracks.length > 0 && (
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                    {selectedTracks.size === tracks.length ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Deselect All
                      </>
                    ) : (
                      "Select All"
                    )}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedTracks.size} of {tracks.length} selected
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      disabled={selectedTracks.size === 0 || isAdding}
                      size="sm"
                      className="bg-spotify hover:bg-spotify/90 text-card"
                    >
                      {isAdding ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Move to Playlist
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {otherPlaylists.length > 0 ? (
                      otherPlaylists.map((playlist) => (
                        <DropdownMenuItem
                          key={playlist.id}
                          onClick={() => handleAddToPlaylist(playlist.id)}
                        >
                          {playlist.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No other playlists
                      </p>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <TrackList
              tracks={tracks}
              selectedTracks={selectedTracks}
              onToggleTrack={handleToggleTrack}
              showCheckboxes={true}
            />
          </div>
        )}
      </main>
    </div>
  );
}
