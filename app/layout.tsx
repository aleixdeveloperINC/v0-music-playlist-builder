import React from "react";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import {
  Geist_Mono,
  Montserrat as V0_Font_Montserrat,
  Geist_Mono as V0_Font_Geist_Mono,
} from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/auth-guard";

// Initialize fonts
const montserrat = V0_Font_Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BPM Finder - Search Songs by Tempo",
  description:
    "Search for music by BPM, build playlists with the perfect tempo for workouts, running, or dancing. Integrates with your Spotify account.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("font-sans antialiased", montserrat.className)}>
        <AuthGuard>
          {children}
        </AuthGuard>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
