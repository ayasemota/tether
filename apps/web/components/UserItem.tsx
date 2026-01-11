'use client';

import { User } from '@/lib/mockData';
import Image from 'next/image';

interface UserItemProps {
  user: User;
  isSelected?: boolean;
  onClick: () => void;
  lastMessage?: string;
  unreadCount?: number;
}

export default function UserItem({ 
  user, 
  isSelected = false, 
  onClick, 
  lastMessage,
  unreadCount = 0 
}: UserItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-surface-hover ${
        isSelected ? 'bg-primary-light border border-primary' : 'border border-transparent'
      }`}
    >
      <div className="relative flex-shrink-0">
        <Image
          src={user.avatar}
          alt={user.name}
          width={48}
          height={48}
          className="rounded-full"
        />
        {user.isActive && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-active-dot border-2 border-background rounded-full"></span>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-semibold text-text-primary truncate">{user.name}</h3>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-sm text-text-muted truncate">
          {lastMessage || user.username}
        </p>
      </div>
    </button>
  );
}