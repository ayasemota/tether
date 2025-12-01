"use client";

import { Send } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="h-full app-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full app-gradient flex items-center justify-center">
          <Send className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-semibold app-text mb-2">
          Select a chat to get started
        </h2>
        <p className="app-text-secondary">
          Choose a conversation from the list to begin messaging
        </p>
      </div>
    </div>
  );
}
