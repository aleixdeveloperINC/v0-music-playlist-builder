import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const cookieStore = await cookies();
  cookieStore.delete("spotify_session");
  return NextResponse.redirect(origin, { status: 303 });
}
