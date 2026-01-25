"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchForm } from "./search-form";
import { TrackList } from "./track-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Track, Playlist } from "@/lib/types";
import { Plus, Check, Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE_OPTIONS = [20, 50, 100];

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
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const initialQuery = searchParams.get("q") || "";

  const handleSearch = useCallback(
    async (query: string, updateUrl = true) => {
      setIsSearching(true);
      setHasSearched(true);
      setCurrentPage(1);

      if (updateUrl) {
        router.replace(`?q=${encodeURIComponent(query)}`, { scroll: false });
      }

      try {
        const params = new URLSearchParams({
          q: query,
          limit: pageSize.toString(),
          offset: "0",
        });

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();

        if (data.tracks) {
          setTracks(data.tracks);
          setTotal(data.total || 0);
          setSelectedTracks(new Set());
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [router, pageSize],
  );

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery, false);
    }
  }, [handleSearch, initialQuery]);


  const fetchPage = useCallback(
    async (page: number) => {
      const query = searchParams.get("q");
      if (!query) return;

      setIsSearching(true);
      try {
        const offset = (page - 1) * pageSize;
        const params = new URLSearchParams({
          q: query,
          limit: pageSize.toString(),
          offset: offset.toString(),
        });

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();

        if (data.tracks) {
          setTracks(data.tracks);
          setTotal(data.total || 0);
          setSelectedTracks(new Set());
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [searchParams, pageSize],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchPage(page);
    },
    [fetchPage],
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
      fetchPage(1);
    },
    [fetchPage],
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
      } else if (data.error) {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === trackId
              ? { ...t, audioFeaturesLoading: false, featuresError: true }
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

  const totalPages = Math.ceil(total / pageSize);
  const getStartIndex = () => (currentPage - 1) * pageSize + 1;
  const getEndIndex = () => Math.min(currentPage * pageSize, total);

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gradient">
            Find your rhythm.
          </h2>
          <p className="text-muted-foreground max-w-lg">
            Search millions of tracks and discover their technical heart.
            Build the perfect playlist for any pace.
          </p>
        </div>

        <SearchForm
          onSearch={handleSearch}
          isLoading={isSearching}
          initialQuery={initialQuery}
        />
      </section>

      {hasSearched && (
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass p-4 rounded-2xl border-white/10">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSelectAll}
                className="rounded-full px-4"
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
              <span className="text-sm font-medium">
                <span className="text-spotify">{selectedTracks.size}</span>
                <span className="text-muted-foreground"> selected</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={selectedTracks.size === 0 || isAdding}
                    size="sm"
                    className="bg-spotify hover:bg-spotify-hover text-black font-bold rounded-full px-6 shadow-lg shadow-spotify/20"
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add to Playlist
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/10 mt-2">
                  <DropdownMenuItem onClick={onCreatePlaylist} className="font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </DropdownMenuItem>
                  {playlists.length > 0 && <DropdownMenuSeparator className="bg-white/5" />}
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
          </div>

          <div className="flex-1 overflow-hidden flex flex-col glass rounded-3xl border-white/10 shadow-2xl">
            {tracks.length > 0 ? (
              <>
                <TrackList
                  tracks={tracks}
                  selectedTracks={selectedTracks}
                  onToggleTrack={handleToggleTrack}
                  onFetchAudioFeatures={handleFetchAudioFeatures}
                  enableDragDrop={false}
                />

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-white/5 gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {getStartIndex()}-{getEndIndex()} of {total}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-bold rounded-full">
                            {pageSize} / page
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="glass border-white/10">
                          {PAGE_SIZE_OPTIONS.map((size) => (
                            <DropdownMenuItem
                              key={size}
                              onClick={() => handlePageSizeChange(size)}
                              className={pageSize === size ? "bg-white/10" : ""}
                            >
                              {size} per page
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="rounded-full h-10 w-10 hover:bg-white/5"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <div className="px-4 py-1 bg-white/5 rounded-full border border-white/5">
                        <span className="text-sm font-black">
                          {currentPage} <span className="text-muted-foreground font-medium">/ {totalPages}</span>
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="rounded-full h-10 w-10 hover:bg-white/5"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground gap-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                  <Search className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-medium">No tracks matched your search.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
