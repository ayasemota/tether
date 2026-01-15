// ==========================================
// TETHER - Mock Data for Demo
// ==========================================

import { User, Message, Conversation } from "./types";

// Demo Users
export const currentUser: User = {
  id: "user-0",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  email: "johndoe@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  status: "online",
};

export const mockUsers: User[] = [
  {
    id: "user-1",
    firstName: "Sarah",
    lastName: "Chen",
    username: "sarahc",
    email: "sarahc@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    status: "online",
  },
  {
    id: "user-2",
    firstName: "Marcus",
    lastName: "Johnson",
    username: "marcusj",
    email: "marcusj@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    status: "online",
  },
  {
    id: "user-3",
    firstName: "Emily",
    lastName: "Rodriguez",
    username: "emilyr",
    email: "emilyr@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    status: "away",
    lastSeen: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "user-4",
    firstName: "David",
    lastName: "Kim",
    username: "davidk",
    email: "davidk@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    status: "offline",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "user-5",
    firstName: "Olivia",
    lastName: "Taylor",
    username: "oliviat",
    email: "oliviat@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
    status: "online",
  },
  {
    id: "user-6",
    firstName: "James",
    lastName: "Wilson",
    username: "jamesw",
    email: "jamesw@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    status: "offline",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

// Demo Messages by Conversation
export const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1-1",
      conversationId: "conv-1",
      senderId: "user-1",
      content: "Hey! Did you see the new design mockups?",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: "read",
    },
    {
      id: "msg-1-2",
      conversationId: "conv-1",
      senderId: "user-0",
      content: "Yes! They look amazing. Love the new color scheme.",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 42),
      status: "read",
    },
    {
      id: "msg-1-3",
      conversationId: "conv-1",
      senderId: "user-1",
      content: "Right? The purple gradient is so smooth 💜",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
      status: "read",
    },
    {
      id: "msg-1-4",
      conversationId: "conv-1",
      senderId: "user-0",
      content: "Should we schedule a review meeting for tomorrow?",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      status: "read",
    },
    {
      id: "msg-1-5",
      conversationId: "conv-1",
      senderId: "user-1",
      content: "Perfect! How about 2pm?",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: "read",
    },
  ],
  "conv-2": [
    {
      id: "msg-2-1",
      conversationId: "conv-2",
      senderId: "user-2",
      content: "The project is coming along nicely!",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      status: "read",
    },
    {
      id: "msg-2-2",
      conversationId: "conv-2",
      senderId: "user-0",
      content: "Thanks! Been working on the chat interface all week.",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 115),
      status: "read",
    },
    {
      id: "msg-2-3",
      conversationId: "conv-2",
      senderId: "user-2",
      content: "Can't wait to see the final result 🚀",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: "read",
    },
  ],
  "conv-3": [
    {
      id: "msg-3-1",
      conversationId: "conv-3",
      senderId: "user-3",
      content: "Are you coming to the team lunch?",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      status: "read",
    },
    {
      id: "msg-3-2",
      conversationId: "conv-3",
      senderId: "user-0",
      content: "Definitely! What time?",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      status: "read",
    },
    {
      id: "msg-3-3",
      conversationId: "conv-3",
      senderId: "user-3",
      content: "12:30 at the usual place 🍕",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "read",
    },
  ],
  "conv-4": [
    {
      id: "msg-4-1",
      conversationId: "conv-4",
      senderId: "user-4",
      content: "Check out this article I found about React patterns",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: "read",
    },
    {
      id: "msg-4-2",
      conversationId: "conv-4",
      senderId: "user-0",
      content: "Thanks! Will read it tonight.",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
      status: "read",
    },
  ],
  "conv-5": [
    {
      id: "msg-5-1",
      conversationId: "conv-5",
      senderId: "user-5",
      content: "Great presentation today! 👏",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      status: "read",
    },
    {
      id: "msg-5-2",
      conversationId: "conv-5",
      senderId: "user-0",
      content: "Thank you so much! Was a bit nervous.",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.5),
      status: "read",
    },
    {
      id: "msg-5-3",
      conversationId: "conv-5",
      senderId: "user-5",
      content: "You nailed it! The stakeholders loved it.",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      status: "read",
    },
  ],
  "conv-6": [
    {
      id: "msg-6-1",
      conversationId: "conv-6",
      senderId: "user-6",
      content: "Hey, when is the deadline for the feature?",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      status: "read",
    },
    {
      id: "msg-6-2",
      conversationId: "conv-6",
      senderId: "user-0",
      content: "End of this sprint, so Friday.",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47),
      status: "read",
    },
  ],
};

// Demo Conversations
export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participants: [currentUser, mockUsers[0]],
    lastMessage: mockMessages["conv-1"][mockMessages["conv-1"].length - 1],
    unreadCount: 1,
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "conv-2",
    participants: [currentUser, mockUsers[1]],
    lastMessage: mockMessages["conv-2"][mockMessages["conv-2"].length - 1],
    unreadCount: 0,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "conv-3",
    participants: [currentUser, mockUsers[2]],
    lastMessage: mockMessages["conv-3"][mockMessages["conv-3"].length - 1],
    unreadCount: 0,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "conv-4",
    participants: [currentUser, mockUsers[3]],
    lastMessage: mockMessages["conv-4"][mockMessages["conv-4"].length - 1],
    unreadCount: 0,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
  },
  {
    id: "conv-5",
    participants: [currentUser, mockUsers[4]],
    lastMessage: mockMessages["conv-5"][mockMessages["conv-5"].length - 1],
    unreadCount: 2,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: "conv-6",
    participants: [currentUser, mockUsers[5]],
    lastMessage: mockMessages["conv-6"][mockMessages["conv-6"].length - 1],
    unreadCount: 0,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 47),
  },
];

// Demo response messages for auto-reply
const demoResponses = [
  "That's interesting! Tell me more.",
  "I see what you mean! 👍",
  "Great point! Let me think about that.",
  "Absolutely! Sounds good to me.",
  "Ha! That's funny 😄",
  "I'll get back to you on that soon.",
  "Perfect, thanks for letting me know!",
  "Oh nice! Can't wait to see it.",
  "Sure thing! I'm on it.",
  "Sounds like a plan! 🚀",
];

export function getRandomResponse(): string {
  return demoResponses[Math.floor(Math.random() * demoResponses.length)];
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getOtherParticipant(conversation: Conversation): User {
  return (
    conversation.participants.find((p) => p.id !== currentUser.id) ||
    conversation.participants[0]
  );
}
