"use client";

import { useState } from "react";
import { Play, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null);



    const handlePlay = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to play";
            setError(errorMessage);
            onPlayError?.(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "warning",
            });
            console.error("Playback error:", err);
        } finally {
        }
    };


    const buttonContent = (
        <>
            {error ? (
                <AlertCircle className={cn("w-4 h-4", showLabel && "mr-2")} />
            ) : (
                <Play className={cn("w-4 h-4 fill-current", showLabel && "mr-2")} />
            )}
            {showLabel && (
                <span>
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
        >
            {buttonContent}
        </Button>
    );
}
