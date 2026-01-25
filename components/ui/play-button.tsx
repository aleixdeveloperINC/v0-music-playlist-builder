"use client";

import { Play } from "lucide-react";

interface PlayButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
  disabled?: boolean;
}

export function PlayButton({
  onClick,
  isLoading = false,
  size = "sm",
  variant = "default",
  disabled = false,
}: PlayButtonProps) {
  const getButtonClasses = () => {
    let classes = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    
    if (variant === "default") {
      classes += " bg-spotify hover:bg-spotify/90 text-white shadow-lg shadow-spotify/20 hover:shadow-xl hover:shadow-spotify/30";
    } else if (variant === "outline") {
      classes += " border border-input bg-background hover:bg-accent hover:text-accent-foreground";
    } else if (variant === "ghost") {
      classes += " hover:bg-accent hover:text-accent-foreground";
    } else if (variant === "secondary") {
      classes += " bg-secondary text-secondary-foreground hover:bg-secondary/80";
    }
    
    if (size === "sm") {
      classes += " h-8 w-8 rounded-md";
    } else if (size === "default") {
      classes += " h-10 px-4 py-2";
    } else if (size === "lg") {
      classes += " h-11 px-8";
    } else if (size === "icon") {
      classes += " h-10 w-10";
    }
    
    return classes;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={getButtonClasses()}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <Play className="h-4 w-4" fill="currentColor" />
      )}
    </button>
  );
}