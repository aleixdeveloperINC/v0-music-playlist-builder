import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { getAvailableDevices } from "@/lib/spotify";

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const devices = await getAvailableDevices(accessToken);
    return NextResponse.json(devices);
  } catch (error) {
    console.error("Error getting devices:", error);
    return NextResponse.json(
      { error: "Failed to get available devices" },
      { status: 500 }
    );
  }
}