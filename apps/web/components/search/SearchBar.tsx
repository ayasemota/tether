"use client";

import React, { useState } from "react";
import { SearchMode } from "@/lib/types";
import { Input } from "@/components/ui/Input";

interface SearchBarProps {
  onSearch: (query: string, mode: SearchMode) => void;
  className?: string;
}

export function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("text");

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery, mode);
  };

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    onSearch(query, newMode);
  };

  return (
    <div className={`mt-3 space-y-3 ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder={
            mode === "text"
              ? "Search messages or contacts..."
              : "Search media..."
          }
          disabled={mode === "media"}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
      </div>

      <div className="flex items-center gap-2 p-1 bg-surface rounded-lg">
        <button
          onClick={() => handleModeChange("text")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "text"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Text
        </button>
        <button
          onClick={() => handleModeChange("media")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "media"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Media
        </button>
      </div>
    </div>
  );
}
