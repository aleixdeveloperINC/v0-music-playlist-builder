"use client";

import type { Track } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Activity } from "lucide-react";

interface TrackListProps {
  tracks: Track[];
  selectedTracks: Set<string>;
  onToggleTrack: (trackId: string) => void;
  showCheckboxes?: boolean;
  onFetchBpm?: (trackId: string) => void;
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TrackList({
  tracks,
  selectedTracks,
  onToggleTrack,
  showCheckboxes = true,
  onFetchBpm,
}: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tracks found. Try a different search or adjust the BPM range.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tracks.map((track) => (
        <div
          key={track.id}
          onClick={() => showCheckboxes && onToggleTrack(track.id)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors",
            showCheckboxes && "cursor-pointer hover:bg-accent",
            selectedTracks.has(track.id) && "bg-accent"
          )}
        >
          {showCheckboxes && (
            <Checkbox
              checked={selectedTracks.has(track.id)}
              onCheckedChange={() => onToggleTrack(track.id)}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {track.albumImage ? (
            <img
              src={track.albumImage || "/placeholder.svg"}
              alt={track.album}
              className="w-12 h-12 rounded object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No img</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{track.name}</p>
            <p className="text-sm text-muted-foreground truncate">{track.artists}</p>
          </div>

          <div className="hidden sm:block text-sm text-muted-foreground w-32 truncate">
            {track.album}
          </div>

          <div className="text-sm font-medium text-spotify w-16 text-right">
            {track.bpm ? `${track.bpm} BPM` : onFetchBpm ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFetchBpm(track.id);
                }}
                disabled={track.bpmLoading}
                className="h-6 px-2 text-xs"
              >
                {track.bpmLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Activity className="w-3 h-3" />
                )}
              </Button>
            ) : (
              "—"
            )}
          </div>

          <div className="text-sm text-muted-foreground w-12 text-right">
            {formatDuration(track.duration)}
          </div>
        </div>
      ))}
    </div>
  );
}
