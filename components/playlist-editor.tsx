"use client";

import { useState, useEffect, useCallback } from "react";
import type { Track, Playlist } from "@/lib/types";
import { DraggableTrack } from "./draggable-track";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Loader2, Music } from "lucide-react";

interface PlaylistEditorProps {
  playlist: Playlist;
  onUpdate: () => void;
}

export function PlaylistEditor({ playlist, onUpdate }: PlaylistEditorProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(playlist.name);
  const [editDescription, setEditDescription] = useState(playlist.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const fetchTracks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}`);
      const data = await response.json();
      if (data.tracks) {
        setTracks(data.tracks);
      }
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [playlist.id]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  useEffect(() => {
    setEditName(playlist.name);
    setEditDescription(playlist.description || "");
  }, [playlist]);

  const handleRemoveTrack = async (trackUri: string) => {
    try {
      await fetch(`/api/playlists/${playlist.id}/tracks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUris: [trackUri] }),
      });
      setTracks((prev) => prev.filter((t) => t.uri !== trackUri));
      onUpdate();
    } catch (error) {
      console.error("Failed to remove track:", error);
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = async () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newTracks = [...tracks];
      const [movedTrack] = newTracks.splice(dragIndex, 1);
      newTracks.splice(dragOverIndex, 0, movedTrack);
      setTracks(newTracks);

      try {
        await fetch(`/api/playlists/${playlist.id}/tracks`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rangeStart: dragIndex,
            insertBefore: dragOverIndex > dragIndex ? dragOverIndex + 1 : dragOverIndex,
          }),
        });
      } catch (error) {
        console.error("Failed to reorder tracks:", error);
        fetchTracks();
      }
    }

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveDetails = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/playlists/${playlist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      setIsEditDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to update playlist:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        {playlist.image ? (
          <img
            src={playlist.image || "/placeholder.svg"}
            alt={playlist.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
            <Music className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{playlist.name}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {playlist.description || "No description"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {tracks.length} tracks
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Music className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              This playlist is empty. Search for tracks and add them!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((track, index) => (
              <DraggableTrack
                key={`${track.id}-${index}`}
                track={track}
                index={index}
                onRemove={() => handleRemoveTrack(track.uri)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                isDragging={dragIndex === index}
                isDragOver={dragOverIndex === index}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="playlist-name">Name</Label>
              <Input
                id="playlist-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Playlist name"
              />
            </div>
            <div>
              <Label htmlFor="playlist-description">Description</Label>
              <Textarea
                id="playlist-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add an optional description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveDetails}
              disabled={isSaving || !editName.trim()}
              className="bg-spotify hover:bg-spotify/90 text-card"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
