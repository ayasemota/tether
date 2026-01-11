'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

interface MediaModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export default function MediaModal({ isOpen, imageUrl, onClose }: MediaModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-200">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div 
        className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center"
        onClick={onClose}
      >
        <div 
          className="relative w-full h-full" 
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={imageUrl}
            alt="Fullscreen media"
            fill
            className="object-contain"
            priority
            quality={100}
          />
        </div>
      </div>
    </div>
  );
}
