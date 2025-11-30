"use client";

import { Search } from "lucide-react";
import { Conversation } from "../types/chat";

interface ConversationsListProps {
  conversations: Conversation[];
  selectedChat: Conversation | null;
  onSelectChat: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ConversationsList({
  conversations,
  selectedChat,
  onSelectChat,
  searchQuery,
  onSearchChange,
}: ConversationsListProps) {
  return (
    <div className="h-full bg-white dark:bg-gray-800 flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Messages
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            No conversations found
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectChat(conv)}
              className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors ${
                selectedChat?.id === conv.id
                  ? "bg-blue-50 dark:bg-gray-700"
                  : ""
              }`}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                  {conv.initials}
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {conv.name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {conv.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {conv.lastMessage}
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
  );
}