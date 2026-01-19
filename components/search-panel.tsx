"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchForm } from "./search-form";
import { TrackList } from "./track-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Track, Playlist } from "@/lib/types";
import { Plus, Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Track>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const initialQuery = searchParams.get("q") || "";

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery, false);
    }
  }, []);

  const handleSearch = useCallback(
    async (query: string, updateUrl = true) => {
      setIsSearching(true);
      setHasSearched(true);
      setCurrentPage(1);

      if (updateUrl) {
        router.replace(`?q=${encodeURIComponent(query)}`, { scroll: false });
      }

      try {
        const params = new URLSearchParams({ q: query });

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();

        if (data.tracks) {
          setTracks(data.tracks);
          setSelectedTracks(new Set());
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [router],
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
    if (selectedTracks.size === paginatedTracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(paginatedTracks.map((t) => t.id)));
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

  const handleFetchAudioFeatures = useCallback(async (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, audioFeaturesLoading: true } : t,
      ),
    );

    try {
      const response = await fetch(`/api/audio-features/${trackId}`);
      const data = await response.json();

      if (data.tempo !== undefined) {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === trackId
              ? {
                  ...t,
                  tempo: data.tempo,
                  danceability: data.danceability,
                  energy: data.energy,
                  audioFeaturesLoading: false,
                }
              : t,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to fetch audio features:", error);
      setTracks((prev) =>
        prev.map((t) =>
          t.id === trackId ? { ...t, audioFeaturesLoading: false } : t,
        ),
      );
    }
  }, []);

  const handleSort = (column: keyof Track) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedTracks = useMemo(() => {
    return [...tracks].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [tracks, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedTracks.length / pageSize);
  const paginatedTracks = sortedTracks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const getStartIndex = () => (currentPage - 1) * pageSize + 1;
  const getEndIndex = () =>
    Math.min(currentPage * pageSize, sortedTracks.length);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Search Tracks</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <SearchForm
          onSearch={handleSearch}
          isLoading={isSearching}
          initialQuery={initialQuery}
        />

        {hasSearched && sortedTracks.length > 0 && (
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selectedTracks.size === paginatedTracks.length ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  "Select All"
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedTracks.size} of {sortedTracks.length} selected
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

        <div className="flex-1 overflow-hidden flex flex-col">
          {hasSearched ? (
            <>
              <TrackList
                tracks={paginatedTracks}
                selectedTracks={selectedTracks}
                onToggleTrack={handleToggleTrack}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onFetchAudioFeatures={handleFetchAudioFeatures}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {getStartIndex()}-{getEndIndex()} of{" "}
                      {sortedTracks.length}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {pageSize} per page
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <DropdownMenuItem
                            key={size}
                            onClick={() => handlePageSizeChange(size)}
                            className={pageSize === size ? "bg-accent" : ""}
                          >
                            {size} per page
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Search for tracks by name, artist, or album
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
