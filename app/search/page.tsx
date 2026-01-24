"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { Header } from "@/components/header";
import { SearchPanel } from "@/components/search-panel";
import type { Playlist, Track } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const { toast } = useToast();
  const { isAuthenticated } = useSession();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const handleAddToPlaylist = useCallback(
    async (playlistId: string, tracks: Track[]) => {
      try {
        await fetch(`/api/playlists/${playlistId}/tracks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackUris: tracks.map((t) => t.uri) }),
        });
        fetchPlaylists();

        toast({
          title: "Tracks added successfully",
          description: `Added ${tracks.length} track(s) to playlist`,
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to add tracks:", error);
        throw error;
      }
    },
    [fetchPlaylists],
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <SearchPanel
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={() => {
            setIsCreateDialogOpen(true);
          }}
          onPlaylistsUpdate={fetchPlaylists}
        />
      </main>
    </div>
  );
}
