import { Music } from "lucide-react";

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-spotify/20 flex items-center justify-center mx-auto mb-4">
          <Music className="w-8 h-8 text-spotify animate-pulse" />
        </div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
