"use client";

import { useState } from "react";
import { useSession } from "@/hooks/use-session";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Music, LogOut, Search, ListMusic, Menu, X, Activity } from "lucide-react";

export function Header() {
  const { user, isLoading, isAuthenticated } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/logout";
    document.body.appendChild(form);
    form.submit();
  };

  const navLinks = [
    { href: "/search", label: "Search", icon: Search },
    { href: "/playlists", label: "Playlists", icon: ListMusic },
    { href: "/tap-tempo", label: "Tap Tempo", icon: Activity },
  ];

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-spotify flex items-center justify-center">
              <Music className="w-4 h-4 sm:w-5 sm:h-5 text-card" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">BPM Finder</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Search by tempo</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden sm:flex items-center gap-1 mr-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Menu - Desktop & Mobile */}
          {isLoading ? (
            <div className="h-8 w-20 sm:h-10 sm:w-24 rounded-md bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden h-8 w-8 p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8 sm:h-10 px-2 sm:px-3">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-spotify text-card text-xs sm:text-sm">
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
            </div>
          ) : (
            <Button asChild className="bg-spotify hover:bg-spotify/90 text-card">
              <a href="/api/auth/login">Connect Spotify</a>
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="sm:hidden border-b border-border bg-card">
          <nav className="container mx-auto px-4 py-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors w-full ${isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
