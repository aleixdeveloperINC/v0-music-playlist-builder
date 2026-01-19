"use client";

import type { Track } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Activity, Zap, Music2, ArrowUp, ArrowDown } from "lucide-react";

interface TrackListProps {
  tracks: Track[];
  selectedTracks: Set<string>;
  onToggleTrack: (trackId: string) => void;
  showCheckboxes?: boolean;
  onFetchAudioFeatures?: (trackId: string) => void;
  sortColumn?: keyof Track;
  sortDirection?: "asc" | "desc";
  onSort?: (column: keyof Track) => void;
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function AudioFeatures({
  track,
  onFetch,
}: {
  track: Track;
  onFetch?: (trackId: string) => void;
}) {
  const hasFeatures = track.tempo !== null;

  if (!hasFeatures && !onFetch) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  if (!hasFeatures) {
    if (track.featuresError) {
      return (
        <span className="text-muted-foreground text-xs px-2 py-1 bg-muted/50 rounded">
          No features
        </span>
      );
    }
    return onFetch ? (
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onFetch(track.id);
        }}
        disabled={track.audioFeaturesLoading}
        className="h-7 px-3 text-xs"
      >
        {track.audioFeaturesLoading ? (
          <>
            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
            Loading...
          </>
        ) : (
          "Get features"
        )}
      </Button>
    ) : (
      <span className="text-muted-foreground text-xs">—</span>
    );
  }

  return (
    <div className="flex gap-2 text-xs">
      <div
        className="flex items-center gap-1 bg-muted px-2 py-1 rounded"
        title="Tempo"
      >
        <Music2 className="w-3 h-3 text-muted-foreground" />
        <span className="font-medium">{track.tempo}</span>
      </div>
      <div
        className="flex items-center gap-1 bg-muted px-2 py-1 rounded"
        title="Danceability"
      >
        <Activity className="w-3 h-3 text-muted-foreground" />
        <span className="font-medium">{track.danceability}%</span>
      </div>
      <div
        className="flex items-center gap-1 bg-muted px-2 py-1 rounded"
        title="Energy"
      >
        <Zap className="w-3 h-3 text-muted-foreground" />
        <span className="font-medium">{track.energy}%</span>
      </div>
    </div>
  );
}

function SortIcon({
  column,
  currentColumn,
  direction,
}: {
  column: keyof Track;
  currentColumn?: keyof Track;
  direction?: "asc" | "desc";
}) {
  if (!currentColumn || column !== currentColumn) {
    return null;
  }
  return direction === "asc" ? (
    <ArrowUp className="w-3 h-3" />
  ) : (
    <ArrowDown className="w-3 h-3" />
  );
}

function TableHeader({
  label,
  column,
  currentColumn,
  sortDirection,
  onClick,
}: {
  label: string;
  column: keyof Track;
  currentColumn?: keyof Track;
  sortDirection?: "asc" | "desc";
  onClick?: () => void;
}) {
  const isActive = currentColumn === column;

  return (
    <th
      className={cn(
        "px-3 py-2 text-left text-xs font-medium uppercase tracking-wider",
        onClick && "cursor-pointer hover:bg-accent select-none"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon
          column={column}
          currentColumn={currentColumn}
          direction={sortDirection}
        />
      </div>
    </th>
  );
}

export function TrackList({
  tracks,
  selectedTracks,
  onToggleTrack,
  showCheckboxes = true,
  onFetchAudioFeatures,
  sortColumn,
  sortDirection,
  onSort,
}: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tracks found. Try a different search.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-background border-b border-border">
          <tr>
            {showCheckboxes && (
              <th className="px-3 py-2 w-8">
                <span className="sr-only">Select</span>
              </th>
            )}
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
              Cover
            </th>
            <TableHeader
              label="Title"
              column="name"
              currentColumn={sortColumn}
              sortDirection={sortDirection}
              onClick={() => onSort?.("name")}
            />
            <TableHeader
              label="Artist"
              column="artists"
              currentColumn={sortColumn}
              sortDirection={sortDirection}
              onClick={() => onSort?.("artists")}
            />
            <TableHeader
              label="Album"
              column="album"
              currentColumn={sortColumn}
              sortDirection={sortDirection}
              onClick={() => onSort?.("album")}
            />
            <TableHeader
              label="Audio Features"
              column="tempo"
              currentColumn={sortColumn}
            />
            <TableHeader
              label="Duration"
              column="duration"
              currentColumn={sortColumn}
              sortDirection={sortDirection}
              onClick={() => onSort?.("duration")}
            />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tracks.map((track) => (
            <tr
              key={track.id}
              onClick={() => showCheckboxes && onToggleTrack(track.id)}
              className={cn(
                "transition-colors",
                showCheckboxes && "cursor-pointer hover:bg-accent",
                selectedTracks.has(track.id) && "bg-accent/50"
              )}
            >
              {showCheckboxes && (
                <td className="px-3 py-3">
                  <Checkbox
                    checked={selectedTracks.has(track.id)}
                    onCheckedChange={() => onToggleTrack(track.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              <td className="px-3 py-3">
                {track.albumImage ? (
                  <img
                    src={track.albumImage || "/placeholder.svg"}
                    alt={track.album}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No img</span>
                  </div>
                )}
              </td>
              <td className="px-3 py-3">
                <p className="font-medium text-foreground truncate max-w-[200px]">
                  {track.name}
                </p>
              </td>
              <td className="px-3 py-3">
                <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {track.artists}
                </p>
              </td>
              <td className="px-3 py-3">
                <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {track.album}
                </p>
              </td>
              <td className="px-3 py-3">
                <AudioFeatures track={track} onFetch={onFetchAudioFeatures} />
              </td>
              <td className="px-3 py-3 text-sm text-muted-foreground text-right whitespace-nowrap">
                {formatDuration(track.duration)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
