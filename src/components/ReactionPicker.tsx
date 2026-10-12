import React from 'react';
import { cn } from '../utils/cn';

export const REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🙏', '🔥', '👏'];

interface ReactionPickerProps {
  onSelectEmoji: (emoji: string) => void;
  currentEmoji?: string;
  className?: string;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelectEmoji,
  currentEmoji,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#202c33] border border-zinc-200 dark:border-[#222d34] rounded-full shadow-2xl animate-in zoom-in-90 duration-150 z-30 select-none',
        className
      )}
    >
      {REACTION_EMOJIS.map((emoji) => {
        const isActive = currentEmoji === emoji;
        return (
          <button
            key={emoji}
            onClick={(e) => {
              e.stopPropagation();
              onSelectEmoji(emoji);
            }}
            className={cn(
              'p-1.5 text-base rounded-full transition-all hover:scale-125',
              isActive
                ? 'bg-emerald-500/20 scale-110 ring-2 ring-emerald-500'
                : 'hover:bg-zinc-100 dark:hover:bg-[#2a3942]'
            )}
            title={isActive ? `Remove ${emoji} reaction` : `React with ${emoji}`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
};
