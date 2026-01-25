import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { playTrack, playPlaylist } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, uri, deviceId } = body;

    if (!type || !uri) {
      return NextResponse.json(
        { error: "Missing required parameters: type and uri" },
        { status: 400 }
      );
    }

    if (type === "track") {
      await playTrack(accessToken, uri, deviceId);
    } else if (type === "playlist") {
      await playPlaylist(accessToken, uri, deviceId);
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'track' or 'playlist'" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting playback:", error);
    
    // Handle specific Spotify API errors
    if (error instanceof Error) {
      if (error.message.includes("Premium required")) {
        return NextResponse.json(
          { error: "Spotify Premium is required for playback control" },
          { status: 403 }
        );
      }
      if (error.message.includes("No active device")) {
        return NextResponse.json(
          { error: "No active Spotify device found. Please open Spotify on your device first." },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to start playback" },
      { status: 500 }
    );
  }
}