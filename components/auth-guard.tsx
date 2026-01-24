"use client";

import { useSession } from "@/hooks/use-session";
import { Header } from "@/components/header";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { SpotifyLoginButton } from "@/components/ui/spotify-login-button";
import { Music, Search, ListMusic } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-spotify/20 flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-spotify" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
              Find Songs by BPM
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Search for tracks by tempo, build the perfect playlist for your
              workout, run, or dance party. Connect your Spotify account to get
              started.
            </p>
            <SpotifyLoginButton />
            
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-4 rounded-lg bg-card border border-border">
                <Search className="w-8 h-8 text-spotify mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Search by BPM</h3>
                <p className="text-sm text-muted-foreground">
                  Filter tracks by tempo to find the perfect rhythm for your activity
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <ListMusic className="w-8 h-8 text-spotify mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Build Playlists</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage playlists directly in your Spotify account
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <Music className="w-8 h-8 text-spotify mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Organize Tracks</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop to reorder, rename, and edit your playlists
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
