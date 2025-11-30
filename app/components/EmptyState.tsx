"use client";

import { Send } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Send className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Select a chat to get started
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Choose a conversation from the list to begin messaging
        </p>
      </div>
    </div>
  );
}
