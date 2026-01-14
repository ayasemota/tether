"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Message } from "@/lib/types";
import {
  mockMessages,
  mockConversations,
  getRandomResponse,
  getOtherParticipant,
  currentUser,
} from "@/lib/mockData";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const conversation = mockConversations.find((c) => c.id === id);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!conversation) {
      router.push("/chat");
      return;
    }

    const initialMessages = mockMessages[id] || [];
    setMessages(initialMessages);
  }, [id, conversation, router]);

  const handleSendMessage = useCallback(
    (content: string) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: id,
        senderId: currentUser.id,
        content,
        type: "text",
        timestamp: new Date(),
        status: "sent",
      };

      setMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMessage.id ? { ...m, status: "delivered" } : m
          )
        );
      }, 500);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMessage.id ? { ...m, status: "read" } : m
          )
        );
      }, 1000);

      setTimeout(() => {
        const recipient = conversation
          ? getOtherParticipant(conversation)
          : null;
        if (!recipient) return;

        const replyMessage: Message = {
          id: `msg-${Date.now()}-reply`,
          conversationId: id,
          senderId: recipient.id,
          content: getRandomResponse(),
          type: "text",
          timestamp: new Date(),
          status: "read",
        };

        setMessages((prev) => [...prev, replyMessage]);
      }, 1500 + Math.random() * 1000);
    },
    [id, conversation]
  );

  if (!conversation) {
    return null;
  }

  const recipient = getOtherParticipant(conversation);

  return (
    <ChatPanel
      messages={messages}
      recipient={recipient}
      onSendMessage={handleSendMessage}
    />
  );
}
