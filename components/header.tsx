"use client";

import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Music, LogOut } from "lucide-react";

export function Header() {
  const { user, isLoading, isAuthenticated } = useSession();

  const handleLogout = async () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/logout";
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-spotify flex items-center justify-center">
            <Music className="w-5 h-5 text-card" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">BPM Finder</h1>
            <p className="text-xs text-muted-foreground">Search by tempo</p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
        ) : isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-spotify text-card text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild className="bg-spotify hover:bg-spotify/90 text-card">
            <a href="/api/auth/login">Connect Spotify</a>
          </Button>
        )}
      </div>
    </header>
  );
}
