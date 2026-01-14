// ==========================================
// TETHER - Type Definitions
// ==========================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  status: "online" | "offline" | "away";
  lastSeen?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  mediaUrl?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  type: "user" | "message";
  user?: User;
  message?: Message;
  conversation?: Conversation;
  highlight?: string;
}

export type Theme = "light" | "dark";

export type SearchMode = "text" | "media";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
