"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export default function ChatHomePage() {
  const { toggleTheme, theme } = useTheme();

  return (
    <div className="flex-1 flex items-center justify-center chat-background relative">
      <div className="chat-pattern" />

      <div className="text-center max-w-md px-6 animate-fade-in relative z-10">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10 mb-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Select a conversation
        </h2>
        <p className="text-foreground-secondary mb-6">
          Choose a chat from the sidebar to start messaging. Your conversations
          are waiting for you.
        </p>

        <div className="grid gap-3 text-left">
          <div className="flex items-start gap-3 p-3 rounded-md bg-surface border border-border hover:border-primary/30 transition-colors cursor-default">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-primary"
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
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                Search messages
              </p>
              <p className="text-xs text-foreground-muted">
                Click the search icon in the sidebar to find conversations and
                messages
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-start gap-3 p-3 rounded-md bg-surface border border-border hover:border-accent/30 transition-colors text-left w-full group"
          >
            <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
              <svg
                className="w-4 h-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"}
              </p>
              <p className="text-xs text-foreground-muted">
                Click here or use the toggle in the sidebar
              </p>
            </div>
          </button>

          <div className="flex items-start gap-3 p-3 rounded-md bg-surface border border-border hover:border-success/30 transition-colors cursor-default">
            <div className="w-8 h-8 rounded-md bg-success/10 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                Resize sidebar
              </p>
              <p className="text-xs text-foreground-muted">
                Drag the edge of the sidebar to adjust its width
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
