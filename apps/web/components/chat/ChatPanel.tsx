"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Message, User } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Avatar } from "@/components/ui/Avatar";

interface ChatPanelProps {
  messages: Message[];
  recipient: User;
  onSendMessage: (content: string) => void;
}

export function ChatPanel({
  messages,
  recipient,
  onSendMessage,
}: ChatPanelProps) {
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [recipient.id]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    setShowScrollButton(distanceFromBottom > 100);
  }, []);

  const highlightedMessageId = inChatSearchQuery
    ? messages.find((m) =>
        m.content.toLowerCase().includes(inChatSearchQuery.toLowerCase())
      )?.id
    : null;

  const handleCloseChat = () => {
    router.push("/chat");
  };

  return (
    <div className="flex flex-col h-full chat-background">
      <div className="chat-pattern" />

      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-background-secondary border-b border-border relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCloseChat}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors -ml-1"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <Avatar
            src={recipient.avatar}
            name={`${recipient.firstName} ${recipient.lastName}`}
            status={recipient.status}
            size="md"
          />
          <div>
            <h2 className="font-semibold text-foreground">
              {recipient.firstName} {recipient.lastName}
            </h2>
            <p className="text-sm text-foreground-muted">
              {recipient.status === "online"
                ? "Online"
                : recipient.status === "away"
                ? "Away"
                : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {showInChatSearch && (
            <input
              type="text"
              value={inChatSearchQuery}
              onChange={(e) => setInChatSearchQuery(e.target.value)}
              placeholder="Search in chat..."
              className="w-40 md:w-52 px-3 py-1.5 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          )}

          <button
            onClick={() => {
              setShowInChatSearch(!showInChatSearch);
              if (showInChatSearch) setInChatSearchQuery("");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
              showInChatSearch
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

          <button className="w-9 h-9 flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors">
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10"
      >
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                highlightedMessageId === message.id
                  ? "ring-2 ring-primary rounded-lg"
                  : ""
              }
            >
              <MessageBubble message={message} />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-26 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover transition-all animate-fade-in-up"
          aria-label="Scroll to bottom"
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}

      <div className="relative z-10 shrink-0">
        <ChatInput onSendMessage={onSendMessage} inputRef={inputRef} />
      </div>
    </div>
  );
}
