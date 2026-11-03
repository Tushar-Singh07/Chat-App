import React, { useState, useRef, useEffect } from 'react';
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
  PhoneIncoming,
  PhoneMissed,
  Video,
  VideoOff,
  Pencil,
  Pin,
  MoreVertical,
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
  onEdit?: (message: Message) => void;
  onPin?: (messageId: string) => void;
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
  onEdit,
  onPin,
  onReact,
  onImageClick,
  onScrollToMessage,
  isHighlighted = false,
}) => {
  const { addToast } = useToast();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click or escape
  useEffect(() => {
    if (!showMenu) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        bubbleRef.current &&
        !bubbleRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu]);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      addToast({ type: 'success', title: 'Message copied to clipboard' });
    }
    setShowMenu(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu((prev) => !prev);
  };

  const handleBubbleClick = (e: React.MouseEvent) => {
    // Prevent opening menu when clicking media or reactions or links
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('.reaction-badge') ||
      target.closest('.media-clickable')
    ) {
      return;
    }
    // Toggle menu when pressing/clicking the message
    setShowMenu((prev) => !prev);
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

  const canEdit = isMe && !message.callSummary && Boolean(message.content?.trim());

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

      {/* Quick Hover Action Bar (Desktop Convenience) */}
      <div
        className={cn(
          'absolute -top-3.5 z-20 hidden group-hover:flex items-center gap-0.5 p-1 bg-white dark:bg-[#202c33] border border-zinc-200 dark:border-[#222d34] rounded-full shadow-lg text-zinc-600 dark:text-zinc-300 transition-opacity',
          isMe ? 'left-2' : 'right-2'
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowReactionPicker(!showReactionPicker);
          }}
          className={cn(
            'p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors',
            myReaction && 'text-emerald-500'
          )}
          title="React"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReply(message);
          }}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>
        {canEdit && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(message);
            }}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors text-blue-500"
            title="Edit Message"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        {onPin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(message.id);
            }}
            className={cn(
              'p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors',
              message.isPinned && 'text-amber-500'
            )}
            title={message.isPinned ? 'Unpin Message' : 'Pin Message'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar(message.id);
          }}
          className={cn(
            'p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors',
            message.isStarred && 'text-amber-500 fill-amber-500'
          )}
          title={message.isStarred ? 'Unstar' : 'Star'}
        >
          <Star className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onForward(message);
          }}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors"
          title="Forward"
        >
          <Forward className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(message.id);
          }}
          className="p-1.5 rounded-full hover:bg-rose-50 text-rose-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors"
          title="More Options"
        >
          <MoreVertical className="w-3.5 h-3.5" />
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

      {/* Main Message Bubble */}
      <div
        ref={bubbleRef}
        onClick={handleBubbleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'px-3.5 py-2 rounded-2xl shadow-xs text-sm relative transition-all duration-300 border cursor-pointer select-text',
          isMe
            ? 'bg-emerald-100/90 text-zinc-900 dark:bg-[#005c4b] dark:text-zinc-100 rounded-tr-xs border-emerald-200/50 dark:border-transparent'
            : 'bg-white text-zinc-900 dark:bg-[#202c33] dark:text-zinc-100 rounded-tl-xs border-zinc-200/80 dark:border-transparent',
          isHighlighted && 'ring-4 ring-emerald-500 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-[#0b141a]'
        )}
      >
        {/* Message Options Pill Trigger Button inside Bubble (WhatsApp Web down-arrow style) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={cn(
            'absolute top-1.5 right-1.5 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all z-10',
            showMenu && 'opacity-100 bg-black/10 dark:bg-white/10'
          )}
          title="Message options"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {/* Call Summary Card */}
        {message.callSummary && (
          <div
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-xl border mb-1 select-none',
              message.callSummary.status === 'started'
                ? 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20 text-blue-700 dark:text-blue-300'
                : message.callSummary.duration === '00:00' ||
                  message.content?.toLowerCase().includes('missed') ||
                  message.content?.toLowerCase().includes('declined')
                ? 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
            )}
          >
            <div
              className={cn(
                'p-2 rounded-full text-white flex-shrink-0',
                message.callSummary.status === 'started'
                  ? 'bg-blue-600'
                  : message.callSummary.duration === '00:00' ||
                    message.content?.toLowerCase().includes('missed') ||
                    message.content?.toLowerCase().includes('declined')
                  ? 'bg-rose-600'
                  : 'bg-emerald-600'
              )}
            >
              {message.callSummary.type === 'video' ? (
                message.callSummary.duration === '00:00' ||
                message.content?.toLowerCase().includes('missed') ||
                message.content?.toLowerCase().includes('declined') ? (
                  <VideoOff className="w-4 h-4" />
                ) : (
                  <Video className="w-4 h-4" />
                )
              ) : message.callSummary.status === 'started' ? (
                <PhoneIncoming className="w-4 h-4" />
              ) : message.callSummary.duration === '00:00' ||
                message.content?.toLowerCase().includes('missed') ||
                message.content?.toLowerCase().includes('declined') ? (
                <PhoneMissed className="w-4 h-4" />
              ) : (
                <PhoneCall className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold capitalize">
                {message.callSummary.status === 'started'
                  ? `${message.callSummary.type} Call Started`
                  : message.callSummary.duration === '00:00' ||
                    message.content?.toLowerCase().includes('missed') ||
                    message.content?.toLowerCase().includes('declined')
                  ? message.content || `Missed ${message.callSummary.type} Call`
                  : `${message.callSummary.type} Call Ended`}
              </p>
              <p className="text-[11px] opacity-75">
                {message.callSummary.status === 'started'
                  ? `Started at ${message.timestamp}`
                  : message.callSummary.duration && message.callSummary.duration !== '00:00'
                  ? `Duration: ${message.callSummary.duration}`
                  : 'No answer'}
              </p>
            </div>
          </div>
        )}

        {/* Reply Quote Banner */}
        {replyMessage && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onScrollToMessage && onScrollToMessage(replyMessage.id);
            }}
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
          <div className="mb-2 space-y-2 media-clickable">
            {message.attachments.map((att) => (
              <div key={att.id} onClick={(e) => e.stopPropagation()}>
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
          <p className="whitespace-pre-wrap leading-relaxed select-text pr-4">{message.content}</p>
        )}

        {/* Footer (Pinned, Edited, Star, Time, Status) */}
        <div className="flex items-center justify-end gap-1.5 text-[10px] opacity-70 mt-1 select-none">
          {message.isPinned && (
            <span title="Pinned message">
              <Pin className="w-3 h-3 text-amber-500" />
            </span>
          )}
          {message.isStarred && (
            <span title="Starred message">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            </span>
          )}
          {message.isEdited && (
            <span className="italic text-[9px] text-zinc-500 dark:text-zinc-400 font-medium">
              (edited)
            </span>
          )}
          <span>{message.timestamp}</span>
          {renderStatus()}
        </div>

        {/* Reaction Badges */}
        {reactionGroups.length > 0 && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionsModal(true);
            }}
            className={cn(
              'reaction-badge absolute -bottom-3 px-2 py-0.5 rounded-full bg-white dark:bg-[#202c33] border border-zinc-200 dark:border-zinc-700 text-xs shadow-md flex items-center gap-1 z-10 cursor-pointer hover:scale-110 transition-transform select-none',
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

      {/* Popover / Context Menu Displayed when User Presses on the Message */}
      {showMenu && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'absolute z-50 min-w-[200px] py-1.5 bg-white dark:bg-[#233138] border border-zinc-200 dark:border-[#2b3940] rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 select-none',
            isMe ? 'right-0 top-full mt-1' : 'left-0 top-full mt-1'
          )}
        >
          {/* Reply */}
          <button
            type="button"
            onClick={() => {
              onReply(message);
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#182229] transition-colors text-left"
          >
            <Reply className="w-4 h-4 text-emerald-500" />
            <span>Reply</span>
          </button>

          {/* Edit Message (Sender Only) */}
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit(message);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#182229] transition-colors text-left text-blue-600 dark:text-blue-400 font-medium"
            >
              <Pencil className="w-4 h-4 text-blue-500" />
              <span>Edit Message</span>
            </button>
          )}

          {/* Pin Message / Unpin Message */}
          {onPin && (
            <button
              type="button"
              onClick={() => {
                onPin(message.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#182229] transition-colors text-left"
            >
              <Pin className={cn('w-4 h-4', message.isPinned ? 'text-amber-500 fill-amber-500' : 'text-amber-500')} />
              <span>{message.isPinned ? 'Unpin Message' : 'Pin Message'}</span>
            </button>
          )}

          {/* Star Message / Unstar Message */}
          <button
            type="button"
            onClick={() => {
              onStar(message.id);
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#182229] transition-colors text-left"
          >
            <Star
              className={cn(
                'w-4 h-4',
                message.isStarred ? 'text-amber-500 fill-amber-500' : 'text-amber-500'
              )}
            />
            <span>{message.isStarred ? 'Unstar Message' : 'Star Message'}</span>
          </button>

          {/* Forward */}
          <button
            type="button"
            onClick={() => {
              onForward(message);
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#182229] transition-colors text-left"
          >
            <Forward className="w-4 h-4 text-purple-500" />
            <span>Forward</span>
          </button>

          {/* Copy Text */}
          {message.content && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#182229] transition-colors text-left"
            >
              <Copy className="w-4 h-4 text-zinc-500" />
              <span>Copy Text</span>
            </button>
          )}

          {/* React */}
          <button
            type="button"
            onClick={() => {
              setShowReactionPicker(true);
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#182229] transition-colors text-left"
          >
            <Smile className="w-4 h-4 text-emerald-500" />
            <span>React</span>
          </button>

          <div className="my-1 border-t border-zinc-100 dark:border-[#2b3940]" />

          {/* Delete Message */}
          <button
            type="button"
            onClick={() => {
              onDelete(message.id);
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
          >
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Delete Message</span>
          </button>
        </div>
      )}

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
