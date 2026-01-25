"use client";

import { useState } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlayButtonProps {
    /** Spotify URI for playlist, album, or artist context */
    contextUri?: string;
    /** Array of track URIs to play */
    trackUris?: string[];
    /** Position to start playback from */
    offset?: { position?: number; uri?: string };
    /** Button variant */
    variant?: "default" | "ghost" | "icon" | "outline" | "secondary" | "destructive" | "link";
    /** Button size */
    size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
    /** Additional className */
    className?: string;
    /** Show text label */
    showLabel?: boolean;
    /** Callback after successful playback */
    onPlaySuccess?: () => void;
    /** Callback after playback error */
    onPlayError?: (error: string) => void;
}

export function PlayButton({
    contextUri,
    trackUris,
    offset,
    variant = "ghost",
    size = "icon",
    className,
    showLabel = false,
    onPlaySuccess,
    onPlayError,
}: PlayButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePlay = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsPlaying(true);
        setError(null);

        try {
            const response = await fetch("/api/player/play", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contextUri,
                    uris: trackUris,
                    offset,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to start playback");
            }

            onPlaySuccess?.();
        } catch (err: any) {
            const errorMessage = err.message || "Failed to play";
            setError(errorMessage);
            onPlayError?.(errorMessage);
            console.error("Playback error:", err);
        } finally {
            setIsPlaying(false);
        }
    };

    const buttonContent = (
        <>
            {isPlaying ? (
                <Loader2 className={cn("w-4 h-4 animate-spin", showLabel && "mr-2")} />
            ) : error ? (
                <AlertCircle className={cn("w-4 h-4", showLabel && "mr-2")} />
            ) : (
                <Play className={cn("w-4 h-4 fill-current", showLabel && "mr-2")} />
            )}
            {showLabel && (
                <span>
                    {isPlaying ? "Playing..." : error ? "Error" : "Play"}
                </span>
            )}
        </>
    );

    return (
        <Button
            size={size}
            variant={variant === "icon" ? "ghost" : variant}
            className={cn(
                variant === "icon" && "h-8 w-8 p-0 hover:bg-spotify/20",
                variant === "default" && "bg-spotify hover:bg-spotify/90 text-white",
                error && "text-destructive border-destructive",
                className,
            )}
            onClick={handlePlay}
            disabled={isPlaying}
            title={error || "Play on Spotify"}
        >
            {buttonContent}
        </Button>
    );
}
