"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import { ConversationList } from "@/components/chat/ConversationList";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import {
  mockConversations,
  mockUsers,
  mockMessages,
  currentUser,
} from "@/lib/mockData";
import { SearchResult, SearchMode, Conversation } from "@/lib/types";

const SIDEBAR_MIN_WIDTH = 300;
const SIDEBAR_MAX_WIDTH = 800;
const SIDEBAR_DEFAULT_WIDTH = 800;
const SIDEBAR_STORAGE_KEY = "tether-sidebar-width";

function getInitialSidebarWidth(): number {
  if (typeof window === "undefined") {
    return SIDEBAR_DEFAULT_WIDTH;
  }
  try {
    const savedWidth = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= SIDEBAR_MIN_WIDTH && width <= SIDEBAR_MAX_WIDTH) {
        return width;
      }
    }
  } catch {}
  return SIDEBAR_DEFAULT_WIDTH;
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("text");
  const [showSearch, setShowSearch] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState<number>(
    getInitialSidebarWidth
  );
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const isConversationOpen = pathname !== "/chat";

  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarWidth.toString());
    }
  }, [sidebarWidth, isResizing]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTabletOrMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isConversationOpen && isTabletOrMobile) {
      setIsMobileSidebarOpen(false);
    }
  }, [isConversationOpen, isTabletOrMobile]);

  useEffect(() => {
    if (!isConversationOpen && isTabletOrMobile) {
      setIsMobileSidebarOpen(true);
    }
  }, [isConversationOpen, isTabletOrMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isConversationOpen) {
        router.push("/chat");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConversationOpen, router]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = Math.min(
        Math.max(e.clientX, SIDEBAR_MIN_WIDTH),
        SIDEBAR_MAX_WIDTH
      );
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim() || searchMode === "media") return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    mockUsers.forEach((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      if (
        fullName.includes(query) ||
        user.username.toLowerCase().includes(query)
      ) {
        results.push({ type: "user", user });
      }
    });

    Object.entries(mockMessages).forEach(([convId, messages]) => {
      const conversation = conversations.find((c) => c.id === convId);
      messages.forEach((message) => {
        if (message.content.toLowerCase().includes(query)) {
          results.push({ type: "message", message, conversation });
        }
      });
    });

    return results.slice(0, 10);
  }, [searchQuery, searchMode, conversations]);

  const handleSearch = (query: string, mode: SearchMode) => {
    setSearchQuery(query);
    setSearchMode(mode);
  };

  const handleSearchResultClick = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  if (!isAuthenticated) {
    return null;
  }

  const showSidebarFullScreen = isTabletOrMobile && !isConversationOpen;
  const showChatFullScreen = isTabletOrMobile && isConversationOpen;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {isMobileSidebarOpen && isConversationOpen && !showSidebarFullScreen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        style={{
          width: !isTabletOrMobile ? sidebarWidth : undefined,
        }}
        className={`
          shrink-0 flex flex-col bg-background-secondary border-r border-border relative
          transition-transform duration-300 ease-in-out
          ${
            showSidebarFullScreen
              ? "fixed inset-0 z-30 w-full"
              : showChatFullScreen
              ? "hidden lg:flex lg:relative"
              : "fixed lg:relative inset-y-0 left-0 z-30 w-[85vw] lg:w-auto"
          }
          ${
            !showSidebarFullScreen &&
            (isMobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0")
          }
        `}
      >
        <div
          onMouseDown={handleMouseDown}
          className="resize-handle hidden lg:block"
        />

        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
                  showSearch
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <ThemeToggle />
            </div>
          </div>

          {showSearch && (
            <div className="animate-fade-in-up">
              <SearchBar onSearch={handleSearch} />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {showSearch && searchQuery ? (
            <SearchResults
              results={searchResults}
              searchMode={searchMode}
              onResultClick={handleSearchResultClick}
            />
          ) : (
            <ConversationList conversations={conversations} />
          )}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={currentUser.avatar}
                name={`${currentUser.firstName} ${currentUser.lastName}`}
                status="online"
                size="md"
              />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-xs text-foreground-muted">
                  @{currentUser.username}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-9 h-9 flex items-center justify-center rounded-md text-foreground-muted hover:text-error hover:bg-error/10 transition-colors"
              title="Sign out"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <main
        className={`
          flex-1 flex flex-col overflow-hidden relative
          ${showChatFullScreen ? "fixed inset-0 z-20" : ""}
        `}
      >
        {!isMobileSidebarOpen &&
          !showSidebarFullScreen &&
          !showChatFullScreen && (
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center rounded-md bg-surface border border-border text-foreground-muted hover:text-foreground transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
        {children}
      </main>
    </div>
  );
}
