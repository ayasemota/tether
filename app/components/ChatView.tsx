"use client";

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
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ChatHeader conversation={conversation} onBack={onBack} />

      <MessageList messages={messages} conversation={conversation} />

      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
