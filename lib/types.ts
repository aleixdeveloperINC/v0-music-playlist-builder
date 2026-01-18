export interface Track {
  id: string;
  name: string;
  uri: string;
  artists: string;
  album: string;
  albumImage?: string;
  duration: number;
  bpm: number | null;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  image?: string;
  trackCount: number;
  ownerId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Session {
  user: User | null;
  accessToken?: string;
}
