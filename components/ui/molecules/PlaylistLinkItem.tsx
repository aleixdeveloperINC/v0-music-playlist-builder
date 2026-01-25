import type { Playlist } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Music, Clock, ListMusic } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlayButton } from "@/components/ui/play-button";

type PlaylistLinkItemProps = {
    id: string;
    name: string;
    trackCount: number;
    image?: string;
    index?: number;
    duration?: string;
}

export const PlaylistLinkItem = ({ id, name, trackCount, image, index, duration = "2h 15m" }: PlaylistLinkItemProps) => {
    return (
        <div
            className={cn(
                "group flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                "hover:bg-gradient-to-r hover:from-spotify/10 hover:to-transparent",
                "border border-transparent hover:border-spotify/30"
            )}
        >
            {/* Index number (optional) */}
            {index !== undefined && (
                <div className="w-8 text-center">
                    <span className="text-muted-foreground group-hover:text-spotify font-semibold transition-colors duration-300">
                        {index}
                    </span>
                </div>
            )}

            {/* Album/Playlist Image with Play Button */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-spotify/20 to-purple-500/20 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300 shrink-0">
                {image ? (
                    <Image
                        src={image}
                        alt={name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Music className="w-6 h-6 text-spotify" />
                )}
                {/* Play button overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <PlayButton
                        contextUri={`spotify:playlist:${id}`}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-white hover:bg-transparent h-8 w-8"
                    />
                </div>
            </div>

            {/* Playlist Info - Wrapped in Link for navigation */}
            <Link href={`/playlists/${id}`} className="flex-1 min-w-0">
                <div>
                    <h3 className="font-semibold text-foreground group-hover:text-spotify transition-colors duration-300 truncate">
                        {name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ListMusic className="w-3 h-3" />
                            {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {duration}
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}