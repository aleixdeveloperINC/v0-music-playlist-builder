"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { Header } from "./header";
import { SearchPanel } from "./search-panel";
import { PlaylistPanel } from "./playlist-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Music, Search, ListMusic } from "lucide-react";
import type { Playlist, Track } from "@/lib/types";

export function App() {
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  const fetchPlaylists = useCallback(async () => {
    setIsLoadingPlaylists(true);
    try {
      const response = await fetch("/api/playlists");
      const data = await response.json();
      if (data.playlists) {
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    } finally {
      setIsLoadingPlaylists(false);
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
      } catch (error) {
        console.error("Failed to add tracks:", error);
        throw error;
      }
    },
    [fetchPlaylists]
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
              Search for tracks by tempo, build the perfect playlist for your workout,
              run, or dance party. Connect your Spotify account to get started.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-spotify hover:bg-spotify/90 text-card text-lg px-8"
            >
              <a href="/api/auth/login">Connect with Spotify</a>
            </Button>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-4 rounded-lg bg-card border border-border">
                <Search className="w-8 h-8 text-spotify mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Search by BPM</h3>
                <p className="text-sm text-muted-foreground">
                  Filter tracks by tempo to find the perfect rhythm for your activity
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <ListMusic className="w-8 h-8 text-spotify mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Build Playlists</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage playlists directly in your Spotify account
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <Music className="w-8 h-8 text-spotify mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Organize Tracks</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop to reorder, rename, and edit your playlists
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="search" className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="playlists" className="gap-2">
              <ListMusic className="w-4 h-4" />
              Playlists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="flex-1 mt-0">
            <SearchPanel
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              onCreatePlaylist={() => {
                setIsCreateDialogOpen(true);
                setActiveTab("playlists");
              }}
              onPlaylistsUpdate={fetchPlaylists}
            />
          </TabsContent>

          <TabsContent value="playlists" className="flex-1 mt-0">
            <PlaylistPanel
              playlists={playlists}
              isLoading={isLoadingPlaylists}
              onPlaylistsUpdate={fetchPlaylists}
              onAddToPlaylist={handleAddToPlaylist}
              isCreateDialogOpen={isCreateDialogOpen}
              setIsCreateDialogOpen={setIsCreateDialogOpen}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
