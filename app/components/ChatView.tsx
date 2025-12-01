"use client";

import { useEffect, useState, useRef } from "react";
import { Conversation, Message } from "../types/chat";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatViewProps {
  conversation: Conversation;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  onDeleteConversation: () => void;
}

export default function ChatView({
  conversation,
  messages,
  onBack,
  onSendMessage,
  onClearChat,
  onDeleteConversation,
}: ChatViewProps) {
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (window.visualViewport) {
        const vh = window.visualViewport.height;
        setContainerHeight(vh);
      } else {
        setContainerHeight(window.innerHeight);
      }
    };

    updateHeight();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateHeight);
      window.visualViewport.addEventListener("scroll", updateHeight);

      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener("resize", updateHeight);
          window.visualViewport.removeEventListener("scroll", updateHeight);
        }
      };
    } else {
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current && window.visualViewport) {
      const preventScroll = (e: Event) => {
        e.preventDefault();
      };

      containerRef.current.addEventListener("touchmove", preventScroll, {
        passive: false,
      });

      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener("touchmove", preventScroll);
        }
      };
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col app-bg w-full overflow-hidden"
      style={{
        height: containerHeight > 0 ? `${containerHeight}px` : "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <div className="flex-shrink-0">
        <ChatHeader
          conversation={conversation}
          onBack={onBack}
          onClearChat={onClearChat}
          onDeleteConversation={onDeleteConversation}
        />
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
