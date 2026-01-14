"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Conversation } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatTimestamp, getOtherParticipant } from "@/lib/mockData";

interface ConversationItemProps {
  conversation: Conversation;
}

function ConversationItem({ conversation }: ConversationItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/chat/${conversation.id}`;
  const otherUser = getOtherParticipant(conversation);

  return (
    <Link
      href={`/chat/${conversation.id}`}
      className={`
        flex items-center gap-3 p-3 rounded-md transition-all duration-200
        ${
          isActive
            ? "bg-primary/10 border border-primary/20"
            : "hover:bg-surface-hover border border-transparent"
        }
      `}
    >
      <Avatar
        src={otherUser.avatar}
        name={`${otherUser.firstName} ${otherUser.lastName}`}
        status={otherUser.status}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`font-medium truncate ${
              isActive ? "text-primary" : "text-foreground"
            }`}
          >
            {otherUser.firstName} {otherUser.lastName}
          </h3>
          {conversation.lastMessage && (
            <span className="text-xs text-foreground-muted shrink-0">
              {formatTimestamp(conversation.lastMessage.timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          {conversation.lastMessage && (
            <p className="text-sm text-foreground-secondary truncate">
              {conversation.lastMessage.content}
            </p>
          )}
          {conversation.unreadCount > 0 && (
            <span className="shrink-0 w-5 h-5 flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface ConversationListProps {
  conversations: Conversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  const pinnedConversations = conversations.filter((c) => c.isPinned);
  const regularConversations = conversations.filter((c) => !c.isPinned);

  return (
    <div className="flex flex-col h-full">
      {pinnedConversations.length > 0 && (
        <div className="pb-3 mb-3 border-b border-border">
          <h2 className="px-3 py-2 text-xs font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 1.707a1 1 0 011.414 0l5.586 5.586a1 1 0 01-.708 1.707H14v6a1 1 0 01-1 1h-1.5v-4a.5.5 0 00-.5-.5h-2a.5.5 0 00-.5.5v4H7a1 1 0 01-1-1V9H4.415a1 1 0 01-.708-1.707l5.586-5.586z" />
            </svg>
            Pinned
          </h2>
          <div className="space-y-1">
            {pinnedConversations.map((conv) => (
              <ConversationItem key={conv.id} conversation={conv} />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <h2 className="px-3 py-2 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
          Messages
        </h2>
        <div className="space-y-1">
          {regularConversations.map((conv) => (
            <ConversationItem key={conv.id} conversation={conv} />
          ))}
        </div>
      </div>
    </div>
  );
}
