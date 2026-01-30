"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import useSWR from "swr";

interface PlaybackState {
    isPlaying: boolean;
    activeDeviceId: string | null;
    currentlyPlayingUri: string | null;
    currentContextUri: string | null;
    timestamp: number;
}

interface PlayerContextType {
    playbackState: PlaybackState | null;
    refreshPlayback: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch playback state");
    return res.json();
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useSession();

    // Poll every 5 seconds if authenticated
    const { data, mutate } = useSWR(
        isAuthenticated ? "/api/player/play" : null,
        fetcher,
        {
            refreshInterval: 60000,
            revalidateOnFocus: true
        }
    );

    const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);

    useEffect(() => {
        if (data) {
            setPlaybackState({
                isPlaying: data.is_playing || false,
                activeDeviceId: data.device?.id || null,
                currentlyPlayingUri: data.item?.uri || null,
                currentContextUri: data.context?.uri || null,
                timestamp: Date.now(),
            });
        } else {
            setPlaybackState(null);
        }
    }, [data, isAuthenticated]);

    const refreshPlayback = useCallback(async () => {
        await mutate();
    }, [mutate]);

    return (
        <PlayerContext.Provider value={{ playbackState, refreshPlayback }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}
