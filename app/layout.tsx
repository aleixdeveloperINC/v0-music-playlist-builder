import React from "react";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import {

  Audiowide,
  Big_Shoulders_Stencil,
  Inter,
} from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/auth-guard";
import { ThemeProvider } from "@/components/theme-provider";

// Initialize fonts
const displayFont = Audiowide({
  subsets: ["latin"],
  variable: "--font-display",
  weight: '400'
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased selection:bg-spotify/30", displayFont.variable, inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthGuard>
            {children}
          </AuthGuard>
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
