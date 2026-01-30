"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { PlaylistPanel } from "@/components/playlist-panel";
import type { Playlist } from "@/lib/types";

interface PlaylistsClientProps {
    initialPlaylists: Playlist[];
}

export default function PlaylistsClient({ initialPlaylists }: PlaylistsClientProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const fetchPlaylists = useCallback(async () => {
        setIsLoadingPlaylists(true);
        try {
            const response = await fetch("/api/playlists");
            const data = await response.json();

            const playbackState = await fetch("/api/player/play");
            const playbackStateData = await playbackState.json();


            const contextUri = playbackStateData?.context?.uri
            const isPlayingAny = playbackStateData?.is_playing

            if (data.playlists) {
                setPlaylists(data.playlists.map((p: Playlist) => {
                    return ({
                        ...p,
                        isPlaying: isPlayingAny && p.uri === contextUri,
                    })
                }));
            }
        } catch (error) {
            console.error("Failed to fetch playlists:", error);
        } finally {
            setIsLoadingPlaylists(false);
        }
    }, []);


    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6">
                <PlaylistPanel
                    playlists={playlists}
                    isLoading={isLoadingPlaylists}
                    onPlaylistsUpdate={fetchPlaylists}
                    isCreateDialogOpen={isCreateDialogOpen}
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
                    onPlaySuccess={fetchPlaylists}
                />
            </main>
        </div>
    );
}
