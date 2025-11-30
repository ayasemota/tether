export interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
}

export interface Conversation {
  id: number;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}