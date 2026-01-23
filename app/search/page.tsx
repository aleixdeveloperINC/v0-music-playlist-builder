"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { Header } from "@/components/header";
import { SearchPanel } from "@/components/search-panel";
import { Music } from "lucide-react";
import type { Playlist, Track } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const { toast } = useToast();

  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
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
