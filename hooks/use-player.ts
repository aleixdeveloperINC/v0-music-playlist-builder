"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface PlayOptions {
  deviceId?: string;
}

interface PlayerError {
  error: string;
  status?: number;
}

export function usePlayer() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<PlayerError | null>(null);
  const [showDeviceSelection, setShowDeviceSelection] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "track" | "playlist";
    uri: string;
  } | null>(null);

  const clearError = () => setLastError(null);

  const executeWithDeviceCheck = async (
    action: () => Promise<any>,
    fallback: () => void
  ) => {
    try {
      await action();
    } catch (error) {
      const playerError = error as PlayerError;
      if (playerError.error.includes("No active device")) {
        setPendingAction({
          type: pendingAction?.type || "track",
          uri: pendingAction?.uri || "",
        });
        setShowDeviceSelection(true);
      } else {
        setLastError(playerError);
        throw playerError;
      }
    }
  };

  const playTrack = async (trackUri: string, options?: PlayOptions) => {
    setIsLoading(true);
    setLastError(null);
    setPendingAction({ type: "track", uri: trackUri });

    const action = async () => {
      const response = await fetch("/api/player/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "track",
          uri: trackUri,
          deviceId: options?.deviceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to play track");
      }

      return await response.json();
    };

    try {
      await action();
    } catch (error) {
      const playerError = error as PlayerError;
      if (playerError.error.includes("No active device") && !options?.deviceId) {
        setShowDeviceSelection(true);
        return;
      }
      setLastError(playerError);
      throw playerError;
    } finally {
      setIsLoading(false);
    }
  };

  const playPlaylist = async (playlistUri: string, options?: PlayOptions) => {
    setIsLoading(true);
    setLastError(null);

    try {
      const response = await fetch("/api/player/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "playlist",
          uri: playlistUri,
          deviceId: options?.deviceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to play playlist");
      }

      return await response.json();
    } catch (error) {
      const playerError: PlayerError = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
      setLastError(playerError);
      throw playerError;
    } finally {
      setIsLoading(false);
    }
  };

  const pausePlayback = async (deviceId?: string) => {
    setIsLoading(true);
    setLastError(null);

    try {
      const response = await fetch("/api/player/pause", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to pause playback");
      }

      return await response.json();
    } catch (error) {
      const playerError: PlayerError = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
      setLastError(playerError);
      throw playerError;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceSelect = async (deviceId: string) => {
    if (!pendingAction) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/player/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: pendingAction.type,
          uri: pendingAction.uri,
          deviceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to play");
      }

      await response.json();
      setShowDeviceSelection(false);
      setPendingAction(null);
    } catch (error) {
      const playerError: PlayerError = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
      setLastError(playerError);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayWithoutDevice = async () => {
    if (!pendingAction) return;

    try {
      await playTrack(pendingAction.uri);
      setShowDeviceSelection(false);
      setPendingAction(null);
    } catch (error) {
      // Error already handled by playTrack
    }
  };

  return {
    playTrack,
    playPlaylist,
    pausePlayback,
    isLoading,
    lastError,
    clearError,
    showDeviceSelection,
    setShowDeviceSelection,
    handleDeviceSelect,
    handlePlayWithoutDevice,
  };
}