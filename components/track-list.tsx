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
  GripVertical,
} from "lucide-react";
import Image from "next/image";
import { X } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, TouchSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  onReorder?: (activeId: string, overId: string) => void;
  enableDragDrop?: boolean;
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
    return (
      <td
        colSpan={3}
        className={cn("px-4 py-4 text-center", className)}
      >
        <span className="text-muted-foreground/30 text-xs">—</span>
      </td>
    );
  }

  if (!hasFeatures) {
    if (track.featuresError) {
      return (
        <td
          colSpan={3}
          className={cn("px-4 py-4 text-center", className)}
        >
          <span className="text-muted-foreground/50 text-[10px] uppercase tracking-tighter font-bold px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
            Missing
          </span>
        </td>
      );
    }
    return onFetch ? (
      <td
        colSpan={3}
        className={cn("px-4 py-4 text-center", className)}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onFetch(track.id);
          }}
          disabled={track.audioFeaturesLoading}
          className="h-8 px-4 text-[10px] uppercase tracking-widest font-black bg-spotify/10 text-spotify hover:bg-spotify/20 hover:text-spotify rounded-full"
        >
          {track.audioFeaturesLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "Analyze"
          )}
        </Button>
      </td>
    ) : (
      <td
        colSpan={3}
        className={cn("px-4 py-4 text-center", className)}
      >
        <span className="text-muted-foreground/30 text-xs">—</span>
      </td>
    );
  }

  return (
    <>
      <td className={cn("px-4 py-4 text-center", className)}>
        <div
          className="flex flex-col items-center justify-center"
          title="Tempo"
        >
          <span className="text-sm font-black text-foreground tabular-nums tracking-tighter">{Math.round(track.tempo)}</span>
          <span className="text-[8px] uppercase font-bold text-muted-foreground/60 leading-none">BPM</span>
        </div>
      </td>
      <td className={cn("px-4 py-4 text-center", className)}>
        <div
          className="flex flex-col items-center justify-center"
          title="Danceability"
        >
          <span className="text-sm font-black text-foreground tabular-nums tracking-tighter">{track.danceability}%</span>
          <span className="text-[8px] uppercase font-bold text-muted-foreground/60 leading-none">Dance</span>
        </div>
      </td>
      <td className={cn("px-4 py-4 text-center", className)}>
        <div
          className="flex flex-col items-center justify-center"
          title="Energy"
        >
          <span className="text-sm font-black text-foreground tabular-nums tracking-tighter">{track.energy}%</span>
          <span className="text-[8px] uppercase font-bold text-muted-foreground/60 leading-none">Energy</span>
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

interface SortableRowProps {
  track: Track;
  showCheckboxes: boolean;
  selectedTracks: Set<string>;
  onToggleTrack: (trackId: string) => void;
  onFetchAudioFeatures?: (trackId: string) => void;
  onRemoveTracks?: (trackIds: string[]) => void;
  enableDragDrop: boolean;
}

function SortableRow({ track, showCheckboxes, selectedTracks, onToggleTrack, onFetchAudioFeatures, onRemoveTracks, enableDragDrop }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: track.id,
    disabled: !enableDragDrop
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      key={track.id}
      onClick={() => showCheckboxes && onToggleTrack(track.id)}
      className={cn(
        "group transition-all duration-300 border-b border-white/5",
        showCheckboxes && enableDragDrop && "cursor-grab",
        isDragging && "bg-white/10 shadow-2xl scale-[1.02] border-spotify/50",
        selectedTracks.has(track.id) ? "bg-spotify/10" : "hover:bg-white/5",
      )}
    >
      {enableDragDrop && (
        <td key={`${track.id}-drag-handle`} className="px-4 py-4 w-10">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground/30 group-hover:text-spotify cursor-grab active:cursor-grabbing transition-colors"
            style={{ touchAction: "none" }}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 flex-shrink-0" />
          </Button>
        </td>
      )}
      {showCheckboxes && (
        <td key={`${track.id}-checkbox`} className="px-4 py-4 w-10">
          <Checkbox
            checked={selectedTracks.has(track.id)}
            onCheckedChange={() => onToggleTrack(track.id)}
            onClick={(e) => e.stopPropagation()}
            className="border-white/20 data-[state=checked]:bg-spotify data-[state=checked]:text-black"
          />
        </td>
      )}
      <AudioFeatures key={`${track.id}-audio-features`} track={track} onFetch={onFetchAudioFeatures} />

      <td key={`${track.id}-album-image`} className="px-4 py-4 hidden md:table-cell w-20">
        <div className="relative group/cover">
          {track.albumImage ? (
            <Image
              src={track.albumImage || "/placeholder.svg"}
              alt={track.album}
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg object-cover shadow-lg transition-transform group-hover/cover:scale-110"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
              <Music2 className="w-6 h-6 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
            <Music2 className="w-5 h-5 text-spotify" />
          </div>
        </div>
      </td>
      <td key={`${track.id}-track-name`} className="px-4 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-foreground leading-tight group-hover:text-spotify transition-colors">
            {track.name}
          </span>
          <span className="text-xs text-muted-foreground md:hidden mt-0.5">
            {track.artists}
          </span>
        </div>
      </td>
      <td key={`${track.id}-track-artists`} className="px-4 py-4 hidden md:table-cell">
        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {track.artists}
        </p>
      </td>
      <td key={`${track.id}-track-album`} className="px-4 py-4 hidden lg:table-cell">
        <p className="text-sm text-muted-foreground/60 truncate max-w-[150px]">
          {track.album}
        </p>
      </td>

      <td key={`${track.id}-track-duration`} className="px-4 py-4 text-xs font-bold text-muted-foreground tabular-nums text-right hidden md:table-cell">
        {formatDuration(track.duration)}
      </td>
      {onRemoveTracks && (
        <td key={`${track.id}-remove-track`} className="px-4 py-4 text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black tracking-tighter text-2xl">Remove Track</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to remove &quot;<span className="text-foreground font-bold">{track.name}</span>&quot;?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemoveTracks([track.id])}
                  className="bg-destructive hover:bg-destructive/90 rounded-full"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </td>
      )}
    </tr>
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
      <span
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
      </span>
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
  onReorder,
  enableDragDrop = false,
}: TrackListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      onReorder?.(active.id.toString(), over?.id.toString() || '');
    }
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tracks found. Try a different search.
      </div>
    );
  }

  const tableContent = (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-background border-b border-border">
          <tr>
            {enableDragDrop && (
              <th className="px-2 py-1 sm:px-3 sm:py-2 w-8">
                <span className="sr-only">Drag</span>
              </th>
            )}
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
          {enableDragDrop ? (
            <SortableContext
              items={tracks.map((track) => track.id)}
              strategy={verticalListSortingStrategy}
            >
              {tracks.map((track) => (
                <SortableRow
                  key={track.id}
                  track={track}
                  showCheckboxes={showCheckboxes}
                  selectedTracks={selectedTracks}
                  onToggleTrack={onToggleTrack}
                  onFetchAudioFeatures={onFetchAudioFeatures}
                  onRemoveTracks={onRemoveTracks}
                  enableDragDrop={enableDragDrop}
                />
              ))}
            </SortableContext>
          ) : (
            tracks.map((track) => (
              <SortableRow
                key={track.id}
                track={track}
                showCheckboxes={showCheckboxes}
                selectedTracks={selectedTracks}
                onToggleTrack={onToggleTrack}
                onFetchAudioFeatures={onFetchAudioFeatures}
                onRemoveTracks={onRemoveTracks}
                enableDragDrop={enableDragDrop}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (enableDragDrop) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {tableContent}
      </DndContext>
    );
  }

  return tableContent;
}
