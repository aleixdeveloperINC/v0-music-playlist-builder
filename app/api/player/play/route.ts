import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { startPlayback } from "@/lib/spotify";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("spotify_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 },
            );
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

        await startPlayback(accessToken, {
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
