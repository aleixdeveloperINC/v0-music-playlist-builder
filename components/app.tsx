"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { Header } from "./header";
import { SearchPanel } from "./search-panel";
import { PlaylistPanel } from "./playlist-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ListMusic } from "lucide-react";
import type { Playlist, Track } from "@/lib/types";

export function App() {
  const { isAuthenticated } = useSession();
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
              isCreateDialogOpen={isCreateDialogOpen}
              setIsCreateDialogOpen={setIsCreateDialogOpen}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
