import React from 'react';
import type { MediaAttachment } from '../../types';
import { cn } from '../../utils/cn';

interface ImageMessageProps {
  attachment: MediaAttachment;
  onClick: () => void;
  className?: string;
}

export const ImageMessage: React.FC<ImageMessageProps> = ({ attachment, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative group cursor-pointer rounded-xl overflow-hidden shadow-xs transition-transform active:scale-[0.99]',
        className
      )}
    >
      <img
        src={attachment.url}
        alt={attachment.fileName || 'Shared image'}
        className="w-full max-h-72 object-cover rounded-xl transition-transform group-hover:scale-105 duration-200"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
    </div>
  );
};
