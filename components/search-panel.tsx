"use client";

import { useState, useCallback } from "react";
import { SearchForm } from "./search-form";
import { TrackList } from "./track-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Track, Playlist } from "@/lib/types";
import { Plus, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SearchPanelProps {
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, tracks: Track[]) => Promise<void>;
  onCreatePlaylist: () => void;
  onPlaylistsUpdate: () => void;
}

export function SearchPanel({
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
}: SearchPanelProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(
    async (query: string, minBpm: string, maxBpm: string) => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const params = new URLSearchParams({ q: query });

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();

        if (data.tracks) {
          let filteredTracks = data.tracks;
          
          if (minBpm || maxBpm) {
            filteredTracks = filteredTracks.filter((track: Track) => {
              if (!track.bpm) return false;
              if (minBpm && track.bpm < parseInt(minBpm)) return false;
              if (maxBpm && track.bpm > parseInt(maxBpm)) return false;
              return true;
            });
          }
          
          setTracks(filteredTracks);
          setSelectedTracks(new Set());
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

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

  const handleAddToPlaylist = async (playlistId: string) => {
    const selected = tracks.filter((t) => selectedTracks.has(t.id));
    if (selected.length === 0) return;

    setIsAdding(true);
    try {
      await onAddToPlaylist(playlistId, selected);
      setSelectedTracks(new Set());
    } finally {
      setIsAdding(false);
    }
  };

  const handleFetchBpm = useCallback(async (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, bpmLoading: true } : t
      )
    );

    try {
      const response = await fetch(`/api/audio-features/${trackId}`);
      const data = await response.json();

      if (data.bpm !== undefined) {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === trackId ? { ...t, bpm: data.bpm, bpmLoading: false } : t
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch BPM:", error);
      setTracks((prev) =>
        prev.map((t) =>
          t.id === trackId ? { ...t, bpmLoading: false } : t
        )
      );
    }
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Search Tracks</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <SearchForm onSearch={handleSearch} isLoading={isSearching} />

        {hasSearched && tracks.length > 0 && (
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
                  Add to Playlist
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onCreatePlaylist}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Playlist
                </DropdownMenuItem>
                {playlists.length > 0 && <DropdownMenuSeparator />}
                {playlists.map((playlist) => (
                  <DropdownMenuItem
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    {playlist.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

          <div className="flex-1 overflow-y-auto">
            {hasSearched ? (
              <TrackList
                tracks={tracks}
                selectedTracks={selectedTracks}
                onToggleTrack={handleToggleTrack}
                onFetchBpm={handleFetchBpm}
              />
            ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Search for tracks by name, artist, or album and filter by BPM
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
