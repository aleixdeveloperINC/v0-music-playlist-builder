"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSession } from "@/hooks/use-session";
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
import { useToast } from "@/hooks/use-toast";

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

interface PlaylistDetailClientProps {
  initialPlaylist: Playlist | null;
  initialTracks: TrackWithoutFeatures[];
  playlistId: string;
}

export function PlaylistDetailClient({
  initialPlaylist,
  initialTracks,
  playlistId,
}: PlaylistDetailClientProps) {
  const { toast } = useToast();

  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const [playlist, setPlaylist] = useState<Playlist | null>(initialPlaylist);
  const [tracks, setTracks] = useState<TrackWithoutFeatures[]>(initialTracks);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Track>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  /*  const fetchPlaylist = useCallback(async () => {
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
            featuresError: false,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch playlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]); */

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
      fetchPlaylists();
    }
  }, [isAuthenticated, fetchPlaylists]);

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
    const targetPlaylist = playlists.find((p) => p.id === targetPlaylistId);

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
      // Remove moved tracks from local state instead of refetching
      setTracks((prevTracks) =>
        prevTracks.filter((track) => !selectedTracks.has(track.id)),
      );
      setSelectedTracks(new Set());
      // Update playlist track count
      if (playlist) {
        setPlaylist((prev) =>
          prev
            ? { ...prev, trackCount: prev.trackCount - selected.length }
            : null,
        );
      }

      toast({
        title: "Tracks moved successfully",
        description: `Moved ${selected.length} track(s) to "${targetPlaylist?.name}"`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to move tracks:", error);
      toast({
        title: "Failed to move tracks",
        description: "An error occurred while moving tracks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };
  const handleSort = useCallback(
    (column: keyof Track) => {
      if (sortColumn === column) {
        // Toggle direction if same column
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        // New column, set to asc
        setSortColumn(column);
        setSortDirection("asc");
      }
    },
    [sortColumn, sortDirection],
  );

  const handleRemoveTracks = async (trackIds: string[]) => {
    const tracksToRemove = tracks.filter((t) => trackIds.includes(t.id));

    if (tracksToRemove.length === 0) return;
    try {
      setIsRemoving(true);
      // Call the API to remove tracks
      await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUris: tracksToRemove.map((t) => t.uri) }),
      });
      // Remove tracks from local state
      setTracks((prevTracks) =>
        prevTracks.filter((track) => !trackIds.includes(track.id)),
      );
      setSelectedTracks(new Set());
      // Update playlist track count
      if (playlist) {
        setPlaylist((prev) =>
          prev
            ? { ...prev, trackCount: prev.trackCount - tracksToRemove.length }
            : null,
        );
      }
      setIsRemoving(false);
      toast({
        title: "Tracks removed successfully",
        description: `Removed ${tracksToRemove.length} ${tracksToRemove.length === 1 ? "track" : "tracks"} from playlist`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to remove tracks:", error);
      toast({
        title: "Failed to remove tracks",
        description:
          "An error occurred while removing tracks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const sortedTracks = useMemo(() => {
    if (!sortColumn) return tracks;
    return [...tracks].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      // Convert to comparable values
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      let comparison = 0;
      if (aValue && bValue && aValue < bValue) comparison = -1;
      else if (aValue && bValue && aValue > bValue) comparison = 1;
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [tracks, sortColumn, sortDirection]);
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
                <p className="text-sm text-muted-foreground mb-1">Playlist</p>
                <h1 className="text-2xl font-bold text-foreground">
                  {playlist.name}
                </h1>

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
                <div className="flex gap-4">
                  <Button
                    disabled={selectedTracks.size < 1 || isRemoving}
                    size="sm"
                    className="bg-destructive hover:bg-destructive/90 text-card"
                    onClick={() =>
                      handleRemoveTracks(Array.from(selectedTracks))
                    }
                  >
                    {isRemoving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Remove tracks from Playlist
                  </Button>

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
              </div>
            )}

            <TrackList
              tracks={sortedTracks}
              selectedTracks={selectedTracks}
              onToggleTrack={handleToggleTrack}
              showCheckboxes={true}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRemoveTracks={handleRemoveTracks}
            />
          </div>
        )}
      </main>
    </div>
  );
}
