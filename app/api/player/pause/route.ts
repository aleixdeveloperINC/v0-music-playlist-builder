import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pausePlayback } from "@/lib/spotify";

export async function PUT(_request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("spotify_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie);
        await pausePlayback(session.accessToken);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Pause error:", error);

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
            { error: error.message || "Failed to pause playback" },
            { status: 500 },
        );
    }
}
