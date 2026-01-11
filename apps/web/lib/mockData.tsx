export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isActive: boolean;
  lastSeen?: string;
  bio?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image';
  imageUrl?: string;
  read: boolean;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    username: '@alexchen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    isActive: true,
    bio: 'Designer & coffee enthusiast ☕'
  },
  {
    id: '2',
    name: 'Maya Rodriguez',
    username: '@mayarod',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
    isActive: true,
    bio: 'Building cool stuff 🚀'
  },
  {
    id: '3',
    name: 'Jordan Lee',
    username: '@jlee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    isActive: false,
    lastSeen: '2h ago',
    bio: 'Music lover 🎵'
  },
  {
    id: '4',
    name: 'Sam Parker',
    username: '@samparker',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    isActive: true,
    bio: 'Tech enthusiast & gamer 🎮'
  },
  {
    id: '5',
    name: 'Riley Morgan',
    username: '@rileymorgan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley',
    isActive: false,
    lastSeen: '5m ago',
    bio: 'Photographer 📸'
  },
  {
    id: '6',
    name: 'Casey Brooks',
    username: '@caseyb',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
    isActive: true,
    bio: 'Fitness & wellness 💪'
  },
  {
    id: '7',
    name: 'Taylor Swift',
    username: '@taylorswift',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor',
    isActive: false,
    lastSeen: '1d ago',
    bio: 'Artist & creator 🎨'
  },
  {
    id: '8',
    name: 'Morgan Kim',
    username: '@morgankim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan',
    isActive: true,
    bio: 'Foodie & travel junkie 🌍'
  }
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: '2',
    receiverId: 'current-user',
    content: 'Hey! Did you see the new design mockups?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text',
    read: true
  },
  {
    id: 'm2',
    senderId: 'current-user',
    receiverId: '2',
    content: 'Yes! They look amazing! 🔥',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    type: 'text',
    read: true
  },
  {
    id: 'm3',
    senderId: '2',
    receiverId: 'current-user',
    content: 'Check this out',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    read: true
  },
  {
    id: 'm4',
    senderId: 'current-user',
    receiverId: '2',
    content: 'Love the color palette!',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    type: 'text',
    read: true
  },
  {
    id: 'm5',
    senderId: '4',
    receiverId: 'current-user',
    content: 'Are we still on for the game tonight?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    type: 'text',
    read: false
  },
  {
    id: 'm6',
    senderId: '1',
    receiverId: 'current-user',
    content: 'Coffee meeting at 3pm?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    type: 'text',
    read: false
  },
  {
    id: 'm7',
    senderId: 'current-user',
    receiverId: '1',
    content: 'Sounds perfect! See you there ☕',
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    type: 'text',
    read: true
  },
  {
    id: 'm8',
    senderId: '6',
    receiverId: 'current-user',
    content: 'Gym session tomorrow morning?',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    type: 'text',
    read: true
  },
  {
    id: 'm9',
    senderId: '8',
    receiverId: 'current-user',
    content: 'Found this awesome restaurant!',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    read: true
  },
  {
    id: 'm10',
    senderId: 'current-user',
    receiverId: '8',
    content: 'Omg we need to go there!',
    timestamp: new Date(Date.now() - 1000 * 60 * 175),
    type: 'text',
    read: true
  },
  {
    id: 'm11',
    senderId: '2',
    receiverId: 'current-user',
    content: 'The project deadline is next week',
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    type: 'text',
    read: true
  },
  {
    id: 'm12',
    senderId: '4',
    receiverId: 'current-user',
    content: 'Check out this gaming setup',
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=600&fit=crop',
    read: true
  }
];

export const currentUser: User = {
  id: 'current-user',
  name: 'You',
  username: '@you',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
  isActive: true,
  bio: 'Living my best life ✨'
};


export const getConversationMessages = (userId: string): Message[] => {
  return mockMessages
    .filter(msg => 
      (msg.senderId === userId && msg.receiverId === 'current-user') ||
      (msg.senderId === 'current-user' && msg.receiverId === userId)
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};


export const getLastMessage = (userId: string): Message | undefined => {
  const messages = getConversationMessages(userId);
  return messages[messages.length - 1];
};