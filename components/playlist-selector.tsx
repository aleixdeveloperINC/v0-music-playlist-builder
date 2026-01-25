"use client";

import type { Playlist } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Music } from "lucide-react";
import Image from "next/image";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <button
        onClick={onCreatePlaylist}
        className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-spotify/50 hover:bg-spotify/5 transition-all duration-500"
      >
        <div className="w-12 h-12 rounded-2xl bg-spotify/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-spotify group-hover:text-black transition-all">
          <Plus className="w-6 h-6 text-spotify group-hover:text-inherit" />
        </div>
        <span className="font-bold tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">New Playlist</span>
      </button>

      {playlists.map((playlist) => (
        <Link
          key={playlist.id}
          href={`/playlists/${playlist.id}`}
          className="group relative flex items-center gap-4 p-4 rounded-[2rem] glass border-white/10 hover:border-spotify/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl shadow-spotify/10"
        >
          <div className="relative shrink-0">
            {playlist.image ? (
              <Image
                src={playlist.image || "/placeholder.svg"}
                alt={playlist.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:rotate-3 transition-transform"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:rotate-3 transition-transform">
                <Music className="w-8 h-8 text-muted-foreground/20 group-hover:text-spotify/40 transition-colors" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-spotify rounded-full flex items-center justify-center text-[10px] font-black text-black shadow-lg">
              {playlist.trackCount}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-lg tracking-tighter text-foreground truncate group-hover:text-spotify transition-colors">
              {playlist.name}
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
              Collection
            </p>
          </div>
        </Link>
      ))}

      {playlists.length === 0 && !isLoading && (
        <div className="col-span-full py-20 text-center glass rounded-[3rem] border-white/5">
          <p className="text-muted-foreground font-medium italic">
            Your collection is waiting to be built.
          </p>
        </div>
      )}
    </div>
  );
}
