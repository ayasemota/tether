"use client";

import { useState, useEffect } from "react";
import ConversationsList from "./ConversationsList";
import ChatView from "./ChatView";
import EmptyState from "./EmptyState";
import { Conversation, Message } from "../types/chat";
import { conversationsData } from "../data/conversations";

export default function ChatApp() {
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<number, Message[]>>({});
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load everything from localStorage before rendering
    const savedWidth = localStorage.getItem("tether-sidebar-width");
    setSidebarWidth(savedWidth ? parseFloat(savedWidth) : 35);

    const initialMessages: Record<number, Message[]> = {};
    conversationsData.forEach((conv) => {
      initialMessages[conv.id] = [...conv.messages];
    });
    setChatMessages(initialMessages);

    setIsLoading(false);
  }, []);

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
      if (!isResizing || sidebarWidth === null) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth >= 25 && newWidth <= 50) {
        setSidebarWidth(newWidth);
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
  }, [isResizing, sidebarWidth]);

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

  const filteredConversations = conversationsData.filter((conv) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = conv.name.toLowerCase().includes(query);
    const messageMatch = chatMessages[conv.id]?.some((msg) =>
      msg.text.toLowerCase().includes(query)
    );
    return nameMatch || messageMatch;
  });

  if (isLoading || sidebarWidth === null) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 max-w-2xl mx-auto">
        {selectedChat ? (
          <ChatView
            conversation={selectedChat}
            messages={chatMessages[selectedChat.id] || []}
            onBack={() => setSelectedChat(null)}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <ConversationsList
            conversations={filteredConversations}
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      <div style={{ width: `${sidebarWidth}%` }} className="border-r border-gray-300 dark:border-gray-700">
        <ConversationsList
          conversations={filteredConversations}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div
        className="w-1 bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 cursor-col-resize transition-colors"
        onMouseDown={() => setIsResizing(true)}
      />

      <div style={{ width: `${100 - sidebarWidth - 0.1}%` }}>
        {selectedChat ? (
          <ChatView
            conversation={selectedChat}
            messages={chatMessages[selectedChat.id] || []}
            onBack={() => setSelectedChat(null)}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}