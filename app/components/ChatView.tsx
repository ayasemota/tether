"use client";

import { useEffect, useState } from "react";
import { Conversation, Message } from "../types/chat";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatViewProps {
  conversation: Conversation;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (message: string) => void;
}

export default function ChatView({
  conversation,
  messages,
  onBack,
  onSendMessage,
}: ChatViewProps) {
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(vh);
    };

    updateHeight();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateHeight);
      window.visualViewport.addEventListener("scroll", updateHeight);
    } else {
      window.addEventListener("resize", updateHeight);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateHeight);
        window.visualViewport.removeEventListener("scroll", updateHeight);
      } else {
        window.removeEventListener("resize", updateHeight);
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col bg-gray-50 dark:bg-gray-900 w-full"
      style={{ height: viewportHeight > 0 ? `${viewportHeight}px` : "100vh" }}
    >
      <div className="flex-shrink-0">
        <ChatHeader conversation={conversation} onBack={onBack} />
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <MessageList messages={messages} conversation={conversation} />
      </div>

      <div className="flex-shrink-0">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
