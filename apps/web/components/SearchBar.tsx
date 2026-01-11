'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

export type SearchType = 'all' | 'users' | 'messages' | 'media';

interface SearchBarProps {
  onSearch: (query: string, type: SearchType) => void;
  onClear: () => void;
}

export default function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value, searchType);
  };

  const handleClear = () => {
    setQuery('');
    setSearchType('all');
    onClear();
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users, messages, or media..."
          className="w-full pl-12 pr-12 py-3 bg-input-bg border border-input-border rounded-xl focus:outline-none focus:border-input-focus focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-text-muted"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {query && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {(['all', 'users', 'messages', 'media'] as SearchType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setSearchType(type);
                onSearch(query, type);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                searchType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}