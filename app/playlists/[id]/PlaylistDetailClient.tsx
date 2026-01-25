"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSession } from "@/hooks/use-session";
import { Header } from "@/components/header";
import { TrackList } from "@/components/track-list";
import type { Playlist, Track } from "@/lib/types";
import { Loader2, ArrowLeft, Plus, Check, Music } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { arrayMove } from "@dnd-kit/sortable";

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
  const { isAuthenticated } = useSession();
  const [playlist, setPlaylist] = useState<Playlist | null>(initialPlaylist);
  const [tracks, setTracks] = useState<TrackWithoutFeatures[]>(initialTracks);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Track>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | undefined>(undefined);

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
      if (sortColumn !== column) {
        // New column, set to asc
        setSortColumn(column);
        setSortDirection("asc");
      } else {
        // Same column, cycle through asc -> desc -> default
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else if (sortDirection === "desc") {
          setSortColumn(undefined); // Reset sort column
          setSortDirection(undefined); // Reset sort direction to default (no sort)
        } else { // Current state is effectively 'default' or undefined
          setSortDirection("asc"); // Go to asc
        }
      }
    },
    [sortColumn, sortDirection],
  );

  const handleRemoveTracks = async (trackIds: string[]) => {
    const tracksToRemove = tracks.filter((t) => trackIds.includes(t.id));

    if (tracksToRemove.length === 0) return;
    try {
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
    }
  };

  const handleReorder = useCallback(async (activeId: string, overId: string) => {
    const oldIndex = tracks.findIndex((track) => track.id === activeId);
    const newIndex = tracks.findIndex((track) => track.id === overId);

    if (oldIndex === -1 || newIndex === -1) {
      console.error("Reorder failed: track not found.");
      return;
    }

    // Update local state immediately for a smoother UX
    const newTracks = arrayMove(tracks, oldIndex, newIndex);
    setTracks(newTracks);

    // Determine Spotify API parameters
    const rangeStart = oldIndex;
    let insertBefore = newIndex;

    // Spotify's reorder API is 0-indexed.
    // If moving down, `insertBefore` needs to be incremented because `insertBefore` is the position *before* which the tracks are inserted.
    // If moving up, `insertBefore` is already the correct target index.
    if (oldIndex < newIndex) {
      insertBefore += 1;
    }

    try {
      await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rangeStart, insertBefore }),
      });
      toast({
        title: "Playlist reordered",
        description: "Track order updated successfully on Spotify.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to reorder tracks:", error);
      toast({
        title: "Reorder failed",
        description: "An error occurred while reordering tracks. Please try again.",
        variant: "destructive",
      });
      // Optionally revert local state on API failure
      setTracks(tracks);
    }
  }, [tracks, playlistId, toast]);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          href="/playlists"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 transition-colors font-bold group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-spotify group-hover:text-black transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm uppercase tracking-widest">Collections</span>
        </Link>

        {!playlist ? (
          <div className="text-center py-20 glass rounded-[3rem] border-white/5">
            <p className="text-muted-foreground font-black tracking-tighter text-2xl">Playlist not found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            <section className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-spotify/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {playlist.image ? (
                  <Image
                    src={playlist.image || "/placeholder.svg"}
                    alt={playlist.name}
                    width={240}
                    height={240}
                    className="w-48 h-48 md:w-60 md:h-60 rounded-[2.5rem] object-cover shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-48 h-48 md:w-60 md:h-60 rounded-[2.5rem] glass border-white/10 flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform duration-500">
                    <Music className="w-20 h-20 text-muted-foreground/20 group-hover:text-spotify/40 transition-colors" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 pb-2">
                <div className="px-4 py-1.5 glass rounded-full border-white/10 inline-block">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-spotify">Playlist</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gradient leading-none">
                  {playlist.name}
                </h1>
                <div className="flex items-center gap-6 text-muted-foreground font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{tracks.length}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-60">Tracks</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-spotify/50" />
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{Math.floor(tracks.reduce((acc, t) => acc + t.duration, 0) / 60000)}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-60">Minutes</span>
                  </div>
                </div>
              </div>
            </section>

            {tracks.length > 0 && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass p-4 rounded-3xl border-white/10">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSelectAll}
                      className="rounded-full px-6 font-bold hover:bg-white/5"
                    >
                      {selectedTracks.size === tracks.length ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Deselect All
                        </>
                      ) : (
                        "Select All"
                      )}
                    </Button>
                    <span className="text-sm font-bold">
                      <span className="text-spotify">{selectedTracks.size}</span>
                      <span className="text-muted-foreground/60"> selected</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          disabled={selectedTracks.size === 0 || isAdding}
                          size="sm"
                          className="bg-spotify hover:bg-spotify-hover text-black font-black rounded-full px-8 shadow-lg shadow-spotify/20 transition-all hover:scale-105 active:scale-95"
                        >
                          {isAdding ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          Move to Collection
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-64 glass border-white/10 mt-2 p-2">
                        {otherPlaylists.length > 0 ? (
                          otherPlaylists.map((playlist) => (
                            <DropdownMenuItem
                              key={playlist.id}
                              onClick={() => handleAddToPlaylist(playlist.id)}
                              className="rounded-xl px-4 py-3"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold tracking-tight">{playlist.name}</span>
                                <span className="text-[8px] uppercase tracking-widest text-muted-foreground">{playlist.trackCount} tracks</span>
                              </div>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="py-4 text-center px-2">
                            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">No other collections</p>
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="glass rounded-[3rem] border-white/10 overflow-hidden shadow-2xl">
                  <TrackList
                    tracks={sortedTracks}
                    selectedTracks={selectedTracks}
                    onToggleTrack={handleToggleTrack}
                    showCheckboxes={true}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onRemoveTracks={handleRemoveTracks}
                    onReorder={handleReorder}
                    enableDragDrop={true}
                  />
                </div>
              </div>
            )}
            
            {tracks.length === 0 && (
              <div className="py-20 text-center glass rounded-[3rem] border-white/5">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Music className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-muted-foreground font-medium italic">
                  This collection is empty.
                </p>
                <Link href="/search">
                  <Button variant="link" className="text-spotify font-black mt-4">Go discover tracks</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
