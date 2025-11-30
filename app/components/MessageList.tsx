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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No messages yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Start the conversation with {conversation.name}. Send a message to
            get things started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 flex flex-col"
    >
      <div className="flex-1" />
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-3">
                  {msg.sender}
                </p>
              )}
              <div
                className={`px-4 py-2 rounded-2xl ${
                  msg.isOwn
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
              <p
                className={`text-xs text-gray-400 dark:text-gray-500 mt-1 ${
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
  );
}
