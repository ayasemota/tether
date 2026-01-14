"use client";

import React from "react";
import { Message } from "@/lib/types";
import { formatMessageTime, currentUser } from "@/lib/mockData";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isSent = message.senderId === currentUser.id;

  return (
    <div
      className={`flex ${
        isSent ? "justify-end" : "justify-start"
      } animate-fade-in-up`}
    >
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-xl
          ${
            isSent
              ? "bg-bubble-sent text-bubble-sent-text rounded-br-sm"
              : "bg-bubble-received text-bubble-received-text rounded-bl-sm"
          }
        `}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={`flex items-center gap-1.5 mt-1 ${
            isSent ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-xs ${
              isSent ? "text-white/70" : "text-foreground-muted"
            }`}
          >
            {formatMessageTime(message.timestamp)}
          </span>
          {isSent && (
            <svg
              className={`w-4 h-4 ${
                message.status === "read" ? "text-sky-300" : "text-white/70"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {message.status === "read" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : message.status === "delivered" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
