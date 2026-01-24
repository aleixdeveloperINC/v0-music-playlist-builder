"use client";

import type { Track } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface DraggableTrackProps {
  track: Track;
  index: number;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function DraggableTrack({
  track,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDragOver,
}: DraggableTrackProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all",
        isDragging && "opacity-50 scale-95",
        isDragOver && "border-t-2 border-spotify",
        !isDragging && "hover:bg-accent cursor-grab active:cursor-grabbing"
      )}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

      <span className="text-sm text-muted-foreground w-6">{index + 1}</span>

      {track.albumImage ? (
        <Image
          src={track.albumImage || "/placeholder.svg"}
          alt={track.album}
          width={40}
          height={40}
          className="w-10 h-10 rounded object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-xs">No img</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{track.name}</p>
        <p className="text-sm text-muted-foreground truncate">{track.artists}</p>
      </div>

      <div className="text-sm text-muted-foreground w-12 text-right">
        {formatDuration(track.duration)}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
