"use client";

import React from "react"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";

interface SearchFormProps {
  onSearch: (query: string, minBpm: string, maxBpm: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [minBpm, setMinBpm] = useState("");
  const [maxBpm, setMaxBpm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), minBpm, maxBpm);
    }
  };

  const presetBpmRanges = [
    { label: "Chill (60-90)", min: "60", max: "90" },
    { label: "Pop (100-130)", min: "100", max: "130" },
    { label: "Dance (120-140)", min: "120", max: "140" },
    { label: "High Energy (140+)", min: "140", max: "" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search tracks
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search for songs, artists, or albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-spotify hover:bg-spotify/90 text-card"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex gap-3">
          <div className="w-24">
            <Label htmlFor="minBpm" className="text-xs text-muted-foreground mb-1 block">
              Min BPM
            </Label>
            <Input
              id="minBpm"
              type="number"
              placeholder="60"
              value={minBpm}
              onChange={(e) => setMinBpm(e.target.value)}
              min="0"
              max="300"
            />
          </div>
          <div className="w-24">
            <Label htmlFor="maxBpm" className="text-xs text-muted-foreground mb-1 block">
              Max BPM
            </Label>
            <Input
              id="maxBpm"
              type="number"
              placeholder="200"
              value={maxBpm}
              onChange={(e) => setMaxBpm(e.target.value)}
              min="0"
              max="300"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {presetBpmRanges.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMinBpm(preset.min);
                setMaxBpm(preset.max);
              }}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </form>
  );
}
