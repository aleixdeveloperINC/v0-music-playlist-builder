import {
  RECCOBEATS_API_BASE,
  SPOTIFY_AUTH_URL,
  SPOTIFY_TOKEN_URL,
  SPOTIFY_API_BASE,
} from "./env";

const SCOPES = [
  "streaming", // ?
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-modify-playback-state",
].join(" ");

export function getSpotifyAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
  });
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function getSpotifyToken(code: string, redirectUri: string) {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get token");
  }

  return response.json();
}

export async function refreshSpotifyToken(refreshToken: string) {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
}

export async function searchTracks(
  accessToken: string,
  query: string,
  limit = 20,
  offset = 0,
) {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await fetch(`${SPOTIFY_API_BASE}/search?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to search tracks");
  }

  return response.json();
}

export async function getAudioFeatures(
  accessToken: string,
  trackIds: string[],
) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/audio-features?ids=${trackIds.join(",")}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new Error("Failed to get audio features");
  }

  return response.json();
}

export async function getAudioFeature(accessToken: string, trackId: string) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/audio-features/${trackId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new Error("Failed to get audio feature");
  }

  return response.json();
}

export async function getUserProfile(accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to get user profile");
  }

  return response.json();
}

export async function getUserPlaylists(accessToken: string, limit = 50) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/playlists?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get playlists");
  }

  return response.json();
}

export async function getPlaylist(accessToken: string, playlistId: string) {
  const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to get playlist");
  }

  return response.json();
}

export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string,
) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get playlist tracks");
  }

  return response.json();
}

export async function createPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description?: string,
) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description, public: false }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create playlist");
  }

  return response.json();
}

export async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[],
) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: trackUris }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to add tracks");
  }

  return response.json();
}

export async function removeTracksFromPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[],
) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tracks: trackUris.map((uri) => ({ uri })) }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to remove tracks");
  }

  return response.json();
}

export async function reorderPlaylistTracks(
  accessToken: string,
  playlistId: string,
  rangeStart: number,
  insertBefore: number,
) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range_start: rangeStart,
        insert_before: insertBefore,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to reorder tracks");
  }

  return response.json();
}

export async function updatePlaylistDetails(
  accessToken: string,
  playlistId: string,
  name: string,
  description?: string,
) {
  const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to update playlist");
  }

  return response;
}

export async function getReccobeatsAudioFeatures(trackIds: string[]) {
  const response = await fetch(
    `${RECCOBEATS_API_BASE}/audio-features?ids=${trackIds.join(",")}`,
  );

  if (!response.ok) {
    throw new Error("Failed to get Reccobeats audio features");
  }

  return response.json();
}

// Player control functions
export async function getAvailableDevices(accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_BASE}/me/player/devices`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to get available devices");
  }

  return response.json();
}

export async function playTrack(
  accessToken: string,
  trackUri: string,
  deviceId?: string,
) {
  const url = deviceId 
    ? `${SPOTIFY_API_BASE}/me/player/play?device_id=${deviceId}`
    : `${SPOTIFY_API_BASE}/me/player/play`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });

  if (!response.ok) {
    throw new Error("Failed to play track");
  }

  return response.json();
}

export async function playPlaylist(
  accessToken: string,
  playlistUri: string,
  deviceId?: string,
) {
  const url = deviceId 
    ? `${SPOTIFY_API_BASE}/me/player/play?device_id=${deviceId}`
    : `${SPOTIFY_API_BASE}/me/player/play`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ context_uri: playlistUri }),
  });

  if (!response.ok) {
    throw new Error("Failed to play playlist");
  }

  return response.json();
}

export async function pausePlayback(accessToken: string, deviceId?: string) {
  const url = deviceId 
    ? `${SPOTIFY_API_BASE}/me/player/pause?device_id=${deviceId}`
    : `${SPOTIFY_API_BASE}/me/player/pause`;

  const response = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to pause playback");
  }

  return response.json();
}

export async function transferPlayback(
  accessToken: string,
  deviceIds: string[],
  play = false,
) {
  const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_ids: deviceIds,
      play,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to transfer playback");
  }

  return response.json();
}
