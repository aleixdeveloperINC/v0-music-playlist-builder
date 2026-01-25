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
      <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-spotify flex items-center justify-center shadow-lg shadow-spotify/20 group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tighter leading-none">BPM Finder</h1>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Beat Precision</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 p-1 bg-muted/50 rounded-full border border-white/5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-white/10">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-spotify text-black font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 glass border-white/10">
                    <div className="flex items-center justify-start gap-2 p-2 border-b border-white/5 mb-1">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10 rounded-full border border-white/10"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </>
            ) : (
              <Button asChild className="bg-spotify hover:bg-spotify-hover text-black font-bold rounded-full px-6 shadow-lg shadow-spotify/20">
                <a href="/api/auth/login">Connect Spotify</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 md:hidden animate-in slide-in-from-top duration-300">
          <div className="bg-card/95 backdrop-blur-xl border-b border-white/10 p-4 shadow-2xl">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-semibold transition-all ${isActive
                      ? "bg-spotify text-black"
                      : "text-muted-foreground hover:bg-white/5"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
