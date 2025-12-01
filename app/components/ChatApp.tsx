"use client";

import { useState, useEffect } from "react";
import ConversationsList from "./ConversationsList";
import ChatView from "./ChatView";
import EmptyState from "./EmptyState";
import { Conversation, Message } from "../types/chat";
import { conversationsData } from "../data/conversations";

const getSavedSidebarWidth = () => {
  if (typeof window === "undefined") return 35;
  const saved = localStorage.getItem("tether-sidebar-width");
  return saved ? parseFloat(saved) : 35;
};

const getInitialMessages = () => {
  const initialMessages: Record<number, Message[]> = {};
  conversationsData.forEach((conv) => {
    initialMessages[conv.id] = [...conv.messages];
  });
  return initialMessages;
};

export default function ChatApp() {
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] =
    useState<Record<number, Message[]>>(getInitialMessages);
  const [sidebarWidth] = useState(getSavedSidebarWidth);
  const [currentSidebarWidth, setCurrentSidebarWidth] = useState(sidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isMobile) {
        setSelectedChat(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMobile]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth >= 25 && newWidth <= 50) {
        setCurrentSidebarWidth(newWidth);
        localStorage.setItem("tether-sidebar-width", newWidth.toString());
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleSendMessage = (message: string) => {
    if (!selectedChat) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "You",
      text: message,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      isOwn: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...prev[selectedChat.id], newMessage],
    }));

    setTimeout(() => {
      const autoReply: Message = {
        id: Date.now() + 1,
        sender: selectedChat.name,
        text: "Currently not available. Please try again later.",
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        isOwn: false,
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedChat.id]: [...prev[selectedChat.id], autoReply],
      }));
    }, 1000);
  };

  const handleDeleteConversation = (conversationId: number) => {
    setChatMessages((prev) => {
      const newMessages = { ...prev };
      delete newMessages[conversationId];
      return newMessages;
    });
    if (selectedChat?.id === conversationId) {
      setSelectedChat(null);
    }
  };

  const handleClearChat = (conversationId: number) => {
    setChatMessages((prev) => ({
      ...prev,
      [conversationId]: [],
    }));
  };

  const getLastMessage = (conv: Conversation) => {
    const messages = chatMessages[conv.id] || [];
    if (messages.length === 0) return "Start a conversation";
    const lastMsg = messages[messages.length - 1];
    const prefix = lastMsg.isOwn ? "You: " : "";
    return prefix + lastMsg.text;
  };

  const filteredConversations = conversationsData
    .filter((conv) => chatMessages[conv.id] !== undefined)
    .filter((conv) => {
      const query = searchQuery.toLowerCase();
      const nameMatch = conv.name.toLowerCase().includes(query);
      const messageMatch = chatMessages[conv.id]?.some((msg) =>
        msg.text.toLowerCase().includes(query)
      );
      return nameMatch || messageMatch;
    });

  if (isMobile) {
    return (
      <div className="h-full w-full app-bg">
        {selectedChat ? (
          <ChatView
            conversation={selectedChat}
            messages={chatMessages[selectedChat.id] || []}
            onBack={() => setSelectedChat(null)}
            onSendMessage={handleSendMessage}
            onClearChat={() => handleClearChat(selectedChat.id)}
            onDeleteConversation={() =>
              handleDeleteConversation(selectedChat.id)
            }
          />
        ) : (
          <ConversationsList
            conversations={filteredConversations}
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            getLastMessage={getLastMessage}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen app-bg flex">
      <div
        style={{ width: `${currentSidebarWidth}%` }}
        className="app-border border-r"
      >
        <ConversationsList
          conversations={filteredConversations}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          getLastMessage={getLastMessage}
        />
      </div>

      <div
        className="w-1 app-border app-hover hover:bg-blue-500 cursor-col-resize transition-colors"
        onMouseDown={() => setIsResizing(true)}
      />

      <div style={{ width: `${100 - currentSidebarWidth - 0.1}%` }}>
        {selectedChat ? (
          <ChatView
            conversation={selectedChat}
            messages={chatMessages[selectedChat.id] || []}
            onBack={() => setSelectedChat(null)}
            onSendMessage={handleSendMessage}
            onClearChat={() => handleClearChat(selectedChat.id)}
            onDeleteConversation={() =>
              handleDeleteConversation(selectedChat.id)
            }
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
