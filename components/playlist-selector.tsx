"use client";

import type { Playlist } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Music } from "lucide-react";
import Link from "next/link";

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onCreatePlaylist: () => void;
  isLoading: boolean;
}

export function PlaylistSelector({
  playlists,
  onCreatePlaylist,
  isLoading,
}: PlaylistSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-auto py-3 bg-transparent"
        onClick={onCreatePlaylist}
      >
        <div className="w-10 h-10 rounded bg-spotify/20 flex items-center justify-center">
          <Plus className="w-5 h-5 text-spotify" />
        </div>
        <span>Create New Playlist</span>
      </Button>

      {playlists.map((playlist) => (
        <Link
          key={playlist.id}
          href={`/playlists/${playlist.id}`}
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg transition-colors text-left block hover:bg-accent border border-transparent"
          )}
        >
          {playlist.image ? (
            <img
              src={playlist.image || "/placeholder.svg"}
              alt={playlist.name}
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
              <Music className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{playlist.name}</p>
            <p className="text-xs text-muted-foreground">
              {playlist.trackCount} tracks
            </p>
          </div>
        </Link>
      ))}

      {playlists.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No playlists yet. Create one to get started!
        </p>
      )}
    </div>
  );
}
