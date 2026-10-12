import React, { useState } from 'react';
import type { Reaction } from '../types';
import { Modal } from './Modal';
import { Avatar } from './Avatar';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

interface ReactionsModalProps {
  isOpen: boolean;
  reactions: Reaction[];
  onClose: () => void;
  onRemoveMyReaction?: (emoji: string) => void;
  currentUserId: string;
}

export const ReactionsModal: React.FC<ReactionsModalProps> = ({
  isOpen,
  reactions,
  onClose,
  onRemoveMyReaction,
  currentUserId,
}) => {
  const { getUserById } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  if (!isOpen || reactions.length === 0) return null;

  // Group unique emojis for filter tabs
  const uniqueEmojis = Array.from(new Set(reactions.map((r) => r.emoji)));

  const filteredReactions =
    selectedFilter === 'all'
      ? reactions
      : reactions.filter((r) => r.emoji === selectedFilter);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Message Reactions"
      description={`${reactions.length} total ${reactions.length === 1 ? 'reaction' : 'reactions'}`}
      size="sm"
    >
      <div className="space-y-4 select-none">
        {/* Emoji Filter Tabs */}
        <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-[#222d34] pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedFilter('all')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
              selectedFilter === 'all'
                ? 'bg-emerald-600/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#202c33]'
            )}
          >
            All ({reactions.length})
          </button>
          {uniqueEmojis.map((emoji) => {
            const count = reactions.filter((r) => r.emoji === emoji).length;
            return (
              <button
                key={emoji}
                onClick={() => setSelectedFilter(emoji)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1',
                  selectedFilter === emoji
                    ? 'bg-emerald-600/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#202c33]'
                )}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Reacted Users List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredReactions.map((r) => {
            const user = getUserById(r.userId);
            const isMe = r.userId === currentUserId;

            return (
              <div
                key={r.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#202c33] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} alt={user.name} size="md" />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {isMe ? 'You' : user.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {isMe ? 'Tap emoji to remove' : r.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg">{r.emoji}</span>
                  {isMe && onRemoveMyReaction && (
                    <button
                      onClick={() => {
                        onRemoveMyReaction(r.emoji);
                        onClose();
                      }}
                      className="text-xs text-rose-500 hover:underline ml-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
