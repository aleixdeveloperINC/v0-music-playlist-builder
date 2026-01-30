
"use client"

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CatalogPage() {
    const { toast } = useToast();
    // Sample data for demonstrations

    const [playbackState, setPlaybackState] = useState(null);

    const handleGetPlaybackState = async () => {
        //fetch read playback state
        const response = await fetch('/api/player/play')
        const data = await response.json();
        setPlaybackState(data);
    };


    const handleToggleStartResumePlayback = async () => {
        //fetch read playback state
        const response = await fetch('/api/player/play', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contextUri: playbackState?.context?.uri,
            }),
        })
        const data = await response.json();
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-spotify/5">
            <div className='flex flex-col gap-4'>
                <button onClick={handleGetPlaybackState}>Click me</button>
                <button onClick={handleToggleStartResumePlayback}>Start/Resume</button>
                <pre>{JSON.stringify(playbackState, null, 2)}</pre>
                <button onClick={() => toast({ title: "Test", description: "Test", variant: "warning" })}>Toast</button>
            </div>
        </div>
    );
}
