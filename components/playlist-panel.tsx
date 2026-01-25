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
    <div className="h-full flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="flex flex-col gap-4">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gradient leading-none">
          Your Library.
        </h2>
        <p className="text-muted-foreground max-w-lg font-medium">
          Manage your collections and curate the perfect soundscapes for your activities.
        </p>
      </section>

      <section className="flex-1">
        <PlaylistSelector
          playlists={playlists}
          onCreatePlaylist={() => setIsCreateDialogOpen(true)}
          isLoading={isLoading}
        />
      </section>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass border-white/10 rounded-[2.5rem] p-8 max-w-md">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black tracking-tighter">Create Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-playlist-name" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Title</Label>
              <Input
                id="new-playlist-name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Morning Jog, Deep Focus..."
                className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-spotify/50 text-lg px-6"
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
              />
            </div>
          </div>
          <DialogFooter className="mt-8 gap-3 sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
              className="rounded-full px-8 font-bold hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={isCreating || !newPlaylistName.trim()}
              className="bg-spotify hover:bg-spotify-hover text-black font-black rounded-full px-10 shadow-lg shadow-spotify/20"
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Launch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
