'use client';

import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import { useState } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-surface p-4">
      <div className="flex items-end gap-2">
        <button className="p-2.5 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-hover">
          <ImageIcon className="w-5 h-5" />
        </button>
        
        <button className="p-2.5 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-hover">
          <Smile className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl resize-none focus:outline-none focus:border-input-focus focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-text-muted max-h-32"
            style={{ minHeight: '42px' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={`p-2.5 rounded-xl transition-all ${
            message.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-md'
              : 'bg-surface text-text-muted cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}