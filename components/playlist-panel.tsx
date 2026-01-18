"use client";

import { useState, useEffect, useCallback } from "react";
import type { Playlist, Track } from "@/lib/types";
import { PlaylistSelector } from "./playlist-selector";
import { PlaylistEditor } from "./playlist-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PlaylistPanelProps {
  playlists: Playlist[];
  isLoading: boolean;
  onPlaylistsUpdate: () => void;
  onAddToPlaylist: (playlistId: string, tracks: Track[]) => Promise<void>;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

export function PlaylistPanel({
  playlists,
  isLoading,
  onPlaylistsUpdate,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
}: PlaylistPanelProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  useEffect(() => {
    if (playlists.length > 0 && !selectedPlaylistId) {
      setSelectedPlaylistId(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId]);

  const handleCreatePlaylist = useCallback(async () => {
    if (!newPlaylistName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlaylistName }),
      });

      const data = await response.json();
      if (data.playlist) {
        setSelectedPlaylistId(data.playlist.id);
        onPlaylistsUpdate();
      }

      setNewPlaylistName("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create playlist:", error);
    } finally {
      setIsCreating(false);
    }
  }, [newPlaylistName, onPlaylistsUpdate, setIsCreateDialogOpen]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Your Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <PlaylistSelector
              playlists={playlists}
              selectedPlaylistId={selectedPlaylistId}
              onSelectPlaylist={setSelectedPlaylistId}
              onCreatePlaylist={() => setIsCreateDialogOpen(true)}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Playlist Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {selectedPlaylist ? (
              <PlaylistEditor
                key={selectedPlaylist.id}
                playlist={selectedPlaylist}
                onUpdate={onPlaylistsUpdate}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a playlist to edit or create a new one
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-playlist-name">Playlist Name</Label>
            <Input
              id="new-playlist-name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="My Awesome Playlist"
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={isCreating || !newPlaylistName.trim()}
              className="bg-spotify hover:bg-spotify/90 text-card"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
