"use client";

import type { Track } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Activity,
  Zap,
  Music2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TrackListProps {
  tracks: Track[];
  selectedTracks: Set<string>;
  onToggleTrack: (trackId: string) => void;
  showCheckboxes?: boolean;
  onFetchAudioFeatures?: (trackId: string) => void;
  sortColumn?: keyof Track;
  sortDirection?: "asc" | "desc";
  onSort?: (column: keyof Track) => void;
  onRemoveTracks?: (trackIds: string[]) => void;
  playlistId?: string;
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function AudioFeatures({
  track,
  onFetch,
  className,
}: {
  track: Track;
  onFetch?: (trackId: string) => void;
  className?: string;
}) {
  const hasFeatures = track.tempo !== null;

  if (!hasFeatures && !onFetch) {
    <td
      colSpan={3}
      className={cn("px-2 py-2 sm:px-3 sm:py-3 text-center", className)}
    >
      <span className="text-muted-foreground text-xs">—</span>
    </td>;
  }

  if (!hasFeatures) {
    if (track.featuresError) {
      return (
        <td
          colSpan={3}
          className={cn("px-2 py-2 sm:px-3 sm:py-3 text-center", className)}
        >
          {" "}
          {/* Applied className */}
          <span className="text-muted-foreground text-xs px-2 py-1 bg-muted/50 rounded">
            No features
          </span>
        </td>
      );
    }
    return onFetch ? (
      <td
        colSpan={3}
        className={cn("px-2 py-2 sm:px-3 sm:py-3 text-center", className)}
      >
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
      </td>
    ) : (
      <td
        colSpan={3}
        className={cn("px-2 py-2 sm:px-3 sm:py-3 text-center", className)}
      >
        <span className="text-muted-foreground text-xs">—</span>
      </td>
    );
  }

  return (
    <>
      <td className={cn("px-2 py-2 sm:px-3 sm:py-3 text-center", className)}>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded"
          title="Tempo"
        >
          <Music2 className="w-3 h-3 text-muted-foreground" />
          <span className="font-medium">{track.tempo}</span>
        </div>
      </td>
      <td className={cn("px-2 py-2 sm:px-3 sm:py-3 text-center", className)}>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded"
          title="Danceability"
        >
          <Activity className="w-3 h-3 text-muted-foreground" />
          <span className="font-medium">{track.danceability}%</span>
        </div>
      </td>
      <td className={cn("px-2 py-2 sm:px-3 sm:py-3 text-center", className)}>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded"
          title="Energy"
        >
          <Zap className="w-3 h-3 text-muted-foreground" />
          <span className="font-medium">{track.energy}%</span>
        </div>
      </td>
    </>
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
  width,
  align = "left",
  className,
}: {
  label: string;
  column: keyof Track;
  currentColumn?: keyof Track;
  sortDirection?: "asc" | "desc";
  onClick?: () => void;
  width?: string;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-2 py-1 sm:px-3 sm:py-2 text-left text-xs font-medium uppercase",
        onClick && "cursor-pointer hover:bg-accent select-none",
        className,
      )}
      onClick={onClick}
      style={{ width: width || "auto", textAlign: align }}
    >
      <div
        className={cn("flex items-center gap-1", {
          "justify-center": align === "center",
          "justify-end": align === "right",
        })}
      >
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
  onRemoveTracks,
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
              <th className="px-2 py-1 sm:px-3 sm:py-2 w-8">
                <span className="sr-only">Select</span>
              </th>
            )}
            <TableHeader
              label="Tempo"
              column="tempo"
              currentColumn={sortColumn}
              sortDirection={sortDirection}
              onClick={() => onSort?.("tempo")}
              width="100px"
              align="center"
            />
            <TableHeader
              label="Dance"
              column="danceability"
              currentColumn={sortColumn}
              sortDirection={sortDirection}
              onClick={() => onSort?.("danceability")}
              width="100px"
              align="center"
            />
            <TableHeader
              label="Energy"
              column="energy"
              currentColumn={sortColumn}
              sortDirection={sortDirection}
              onClick={() => onSort?.("energy")}
              width="100px"
              align="center"
            />
            <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">
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
              width="40px"
            />
            <TableHeader
              label="Album"
              column="album"
              currentColumn={sortColumn}
              sortDirection={sortDirection}
              onClick={() => onSort?.("album")}
              className="hidden md:table-cell"
            />

            <TableHeader
              label="Duration"
              column="duration"
              currentColumn={sortColumn}
              sortDirection={sortDirection}
              onClick={() => onSort?.("duration")}
              className="hidden md:table-cell"
            />
            {onRemoveTracks && (
              <th className="px-2 py-1 sm:px-3 sm:py-2 w-12">
                <span className="sr-only">Actions</span>
              </th>
            )}
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
                selectedTracks.has(track.id) && "bg-accent/50",
              )}
            >
              {showCheckboxes && (
                <td className="px-2 py-2 sm:px-3 sm:py-3">
                  <Checkbox
                    checked={selectedTracks.has(track.id)}
                    onCheckedChange={() => onToggleTrack(track.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              <AudioFeatures track={track} onFetch={onFetchAudioFeatures} />

              <td className="px-2 py-2 sm:px-3 sm:py-3 hidden md:table-cell">
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
                    <span className="text-muted-foreground text-xs">
                      No img
                    </span>
                  </div>
                )}
              </td>
              <td className="px-2 py-2 sm:px-3 sm:py-3">
                <p className="font-medium text-foreground truncate max-w-[200px]">
                  {track.name}
                </p>
              </td>
              <td className="px-2 py-2 sm:px-3 sm:py-3">
                <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {track.artists}
                </p>
              </td>
              <td className="px-2 py-2 sm:px-3 sm:py-3 hidden md:table-cell">
                <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {track.album}
                </p>
              </td>

              <td className="px-2 py-2 sm:px-3 sm:py-3 text-sm text-muted-foreground text-right whitespace-nowrap hidden md:table-cell">
                {formatDuration(track.duration)}
              </td>
              {onRemoveTracks && (
                <td className="px-2 py-2 sm:px-3 sm:py-3 text-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Track</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove &quot;{track.name}&quot; from
                          this playlist? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onRemoveTracks([track.id])}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
