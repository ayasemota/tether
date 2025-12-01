"use client";

import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { Message, Conversation } from "../types/chat";

interface MessageListProps {
  messages: Message[];
  conversation: Conversation;
}

export default function MessageList({
  messages,
  conversation,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full w-full overflow-y-auto p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full app-gradient flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold app-text mb-2">
            No messages yet
          </h3>
          <p className="app-text-secondary">
            Start the conversation with {conversation.name}. Send a message to
            get things started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto p-4">
      <div className="flex flex-col justify-end min-h-full">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md ${
                  msg.isOwn ? "order-2" : "order-1"
                }`}
              >
                {!msg.isOwn && (
                  <p className="text-xs app-text-secondary mb-1 ml-3">
                    {msg.sender}
                  </p>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    msg.isOwn
                      ? "app-gradient text-white rounded-br-sm"
                      : "app-bg-secondary app-text rounded-bl-sm shadow-sm"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <p
                  className={`text-xs app-text-tertiary mt-1 ${
                    msg.isOwn ? "text-right mr-3" : "ml-3"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
