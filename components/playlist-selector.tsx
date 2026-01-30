"use client";

import type { Playlist } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Music } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaylistLinkItem } from "./ui/molecules/PlaylistLinkItem";

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onCreatePlaylist: () => void;
  isLoading: boolean;
  onPlaySuccess?: () => void;
}

export function PlaylistSelector({
  playlists,
  onCreatePlaylist,
  isLoading,
  onPlaySuccess,
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
        className={cn(
          "w-full justify-start gap-4 h-auto p-4 rounded-xl transition-all duration-300",
          "border-border/50 bg-card/50 backdrop-blur-sm",
          "hover:bg-gradient-to-r hover:from-spotify/10 hover:to-transparent",
          "hover:border-spotify/30"
        )}
        onClick={onCreatePlaylist}
      >
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-spotify/20 to-purple-500/20 flex items-center justify-center shadow-md">
          <Plus className="w-6 h-6 text-spotify" />
        </div>
        <div className="flex-1 text-left">
          <span className="font-semibold text-foreground">Create New Playlist</span>
          <p className="text-xs text-muted-foreground mt-0.5">Start building your collection</p>
        </div>
      </Button>

      {playlists.map((playlist, index) => (
        <PlaylistLinkItem
          key={playlist.id}
          id={playlist.id}
          name={playlist.name}
          trackCount={playlist.trackCount}
          image={playlist.image}
          index={index + 1}
          isPlaying={playlist.isPlaying}
          onPlaySuccess={onPlaySuccess}
        />
      ))}

      {playlists.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No playlists yet. Create one to get started!
        </p>
      )}
    </div>
  );
}
