"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Activity } from "lucide-react";

const RESET_TIMEOUT_MS = 3000; // Reset after 3 seconds of inactivity
const MAX_TAPS = 10; // Keep last 10 taps for calculation
const MIN_TAPS = 2; // Minimum taps needed to calculate BPM

export function TapTempo() {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
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
    const calculatedBpm = 60000 / avgInterval;

    // Return rounded BPM
    return Math.round(calculatedBpm);
  }, []);

  // Reset function
  const resetTempo = useCallback(() => {
    setTapTimes([]);
    setBpm(null);
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
      className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none bg-gradient-to-br from-background via-background to-accent/10 relative overflow-hidden"
      onClick={handleTap}
      onTouchStart={(e) => {
        e.preventDefault();
        handleTap();
      }}
    >
      {/* Pulse animation overlay */}
      <div
        className={`absolute inset-0 bg-spotify/5 transition-opacity duration-200 ${
          isPulsing ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Icon */}
        <div className="relative">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-spotify/10 flex items-center justify-center transition-all duration-200 ${
              isPulsing ? "scale-110 bg-spotify/20" : "scale-100"
            }`}
          >
            <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-spotify" />
          </div>
          {/* Ripple effect */}
          {isPulsing && (
            <div className="absolute inset-0 rounded-full border-4 border-spotify/30 animate-ping" />
          )}
        </div>

        {/* BPM Display */}
        {bpm !== null ? (
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-3">
              <span className="text-7xl sm:text-9xl font-bold text-foreground tabular-nums tracking-tight">
                {bpm}
              </span>
              <span className="text-3xl sm:text-4xl font-semibold text-muted-foreground pb-2">
                BPM
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mt-4">
              Keep tapping to refine
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-3">
              Tap Your Tempo
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md">
              Tap anywhere on the screen to find your running cadence
            </p>
          </div>
        )}

        {/* Tap count indicator */}
        {tapTimes.length > 0 && (
          <div className="flex gap-2 mt-4">
            {Array.from({ length: Math.min(tapTimes.length, MAX_TAPS) }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-spotify transition-all duration-200"
                style={{
                  opacity: 1 - (i / MAX_TAPS) * 0.5,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Instructions footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center px-4">
        <p className="text-xs sm:text-sm text-muted-foreground/60">
          Auto-resets after 3 seconds of inactivity
        </p>
      </div>
    </div>
  );
}
