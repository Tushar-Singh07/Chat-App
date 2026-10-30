import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  VolumeX,
  Check,
  CheckCheck,
  Loader2,
  MoreVertical,
  Archive,
  ArchiveRestore,
  Trash2,
  Mail,
  MailOpen,
  Camera,
  FileText,
} from 'lucide-react';
import type { Conversation } from '../types';
import { Avatar } from './Avatar';
import { getUserById } from '../data/users';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onSelect,
}) => {
  const {
    currentUser,
    getUserById,
    togglePinConversation,
    toggleMuteConversation,
    toggleArchiveConversation,
    deleteConversation,
    markAsRead,
    getUserPresence,
    typingUsers,
  } = useApp();
  const { addToast } = useToast();

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const partnerId = conversation.participantIds.find((id) => id !== currentUser.id) || '';
  const partner = getUserById(partnerId);
  const presence = getUserPresence(partnerId);
  const isTyping = typingUsers[conversation.id] || presence.status === 'typing';

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsContextMenuOpen(false);
      }
    };
    if (isContextMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isContextMenuOpen]);

  // Handle Right-click Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setIsContextMenuOpen(true);
  };

  const lastMsg = conversation.lastMessage;
  const isMe = lastMsg?.senderId === currentUser.id;

  const renderLastMessageStatus = () => {
    if (!isMe || !lastMsg) return null;
    switch (lastMsg.status) {
      case 'sending':
        return <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 inline flex-shrink-0" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 inline flex-shrink-0" />;
      case 'seen':
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline flex-shrink-0" />;
      case 'sent':
      default:
        return <Check className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 inline flex-shrink-0" />;
    }
  };

  return (
    <div
      onClick={() => {
        onSelect();
        markAsRead(conversation.id);
      }}
      onContextMenu={handleContextMenu}
      className={cn(
        'group relative flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-all duration-150 select-none border-b border-zinc-100 dark:border-[#222d34]/60',
        isSelected
          ? 'bg-zinc-100 dark:bg-[#2a3942]'
          : 'hover:bg-zinc-100/70 dark:hover:bg-[#202c33]'
      )}
    >
      {/* User Avatar with Presence */}
      <Avatar
        src={partner.avatar}
        alt={partner.name}
        size="lg"
        presence={isTyping ? 'online' : presence.status === 'online' ? 'online' : 'offline'}
        showPresence
        hasUnreadStatus={conversation.unreadCount > 0}
      />

      {/* Main Info Area */}
      <div className="flex-1 min-w-0">
        {/* Name & Timestamp Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {partner.name}
          </h3>
          <span
            className={cn(
              'text-xs flex-shrink-0 transition-colors',
              conversation.unreadCount > 0
                ? 'text-emerald-600 dark:text-[#00a884] font-semibold'
                : 'text-zinc-400 dark:text-zinc-500'
            )}
          >
            {lastMsg?.timestamp || ''}
          </span>
        </div>

        {/* Message Snippet & State Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 truncate flex-1">
            {isTyping ? (
              <span className="text-emerald-600 dark:text-[#00a884] font-semibold flex items-center gap-1 animate-pulse">
                <span>typing</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce delay-100" />
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce delay-200" />
                </span>
              </span>
            ) : (
              <>
                {/* Delivery / Read Status Checkmarks */}
                {renderLastMessageStatus()}

                {/* Media Attachment Indicator */}
                {lastMsg?.attachments && lastMsg.attachments.length > 0 && (
                  <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-medium">
                    {lastMsg.attachments[0].type === 'image' ? (
                      <Camera className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </span>
                )}

                <p className="truncate leading-tight">
                  {lastMsg?.content || 'No messages yet'}
                </p>
              </>
            )}
          </div>

          {/* Indicators & Hover Action Trigger */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {conversation.isMuted && (
              <span title="Muted">
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
              </span>
            )}
            {conversation.isPinned && (
              <span title="Pinned">
                <Pin className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400" />
              </span>
            )}
            {conversation.unreadCount > 0 && (
              <span className="px-1.5 py-0.5 min-w-[20px] h-5 rounded-full bg-emerald-600 dark:bg-[#00a884] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                {conversation.unreadCount}
              </span>
            )}

            {/* Quick Context Menu Button on Hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e);
              }}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Context Menu Modal / Popup */}
      {isContextMenuOpen && (
        <div
          ref={menuRef}
          style={{ top: `${Math.min(contextMenuPos.y, window.innerHeight - 200)}px`, left: `${Math.min(contextMenuPos.x, window.innerWidth - 220)}px` }}
          className="fixed z-50 w-52 bg-white dark:bg-[#202c33] shadow-2xl rounded-2xl border border-zinc-200 dark:border-[#222d34] py-1 text-xs text-zinc-800 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Pin / Unpin */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePinConversation(conversation.id);
              setIsContextMenuOpen(false);
              addToast({
                type: 'info',
                title: conversation.isPinned ? 'Chat Unpinned' : 'Chat Pinned',
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#111b21] transition-colors"
          >
            <Pin className="w-4 h-4 text-emerald-500" />
            {conversation.isPinned ? 'Unpin Chat' : 'Pin Chat'}
          </button>

          {/* Mute / Unmute */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMuteConversation(conversation.id);
              setIsContextMenuOpen(false);
              addToast({
                type: 'info',
                title: conversation.isMuted ? 'Chat Unmuted' : 'Chat Muted',
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#111b21] transition-colors"
          >
            <VolumeX className="w-4 h-4 text-amber-500" />
            {conversation.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
          </button>

          {/* Archive / Unarchive */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleArchiveConversation(conversation.id);
              setIsContextMenuOpen(false);
              addToast({
                type: 'info',
                title: conversation.isArchived ? 'Chat Unarchived' : 'Chat Archived',
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#111b21] transition-colors"
          >
            {conversation.isArchived ? (
              <ArchiveRestore className="w-4 h-4 text-sky-500" />
            ) : (
              <Archive className="w-4 h-4 text-sky-500" />
            )}
            {conversation.isArchived ? 'Unarchive Chat' : 'Archive Chat'}
          </button>

          {/* Mark as Read / Unread */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(conversation.id);
              setIsContextMenuOpen(false);
              addToast({
                type: 'success',
                title: 'Marked as Read',
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-[#111b21] transition-colors"
          >
            {conversation.unreadCount > 0 ? (
              <MailOpen className="w-4 h-4 text-emerald-500" />
            ) : (
              <Mail className="w-4 h-4 text-zinc-400" />
            )}
            Mark as Read
          </button>

          <div className="my-1 border-t border-zinc-200 dark:border-[#222d34]" />

          {/* Delete Conversation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteConversation(conversation.id);
              setIsContextMenuOpen(false);
              addToast({
                type: 'warning',
                title: 'Conversation Deleted',
                description: `Removed chat with ${partner.name}`,
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            Delete Chat
          </button>
        </div>
      )}
    </div>
  );
};
