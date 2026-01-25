import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { pausePlayback } from "@/lib/spotify";

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
    const { deviceId } = body;

    await pausePlayback(accessToken, deviceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error pausing playback:", error);
    
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
          { error: "No active Spotify device found" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to pause playback" },
      { status: 500 }
    );
  }
}