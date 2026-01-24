"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { Header } from "@/components/header";
import { SearchPanel } from "@/components/search-panel";
import type { Playlist, Track } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const { toast } = useToast();
  const { isAuthenticated } = useSession();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const fetchPlaylists = useCallback(async () => {
    try {
      const response = await fetch("/api/playlists");
      const data = await response.json();
      if (data.playlists) {
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPlaylists();
    }
  }, [isAuthenticated, fetchPlaylists]);

  const handleAddToPlaylist = useCallback(
    async (playlistId: string, tracksToAdd: Track[]) => {
      try {
        // 1. Fetch existing tracks for the target playlist
        const existingTracksResponse = await fetch(`/api/playlists/${playlistId}/tracks`);
        const existingTracksData = await existingTracksResponse.json();
        const existingTrackUris = new Set(existingTracksData.tracks.map((t: Track) => t.uri));

        // 2. Filter out duplicate tracks
        const uniqueTracksToAdd = tracksToAdd.filter(
          (track) => !existingTrackUris.has(track.uri)
        );

        const duplicateTracks = tracksToAdd.filter(
          (track) => existingTrackUris.has(track.uri)
        );

        if (uniqueTracksToAdd.length === 0 && duplicateTracks.length > 0) {
          toast({
            title: "No tracks added",
            description: `${duplicateTracks.length} selected track(s) already exist in this playlist.`,
            variant: "warning",
          });
          return; // Exit if all are duplicates
        }

        if (uniqueTracksToAdd.length > 0) {
          await fetch(`/api/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackUris: uniqueTracksToAdd.map((t) => t.uri) }),
          });
          fetchPlaylists(); // Refresh playlists after adding

          let toastTitle = "Tracks added successfully";
          let toastDescription = `Added ${uniqueTracksToAdd.length} track(s) to playlist.`;

          if (duplicateTracks.length > 0) {
            toastTitle = "Some tracks already existed";
            toastDescription += ` ${duplicateTracks.length} selected track(s) were already in this playlist and were not added again.`;
          }

          toast({
            title: toastTitle,
            description: toastDescription,
            variant: "success",
          });
        }
      } catch (error) {
        console.error("Failed to add tracks:", error);
        toast({
          title: "Failed to add tracks",
          description: "An error occurred while adding tracks to the playlist.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [fetchPlaylists, toast]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <SearchPanel
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={() => {
            // TODO: Implement create playlist functionality
          }}
          onPlaylistsUpdate={fetchPlaylists}
        />
      </main>
    </div>
  );
}
