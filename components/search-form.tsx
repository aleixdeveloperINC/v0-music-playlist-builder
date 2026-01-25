"use client";

import React from "react"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

export function SearchForm({
  onSearch,
  isLoading,
  initialQuery = "",
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-spotify/20 rounded-2xl blur-xl group-focus-within:bg-spotify/30 transition-all duration-500 opacity-0 group-focus-within:opacity-100" />
          <div className="relative flex items-center">
            <Search className="absolute left-5 w-6 h-6 text-muted-foreground group-focus-within:text-spotify transition-colors" />
            <Input
              id="search"
              placeholder="Search by artist, song, or vibe..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-14 pr-32 h-16 text-lg rounded-2xl bg-card border-2 border-white/5 focus:border-spotify/50 shadow-2xl transition-all"
            />
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 h-12 px-6 rounded-xl bg-spotify hover:bg-spotify-hover text-black font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Discover"
              )}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground py-1">Popular:</span>
          {["Workout", "Lo-fi", "Techno", "Running"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                onSearch(tag);
              }}
              className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
