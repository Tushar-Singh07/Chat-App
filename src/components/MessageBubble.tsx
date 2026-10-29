import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Loader2,
  Reply,
  Smile,
  Copy,
  Forward,
  Star,
  Trash2,
  PhoneCall,
  Video,
} from 'lucide-react';
import type { Message } from '../types';
import { ReactionPicker } from './ReactionPicker';
import { ReactionsModal } from './ReactionsModal';
import { AudioPlayer } from './AudioPlayer';
import { ImageMessage } from './media/ImageMessage';
import { VideoMessage } from './media/VideoMessage';
import { DocumentMessage } from './media/DocumentMessage';
import { LocationMessage } from './media/LocationMessage';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  senderName: string;
  replyMessage?: Message;
  currentUserId: string;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onStar: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onImageClick: (url: string) => void;
  onScrollToMessage?: (messageId: string) => void;
  isHighlighted?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  senderName,
  replyMessage,
  currentUserId,
  onReply,
  onForward,
  onDelete,
  onStar,
  onReact,
  onImageClick,
  onScrollToMessage,
  isHighlighted = false,
}) => {
  const { addToast } = useToast();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    addToast({ type: 'success', title: 'Message copied to clipboard' });
  };

  const renderStatus = () => {
    if (!isMe) return null;
    switch (message.status) {
      case 'sending':
        return <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 inline" />;
      case 'delivered':
        return (
          <span title="Delivered">
            <CheckCheck className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 inline" />
          </span>
        );
      case 'read':
      case 'seen':
        return (
          <span title="Read">
            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline" />
          </span>
        );
      case 'sent':
      default:
        return (
          <span title="Sent">
            <Check className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 inline" />
          </span>
        );
    }
  };

  const myReaction = message.reactions?.find((r) => r.userId === currentUserId);

  const reactionGroups: { emoji: string; count: number }[] = [];
  if (message.reactions && message.reactions.length > 0) {
    message.reactions.forEach((r) => {
      const existing = reactionGroups.find((g) => g.emoji === r.emoji);
      if (existing) {
        existing.count += 1;
      } else {
        reactionGroups.push({ emoji: r.emoji, count: 1 });
      }
    });
  }

  return (
    <div
      id={`msg-${message.id}`}
      className={cn(
        'group relative flex flex-col max-w-[85%] sm:max-w-[70%] my-1 select-none transition-all duration-300',
        isMe ? 'ml-auto items-end' : 'mr-auto items-start',
        isHighlighted && 'scale-[1.02] z-20'
      )}
    >
      {!isMe && (
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#00a884] mb-0.5 ml-2">
          {senderName}
        </span>
      )}

      {/* Action Controls Menu */}
      <div
        className={cn(
          'absolute -top-3 z-20 hidden group-hover:flex items-center gap-0.5 p-1 bg-white dark:bg-[#202c33] border border-zinc-200 dark:border-[#222d34] rounded-full shadow-lg text-zinc-600 dark:text-zinc-300 transition-opacity',
          isMe ? 'left-2' : 'right-2'
        )}
      >
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className={cn(
            'p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors',
            myReaction && 'text-emerald-500'
          )}
          title="React"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onReply(message)}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors"
          title="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onForward(message)}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors"
          title="Forward"
        >
          <Forward className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onStar(message.id)}
          className={cn(
            'p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors',
            message.isStarred && 'text-amber-500 fill-amber-500'
          )}
          title={message.isStarred ? 'Unstar' : 'Star'}
        >
          <Star className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(message.id)}
          className="p-1.5 rounded-full hover:bg-rose-50 text-rose-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {showReactionPicker && (
        <div className={cn('absolute -top-10 z-30', isMe ? 'right-0' : 'left-0')}>
          <ReactionPicker
            currentEmoji={myReaction?.emoji}
            onSelectEmoji={(emoji) => {
              onReact(message.id, emoji);
              setShowReactionPicker(false);
            }}
          />
        </div>
      )}

      <div
        className={cn(
          'px-3.5 py-2 rounded-2xl shadow-xs text-sm relative transition-all duration-300 border',
          isMe
            ? 'bg-emerald-100/90 text-zinc-900 dark:bg-[#005c4b] dark:text-zinc-100 rounded-tr-xs border-emerald-200/50 dark:border-transparent'
            : 'bg-white text-zinc-900 dark:bg-[#202c33] dark:text-zinc-100 rounded-tl-xs border-zinc-200/80 dark:border-transparent',
          isHighlighted && 'ring-4 ring-emerald-500 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-[#0b141a]'
        )}
      >
        {/* Call Summary Card */}
        {message.callSummary && (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 mb-1">
            <div className="p-2 rounded-full bg-emerald-600 text-white">
              {message.callSummary.type === 'video' ? (
                <Video className="w-4 h-4" />
              ) : (
                <PhoneCall className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold capitalize text-emerald-700 dark:text-emerald-300">
                {message.callSummary.type} Call Ended
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Duration: {message.callSummary.duration}
              </p>
            </div>
          </div>
        )}

        {/* Reply Quote Banner */}
        {replyMessage && (
          <div
            onClick={() => onScrollToMessage && onScrollToMessage(replyMessage.id)}
            className="mb-2 p-2 rounded-xl bg-black/5 dark:bg-black/25 border-l-4 border-emerald-500 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-black/10 dark:hover:bg-black/35 transition-colors select-none"
          >
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
              Replying to message
            </span>
            <p className="truncate text-zinc-600 dark:text-zinc-400">{replyMessage.content}</p>
          </div>
        )}

        {/* Media Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.attachments.map((att) => (
              <div key={att.id}>
                {att.type === 'image' && (
                  <ImageMessage attachment={att} onClick={() => onImageClick(att.url)} />
                )}
                {att.type === 'video' && <VideoMessage attachment={att} isMe={isMe} />}
                {att.type === 'audio' && <AudioPlayer url={att.url} duration={att.duration} isMe={isMe} />}
                {att.type === 'document' && <DocumentMessage attachment={att} isMe={isMe} />}
                {att.type === 'location' && <LocationMessage attachment={att} />}
              </div>
            ))}
          </div>
        )}

        {/* Message Content */}
        {message.content && !message.callSummary && (
          <p className="whitespace-pre-wrap leading-relaxed select-text">{message.content}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-1.5 text-[10px] opacity-70 mt-1 select-none">
          {message.isStarred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
          <span>{message.timestamp}</span>
          {renderStatus()}
        </div>

        {/* Reaction Badges */}
        {reactionGroups.length > 0 && (
          <div
            onClick={() => setShowReactionsModal(true)}
            className={cn(
              'absolute -bottom-3 px-2 py-0.5 rounded-full bg-white dark:bg-[#202c33] border border-zinc-200 dark:border-zinc-700 text-xs shadow-md flex items-center gap-1 z-10 cursor-pointer hover:scale-110 transition-transform select-none',
              isMe ? 'right-2' : 'left-2'
            )}
            title="View reactions"
          >
            {reactionGroups.map((g) => (
              <span key={g.emoji} className="flex items-center gap-0.5">
                <span>{g.emoji}</span>
                {g.count > 1 && <span className="text-[10px] font-bold opacity-75">{g.count}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      <ReactionsModal
        isOpen={showReactionsModal}
        reactions={message.reactions || []}
        onClose={() => setShowReactionsModal(false)}
        currentUserId={currentUserId}
        onRemoveMyReaction={(emoji) => onReact(message.id, emoji)}
      />
    </div>
  );
};
