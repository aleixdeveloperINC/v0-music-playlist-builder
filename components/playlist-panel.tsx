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
import { cn } from "@/lib/utils";

interface PlaylistPanelProps {
  playlists: Playlist[];
  isLoading: boolean;
  onPlaylistsUpdate: () => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  onPlaySuccess?: () => void;
}

export function PlaylistPanel({
  playlists,
  isLoading,
  onPlaylistsUpdate,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  onPlaySuccess
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
        <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-spotify bg-clip-text text-transparent">
              Your Playlists
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and organize your music collections
            </p>
          </CardHeader>
          <CardContent>
            <PlaylistSelector
              playlists={playlists}
              onCreatePlaylist={() => setIsCreateDialogOpen(true)}
              isLoading={isLoading}
              onPlaySuccess={onPlaySuccess}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-spotify bg-clip-text text-transparent">
              Create New Playlist
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Give your playlist a unique name to get started
            </p>
          </DialogHeader>
          <div className="py-6">
            <Label
              htmlFor="new-playlist-name"
              className="text-sm font-semibold text-foreground mb-2 block"
            >
              Playlist Name
            </Label>
            <Input
              id="new-playlist-name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="My Awesome Playlist"
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
              className={cn(
                "h-12 px-4 rounded-xl border-border/50 bg-card/50",
                "focus:border-spotify/50 focus:ring-2 focus:ring-spotify/20",
                "transition-all duration-300"
              )}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className={cn(
                "rounded-xl border-border/50 hover:bg-muted/50",
                "transition-all duration-300"
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={isCreating || !newPlaylistName.trim()}
              className={cn(
                "rounded-xl bg-spotify hover:bg-spotify/90 text-white",
                "shadow-lg shadow-spotify/20 hover:shadow-xl hover:shadow-spotify/30",
                "transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Playlist"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
