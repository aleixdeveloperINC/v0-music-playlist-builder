"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const RESET_TIMEOUT_MS = 3000; // Reset after 3 seconds of inactivity
const MAX_TAPS = 10; // Keep last 10 taps for calculation
const MIN_TAPS = 2; // Minimum taps needed to calculate BPM

export function TapTempo() {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
  const [lastBpm, setLastBpm] = useState<number | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate BPM from tap times
  const calculateBPM = useCallback((times: number[]) => {
    if (times.length < MIN_TAPS) {
      return null;
    }

    // Calculate intervals between consecutive taps
    const intervals: number[] = [];
    for (let i = 1; i < times.length; i++) {
      intervals.push(times[i] - times[i - 1]);
    }

    // Calculate average interval
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    // Convert to BPM (60000 ms in a minute)
    let calculatedBpm = 60000 / avgInterval;

    // If BPM is unreasonably high (double-tempo tapping), halve it
    // Most music doesn't exceed 200 BPM, so if we get 300+, it's likely double-time
    while (calculatedBpm > 200) {
      calculatedBpm = calculatedBpm / 2;
    }

    // Return rounded BPM
    return Math.round(calculatedBpm);
  }, []);

  // Reset function
  const resetTempo = useCallback(() => {
    // Save current BPM before resetting
    setBpm((currentBpm) => {
      if (currentBpm !== null) {
        setLastBpm(currentBpm);
      }
      return null;
    });
    setTapTimes([]);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  // Handle tap event
  const handleTap = useCallback(() => {
    const now = Date.now();

    // Clear existing reset timer
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    // Trigger pulse animation
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 200);

    setTapTimes((prevTimes) => {
      // Add new tap and keep only the last MAX_TAPS
      const newTimes = [...prevTimes, now].slice(-MAX_TAPS);

      // Calculate and update BPM
      const newBpm = calculateBPM(newTimes);
      setBpm(newBpm);

      return newTimes;
    });

    // Set new reset timer
    resetTimerRef.current = setTimeout(resetTempo, RESET_TIMEOUT_MS);
  }, [calculateBPM, resetTempo]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none bg-background relative overflow-hidden"
      onClick={handleTap}
      onTouchStart={(e) => {
        e.preventDefault();
        handleTap();
      }}
    >
      {/* Dynamic Background Gradient */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--spotify)_0%,transparent_70%)] opacity-0 transition-opacity duration-500"
        style={{ opacity: bpm ? Math.min(bpm / 200, 0.15) : 0 }}
      />

      {/* Pulse animation overlay */}
      <div
        className={`absolute inset-0 bg-spotify/10 transition-opacity duration-300 ${isPulsing ? "opacity-100" : "opacity-0"
          }`}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-12 px-4 w-full max-w-2xl">
        {/* Icon / Status */}
        <div className="relative">
          <div
            className={`w-24 h-24 rounded-[2rem] glass flex items-center justify-center transition-all duration-300 border-white/10 ${isPulsing ? "scale-110 border-spotify/50 shadow-[0_0_40px_-10px_rgba(30,215,96,0.3)]" : "scale-100"
              }`}
          >
            <Activity className={cn("w-10 h-10 transition-colors duration-300", bpm ? "text-spotify" : "text-muted-foreground/40")} />
          </div>
          {/* Animated rings */}
          {isPulsing && (
            <>
              <div className="absolute inset-0 rounded-[2rem] border-2 border-spotify/50 animate-ping" />
              <div className="absolute inset-0 rounded-[2rem] border-2 border-spotify/30 animate-[ping_1.5s_ease-out_infinite]" />
            </>
          )}
        </div>

        {/* BPM Display */}
        {bpm !== null ? (
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center">
              <span className="text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter text-foreground tabular-nums drop-shadow-2xl">
                {bpm}
              </span>
              <div className="flex items-center gap-4 -mt-2">
                <div className="h-[2px] w-8 bg-spotify/50" />
                <span className="text-2xl font-black uppercase tracking-[0.4em] text-spotify">
                  BPM
                </span>
                <div className="h-[2px] w-8 bg-spotify/50" />
              </div>
            </div>
            <p className="text-muted-foreground/60 font-medium mt-12 tracking-widest uppercase text-[10px]">
              Syncing with your heartbeat
            </p>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-gradient leading-tight">
              Tap the rhythm.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground/80 max-w-md mx-auto font-medium">
              Find the pulse of any track. Just tap anywhere on the screen to calculate its tempo.
            </p>
            {lastBpm !== null && (
              <div className="mt-12 glass p-6 rounded-3xl border-white/5 inline-block animate-in slide-in-from-bottom-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-2">Previous Session</p>
                <p className="text-4xl font-black text-foreground">
                  {lastBpm} <span className="text-lg text-spotify ml-1">BPM</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tap indicators - Visualizing the queue */}
        <div className="flex gap-3 h-2 items-center">
          {Array.from({ length: MAX_TAPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i < tapTimes.length
                  ? "w-8 bg-spotify shadow-[0_0_10px_rgba(30,215,96,0.5)]"
                  : "w-1.5 bg-white/5"
              )}
            />
          ))}
        </div>
      </div>

      {/* Footer metadata */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="px-4 py-1.5 glass rounded-full border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          Auto-reset active • 3s
        </div>
      </div>
    </div>
  );
}
