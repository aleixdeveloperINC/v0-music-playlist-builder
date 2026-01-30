import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPlaybackState, startPlayback } from "@/lib/spotify";

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("spotify_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie);
        const playbackState = await getPlaybackState(session.accessToken);
        console.log("DEBUG PLAYBACK STATE 2", playbackState);
        return NextResponse.json(playbackState);
    } catch (error: any) {
        console.error("Playback error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get playback state" },
            { status: 500 },
        );
    }
}


export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("spotify_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }


        const body = await request.json();
        const { contextUri, uris, offset } = body;

        // Validate input
        if (!contextUri && !uris) {
            return NextResponse.json(
                { error: "Either contextUri or uris must be provided" },
                { status: 400 },
            );
        }
        const session = JSON.parse(sessionCookie);
        await startPlayback(
            session.accessToken,
            {
                contextUri,
                uris,
                offset,
            });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Playback error:", error);

        // Handle specific Spotify API errors
        if (error.message?.includes("No active device")) {
            return NextResponse.json(
                {
                    error: "No active device found. Please open Spotify on any device and try again.",
                    code: "NO_ACTIVE_DEVICE"
                },
                { status: 404 },
            );
        }

        if (error.message?.includes("Premium required")) {
            return NextResponse.json(
                {
                    error: "Spotify Premium is required to control playback.",
                    code: "PREMIUM_REQUIRED"
                },
                { status: 403 },
            );
        }

        return NextResponse.json(
            { error: error.message || "Failed to start playback" },
            { status: 500 },
        );
    }
}
