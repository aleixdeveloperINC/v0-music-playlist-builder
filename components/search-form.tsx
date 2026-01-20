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
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
    </form>
  );
}
