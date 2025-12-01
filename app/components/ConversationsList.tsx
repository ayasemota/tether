"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MoreVertical } from "lucide-react";
import { Conversation } from "../types/chat";
import MoreOptionsMenu from "./MoreOptionsMenu";

interface ConversationsListProps {
  conversations: Conversation[];
  selectedChat: Conversation | null;
  onSelectChat: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  getLastMessage: (conv: Conversation) => string;
}

export default function ConversationsList({
  conversations,
  selectedChat,
  onSelectChat,
  searchQuery,
  onSearchChange,
  getLastMessage,
}: ConversationsListProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("tether-logged-in");
    router.push("/login");
  };

  return (
    <>
      <div className="h-full app-bg-secondary flex flex-col">
        <div className="app-border border-b px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold app-text">Messages</h1>
            <button
              onClick={() => setShowMenu(true)}
              className="p-2 app-hover rounded-full transition-colors"
              title="More options"
            >
              <MoreVertical className="w-5 h-5 app-text-secondary" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 app-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 app-input app-text rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-32 app-text-secondary">
              No conversations found
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectChat(conv)}
                className={`flex items-center gap-3 px-4 py-4 app-hover cursor-pointer app-border border-b transition-colors ${
                  selectedChat?.id === conv.id ? "app-selected" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full app-gradient flex items-center justify-center text-white font-semibold text-lg">
                    {conv.initials}
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 app-avatar-border rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold app-text">{conv.name}</h3>
                    <span className="text-xs app-text-secondary">
                      {conv.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm app-text-secondary truncate">
                      {getLastMessage(conv)}
                    </p>
                    {conv.unread > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <MoreOptionsMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onLogout={handleLogout}
        context="sidebar"
      />
    </>
  );
}
