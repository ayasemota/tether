"use client";

import React from "react";
import Link from "next/link";
import { SearchResult, SearchMode } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatTimestamp, getOtherParticipant } from "@/lib/mockData";

interface SearchResultsProps {
  results: SearchResult[];
  searchMode: SearchMode;
  onResultClick?: (result: SearchResult) => void;
}

export function SearchResults({
  results,
  searchMode,
  onResultClick,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="py-8 text-center text-foreground-muted">
        <svg
          className="w-12 h-12 mx-auto mb-3 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="font-medium">No results found</p>
        <p className="text-sm mt-1">Try a different search term</p>
      </div>
    );
  }

  const userResults = results.filter((r) => r.type === "user");
  const messageResults = results.filter((r) => r.type === "message");

  if (searchMode === "media") {
    return (
      <div className="p-4">
        <p className="text-sm text-foreground-muted text-center py-8">
          Media search coming soon...
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {userResults.length > 0 && (
        <div className="p-3">
          <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
            Contacts
          </h3>
          <div className="space-y-1">
            {userResults.map((result, index) => (
              <button
                key={`user-${result.user?.id || index}`}
                onClick={() => onResultClick?.(result)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
              >
                {result.user && (
                  <>
                    <Avatar
                      src={result.user.avatar}
                      name={`${result.user.firstName} ${result.user.lastName}`}
                      status={result.user.status}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {result.user.firstName} {result.user.lastName}
                      </p>
                      <p className="text-sm text-foreground-muted">
                        @{result.user.username}
                      </p>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {messageResults.length > 0 && (
        <div className="p-3">
          <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
            Messages
          </h3>
          <div className="space-y-1">
            {messageResults.map((result, index) => {
              const otherUser = result.conversation
                ? getOtherParticipant(result.conversation)
                : null;

              return (
                <Link
                  key={`msg-${result.message?.id || index}`}
                  href={`/chat/${result.conversation?.id}?highlight=${result.message?.id}`}
                  className="block p-2 rounded-lg hover:bg-surface-hover transition-colors"
                  onClick={() => onResultClick?.(result)}
                >
                  {otherUser && result.message && (
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={otherUser.avatar}
                        name={`${otherUser.firstName} ${otherUser.lastName}`}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-foreground truncate">
                            {otherUser.firstName} {otherUser.lastName}
                          </p>
                          <span className="text-xs text-foreground-muted shrink-0">
                            {formatTimestamp(result.message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground-secondary truncate mt-0.5">
                          {result.message.content}
                        </p>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
