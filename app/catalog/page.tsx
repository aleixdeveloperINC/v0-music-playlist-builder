import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Music, Play, Clock, TrendingUp, Heart, MoreVertical, Share2, ListMusic } from "lucide-react";

export default function CatalogPage() {
    // Sample data for demonstrations
    const samplePlaylists = [
        { id: "1", name: "Chill Vibes", trackCount: 24, image: undefined },
        { id: "2", name: "Workout Mix", trackCount: 18, image: undefined },
        { id: "3", name: "Focus Flow", trackCount: 32, image: undefined },
        { id: "4", name: "Evening Jazz", trackCount: 15, image: undefined },
        { id: "5", name: "Road Trip", trackCount: 42, image: undefined },
        { id: "6", name: "Party Hits", trackCount: 28, image: undefined },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-spotify/5">
            {/* Header */}
            <div className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-spotify bg-clip-text text-transparent">
                                UI Design Catalog
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                5 Modern UI Proposals for Playlist Items
                            </p>
                        </div>
                        <Button className="bg-spotify hover:bg-spotify/90 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Playlist
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 space-y-16">

                {/* ========================================
                    PROPOSAL 1: Modern Grid with Glassmorphism
                    ======================================== */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-spotify to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            1
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Modern Grid with Glassmorphism</h2>
                            <p className="text-muted-foreground">Premium card design with glass effects and gradient overlays</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {samplePlaylists.map((playlist) => (
                            <Link
                                key={playlist.id}
                                href={`/playlists/${playlist.id}`}
                                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-spotify/20 hover:border-spotify/50"
                            >
                                {/* Animated gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-spotify/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Floating orbs effect */}
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-spotify/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                                <div className="relative z-10">
                                    {/* Album Art */}
                                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-spotify/30 to-purple-500/30 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Music className="w-16 h-16 text-spotify/60 group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        {/* Play button overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-spotify flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <h3 className="font-bold text-lg text-foreground group-hover:text-spotify transition-colors duration-300 mb-1">
                                        {playlist.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            {playlist.trackCount} tracks
                                        </p>
                                        <Heart className="w-4 h-4 text-muted-foreground group-hover:text-spotify group-hover:fill-spotify transition-all duration-300" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ========================================
                    PROPOSAL 2: Compact List with Hover Effects
                    ======================================== */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            2
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Compact List with Hover Effects</h2>
                            <p className="text-muted-foreground">Space-efficient design with smooth interactions and metadata</p>
                        </div>
                    </div>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="space-y-2">
                                {samplePlaylists.map((playlist, index) => (
                                    <Link
                                        key={playlist.id}
                                        href={`/playlists/${playlist.id}`}
                                        className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-spotify/10 hover:to-transparent border border-transparent hover:border-spotify/30"
                                    >
                                        {/* Index number */}
                                        <div className="w-8 text-center">
                                            <span className="text-muted-foreground group-hover:text-spotify font-semibold transition-colors duration-300">
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Album Art */}
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-spotify/20 to-purple-500/20 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                                            <Music className="w-6 h-6 text-spotify" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <Play className="w-5 h-5 text-white fill-white" />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground group-hover:text-spotify transition-colors duration-300 truncate">
                                                {playlist.name}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <ListMusic className="w-3 h-3" />
                                                    {playlist.trackCount} tracks
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    2h 15m
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <Heart className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <Share2 className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* ========================================
                    PROPOSAL 3: Card-Based Masonry Layout
                    ======================================== */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            3
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Card-Based with Stats & Badges</h2>
                            <p className="text-muted-foreground">Rich information cards with trending indicators and statistics</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {samplePlaylists.map((playlist, index) => (
                            <Link
                                key={playlist.id}
                                href={`/playlists/${playlist.id}`}
                                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card hover:border-spotify/50 transition-all duration-300 hover:shadow-xl hover:shadow-spotify/10"
                            >
                                {/* Header with gradient */}
                                <div className="relative h-32 bg-gradient-to-br from-spotify via-purple-500 to-pink-500 overflow-hidden">
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

                                    {/* Trending badge */}
                                    {index < 2 && (
                                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3 text-white" />
                                            <span className="text-xs font-semibold text-white">Trending</span>
                                        </div>
                                    )}

                                    {/* Play button */}
                                    <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <Play className="w-5 h-5 text-spotify fill-spotify ml-0.5" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-spotify transition-colors duration-300">
                                        {playlist.name}
                                    </h3>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        <div className="text-center p-3 rounded-lg bg-muted/50">
                                            <div className="text-lg font-bold text-foreground">{playlist.trackCount}</div>
                                            <div className="text-xs text-muted-foreground">Tracks</div>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-muted/50">
                                            <div className="text-lg font-bold text-foreground">2.5h</div>
                                            <div className="text-xs text-muted-foreground">Duration</div>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-muted/50">
                                            <div className="text-lg font-bold text-foreground">1.2k</div>
                                            <div className="text-xs text-muted-foreground">Plays</div>
                                        </div>
                                    </div>

                                    {/* Footer actions */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" className="h-8 px-3">
                                                <Heart className="w-4 h-4 mr-1" />
                                                Like
                                            </Button>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ========================================
                    PROPOSAL 4: Horizontal Scrolling Cards
                    ======================================== */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            4
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Horizontal Scrolling Cards</h2>
                            <p className="text-muted-foreground">Netflix-style horizontal scroll with large preview cards</p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                            {samplePlaylists.map((playlist) => (
                                <Link
                                    key={playlist.id}
                                    href={`/playlists/${playlist.id}`}
                                    className="group flex-shrink-0 w-80 snap-start"
                                >
                                    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-spotify/20 hover:border-spotify/50">
                                        {/* Large image area */}
                                        <div className="relative h-48 bg-gradient-to-br from-spotify/40 via-purple-500/40 to-pink-500/40 overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Music className="w-20 h-20 text-white/40" />
                                            </div>

                                            {/* Overlay gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                            {/* Play button */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-16 h-16 rounded-full bg-spotify shadow-2xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                                </div>
                                            </div>

                                            {/* Title overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <h3 className="font-bold text-xl text-white drop-shadow-lg">
                                                    {playlist.name}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Info section */}
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <ListMusic className="w-4 h-4" />
                                                    {playlist.trackCount} tracks
                                                </span>
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    2h 15m
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button size="sm" className="flex-1 bg-spotify hover:bg-spotify/90 text-white">
                                                    <Play className="w-4 h-4 mr-1 fill-white" />
                                                    Play
                                                </Button>
                                                <Button size="sm" variant="outline" className="w-10 p-0">
                                                    <Heart className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Scroll indicators */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-2">
                            <div className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center pointer-events-auto opacity-0 hover:opacity-100 transition-opacity">
                                ←
                            </div>
                            <div className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center pointer-events-auto opacity-0 hover:opacity-100 transition-opacity">
                                →
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========================================
                    PROPOSAL 5: Bento Grid Layout
                    ======================================== */}
                <section className="space-y-6 pb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            5
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Bento Grid Layout</h2>
                            <p className="text-muted-foreground">Modern asymmetric grid with varying card sizes and featured items</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
                        {/* Large featured card */}
                        <Link
                            href={`/playlists/${samplePlaylists[0].id}`}
                            className="group md:col-span-2 md:row-span-2 relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-spotify/20 via-purple-500/20 to-pink-500/20 hover:border-spotify/50 transition-all duration-300 hover:shadow-2xl hover:shadow-spotify/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-spotify/40 to-purple-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative h-full p-8 flex flex-col justify-between">
                                <div>
                                    <div className="inline-flex px-3 py-1 rounded-full bg-spotify/20 backdrop-blur-sm border border-spotify/30 text-xs font-semibold text-spotify mb-4">
                                        Featured
                                    </div>
                                    <h3 className="font-bold text-3xl text-foreground group-hover:text-spotify transition-colors duration-300 mb-2">
                                        {samplePlaylists[0].name}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {samplePlaylists[0].trackCount} tracks • Perfect for relaxation
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-spotify shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                        <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                                    </div>
                                    <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-spotify rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Regular cards */}
                        {samplePlaylists.slice(1, 5).map((playlist, index) => (
                            <Link
                                key={playlist.id}
                                href={`/playlists/${playlist.id}`}
                                className={cn(
                                    "group relative overflow-hidden rounded-2xl border border-border/50 bg-card hover:border-spotify/50 transition-all duration-300 hover:shadow-xl hover:shadow-spotify/10",
                                    index === 1 && "md:row-span-2"
                                )}
                            >
                                <div className="relative h-full p-6 flex flex-col justify-between">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-spotify/20 to-purple-500/20 flex items-center justify-center mb-4">
                                        <Music className="w-6 h-6 text-spotify" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground group-hover:text-spotify transition-colors duration-300 mb-1">
                                            {playlist.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {playlist.trackCount} tracks
                                        </p>
                                    </div>
                                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-spotify/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Play className="w-5 h-5 text-spotify fill-spotify ml-0.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Wide card */}
                        <Link
                            href={`/playlists/${samplePlaylists[5].id}`}
                            className="group md:col-span-2 relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-card to-spotify/5 hover:border-spotify/50 transition-all duration-300 hover:shadow-xl hover:shadow-spotify/10"
                        >
                            <div className="relative h-full p-6 flex items-center gap-6">
                                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-spotify/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                                    <Music className="w-12 h-12 text-spotify" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-2xl text-foreground group-hover:text-spotify transition-colors duration-300 mb-2">
                                        {samplePlaylists[5].name}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {samplePlaylists[5].trackCount} tracks • 3h 45m
                                    </p>
                                    <Button size="sm" className="bg-spotify hover:bg-spotify/90 text-white">
                                        <Play className="w-4 h-4 mr-1 fill-white" />
                                        Play Now
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}
