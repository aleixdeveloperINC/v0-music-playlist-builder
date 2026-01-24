"use client";

import { useState, useCallback } from "react";
import type { Playlist } from "@/lib/types";
import { PlaylistSelector } from "./playlist-selector";
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
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 h-full">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Your Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <PlaylistSelector
              playlists={playlists}
              onCreatePlaylist={() => setIsCreateDialogOpen(true)}
              isLoading={isLoading}
            />
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
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
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
