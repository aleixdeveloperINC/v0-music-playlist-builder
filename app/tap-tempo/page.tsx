"use client";

import { Header } from "@/components/header";
import { TapTempo } from "@/components/tap-tempo";

export default function TapTempoPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <TapTempo />
        </div>
    );
}
