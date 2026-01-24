import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpotifyLoginButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

export function SpotifyLoginButton({ 
  className, 
  size = "lg",
  variant = "default"
}: SpotifyLoginButtonProps) {
  return (
    <Button
      asChild
      size={size}
      variant={variant}
      className={cn(
        "bg-spotify hover:bg-spotify/90 text-card",
        size === "lg" && "text-lg px-8",
        className
      )}
    >
      <a href="/api/auth/login">Connect with Spotify</a>
    </Button>
  );
}
