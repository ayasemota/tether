'use client';

import { Message } from '@/lib/mockData';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  showAvatar?: boolean;
  avatar?: string;
}

export default function MessageBubble({ 
  message, 
  isSent, 
  showAvatar = false,
  avatar 
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`flex gap-2 mb-4 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && avatar && (
        <Image
          src={avatar}
          alt="Avatar"
          width={32}
          height={32}
          className="rounded-full flex-shrink-0"
        />
      )}
      {showAvatar && !avatar && <div className="w-8" />}

      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {message.type === 'text' ? (
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isSent
                ? 'bg-message-sent text-message-sent-text rounded-br-sm'
                : 'bg-message-received text-message-received-text rounded-bl-sm'
            }`}
          >
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src={message.imageUrl!}
                alt="Shared image"
                width={300}
                height={200}
                className="object-cover"
              />
            </div>
            {message.content && (
              <div
                className={`px-4 py-2.5 rounded-2xl ${
                  isSent
                    ? 'bg-message-sent text-message-sent-text'
                    : 'bg-message-received text-message-received-text'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            )}
          </div>
        )}
        <span className="text-xs text-text-muted mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}