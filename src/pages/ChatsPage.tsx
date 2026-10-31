import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquarePlus,
  MoreVertical,
  Phone,
  Video,
  Search,
  Paperclip,
  Smile,
  Mic,
  Send,
  CheckCheck,
  ArrowLeft,
  Filter,
  ShieldCheck,
  Archive,
  MessageSquare,
  Users,
  X,
  VolumeX,
  Trash2,
  Lock,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import { useIsMobile } from '../hooks/useMediaQuery';
import { Avatar } from '../components/Avatar';
import { SearchBar } from '../components/SearchBar';
import { Modal } from '../components/Modal';
import { Dropdown } from '../components/Dropdown';
import { ConversationItem } from '../components/ConversationItem';
import { MessageBubble } from '../components/MessageBubble';
import { AttachmentMenu, type AttachmentOptionType } from '../components/AttachmentMenu';
import { MediaPreview } from '../components/media/MediaPreview';
import { ImageViewer, type ImageMediaItem } from '../components/media/ImageViewer';
import { VoiceRecorder } from '../components/media/VoiceRecorder';
import { ForwardModal } from '../components/ForwardModal';
import { VoiceCallScreen } from '../components/call/VoiceCallScreen';
import { VideoCallScreen } from '../components/call/VideoCallScreen';
import { ChatPlaceholder } from './ChatPlaceholder';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import type { Message, MediaAttachment } from '../types';
import { cn } from '../utils/cn';
import { formatLastSeen } from '../utils/formatters';
import { getUserById } from '../data/users';

export const ChatsPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { addToast } = useToast();

  const {
    conversations,
    messages,
    currentUser,
    users,
    activeConversationId,
    setActiveConversationId,
    markAllAsRead,
    createConversation,
    sendMessage,
    deleteMessage,
    toggleStarMessage,
    addReaction,
    typingUsers,
    activeCallUser,
    startVoiceCall,
    endVoiceCall,
    activeVideoCallUser,
    startVideoCall,
    endVideoCall,
    getUserPresence,
    getUserById,
    markAsRead,
  } = useApp();

  // Conversation list state
  const [listSearch, setListSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Debounced search for registered users from backend API
  useEffect(() => {
    if (!isNewChatModalOpen) {
      setNewChatSearch('');
      setSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    const query = newChatSearch.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    setIsSearchingUsers(true);
    const timer = setTimeout(async () => {
      const res = await userService.searchUsers(query);
      if (res.success && Array.isArray(res.data)) {
        setSearchResults(res.data.filter((u: any) => (u.id || u._id) !== currentUser.id));
      } else {
        setSearchResults([]);
      }
      setIsSearchingUsers(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [newChatSearch, isNewChatModalOpen, currentUser.id]);

  // Individual Chat view state
  const [messageInput, setMessageInput] = useState('');
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [forwardTargetMessage, setForwardTargetMessage] = useState<Message | null>(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // File Upload & Media Preview State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [previewMediaType, setPreviewMediaType] = useState<'image' | 'video'>('image');
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);

  // Full Screen Image Viewer State
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // Hidden File Inputs Refs
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // In-chat message search state
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine active conversation based on route parameter
  const currentConvId = conversationId || activeConversationId;
  const currentConversation = conversations.find((c) => c.id === currentConvId);

  const targetUserId = currentConversation
    ? currentConversation.participantIds.find((id) => id !== currentUser.id) || currentUser.id
    : null;

  const targetUser = targetUserId ? getUserById(targetUserId) : null;
  const targetPresence = targetUser ? getUserPresence(targetUser.id) : null;
  const rawMessages = currentConvId ? messages[currentConvId] || [] : [];
  const isTyping = currentConvId
    ? typingUsers[currentConvId] || targetPresence?.status === 'typing'
    : false;

  // Mark received messages as seen when opening a chat or when new messages arrive
  useEffect(() => {
    if (currentConvId) {
      markAsRead(currentConvId);
    }
  }, [currentConvId, rawMessages.length, markAsRead]);

  // Filter in-chat messages if chat search is active
  const conversationMessages = chatSearchQuery.trim()
    ? rawMessages.filter((m) => m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : rawMessages;

  // Auto-scroll to bottom of chat feed on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length, isTyping]);

  // Sync route param with AppContext active conversation
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, activeConversationId, setActiveConversationId]);

  // Extract all image attachments in conversation for gallery viewer
  const imageGalleryList: ImageMediaItem[] = rawMessages
    .flatMap((m) =>
      (m.attachments || [])
        .filter((att) => att.type === 'image')
        .map((att) => ({
          id: m.id,
          url: att.url,
          fileName: att.fileName,
          caption: m.content,
          timestamp: m.timestamp,
        }))
    );

  const handleOpenImageViewer = (imageUrl: string) => {
    const idx = imageGalleryList.findIndex((item) => item.url === imageUrl);
    setViewerInitialIndex(idx >= 0 ? idx : 0);
    setIsImageViewerOpen(true);
  };

  // Scroll to original message when clicking a quoted reply box
  const handleScrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(msgId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    } else {
      addToast({ type: 'info', title: 'Original message not found in feed' });
    }
  };

  // Conversation List filtering
  const filteredConversations = conversations
    .filter((c) => {
      const partner = getUserById(c.participantIds.find((id) => id !== currentUser.id) || '');
      const matchesSearch =
        partner.name.toLowerCase().includes(listSearch.toLowerCase()) ||
        (c.lastMessage?.content || '').toLowerCase().includes(listSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (activeFilter === 'archived') return c.isArchived;
      if (c.isArchived) return false;

      if (activeFilter === 'unread') return c.unreadCount > 0;
      if (activeFilter === 'pinned') return !!c.isPinned;
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const archivedCount = conversations.filter((c) => c.isArchived).length;
  const unreadCount = conversations.filter((c) => c.unreadCount > 0 && !c.isArchived).length;

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    navigate(`/chat/${id}`);
  };

  const handleStartNewChat = async (userId: string) => {
    setIsNewChatModalOpen(false);
    setNewChatSearch('');
    const newId = await createConversation(userId);
    if (newId) handleSelectConversation(newId);
  };

  // Submit Text / Voice Message
  const isSendingRef = useRef(false);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentConvId || !messageInput.trim() || isSendingRef.current) return;

    const textToSend = messageInput.trim();
    const replyId = replyTarget ? replyTarget.id : undefined;

    isSendingRef.current = true;
    setMessageInput('');
    setReplyTarget(null);
    setShowEmojiPicker(false);

    try {
      await sendMessage(currentConvId, textToSend, replyId);
    } finally {
      isSendingRef.current = false;
    }
  };

  // Handle File Input Change (Local Object URL generation)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');

    setSelectedFile(file);
    setPreviewMediaUrl(fileUrl);
    setPreviewMediaType(isVideo ? 'video' : 'image');
    setIsMediaPreviewOpen(true);

    e.target.value = '';
  };

  // Send Media Preview with optional caption
  const handleSendMediaPreview = (caption: string) => {
    if (!currentConvId || !previewMediaUrl) return;

    const attachment: MediaAttachment = {
      id: `att-${Date.now()}`,
      type: previewMediaType,
      url: previewMediaUrl,
      fileName: selectedFile ? selectedFile.name : `${previewMediaType}.jpg`,
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
    };

    sendMessage(currentConvId, caption, replyTarget ? replyTarget.id : undefined, [attachment]);

    setIsMediaPreviewOpen(false);
    setPreviewMediaUrl(null);
    setSelectedFile(null);
    setReplyTarget(null);
    addToast({ type: 'success', title: `${previewMediaType === 'image' ? 'Photo' : 'Video'} sent` });
  };

  // Handle Attachment Menu Option Selection
  const handleSelectAttachmentOption = (option: AttachmentOptionType) => {
    if (option === 'photos') {
      mediaFileInputRef.current?.click();
    } else if (option === 'document') {
      docFileInputRef.current?.click();
    } else if (option === 'camera') {
      const mockCameraImg = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
      setPreviewMediaUrl(mockCameraImg);
      setPreviewMediaType('image');
      setIsMediaPreviewOpen(true);
    } else if (option === 'location') {
      if (!currentConvId) return;
      const locationAtt: MediaAttachment = {
        id: `loc-${Date.now()}`,
        type: 'location',
        url: '',
        locationName: 'Connaught Place, New Delhi',
        latitude: 28.6315,
        longitude: 77.2167,
      };
      sendMessage(currentConvId, 'Shared live location', undefined, [locationAtt]);
      addToast({ type: 'success', title: 'Location shared' });
    } else if (option === 'contact') {
      addToast({ type: 'info', title: 'Select a contact card to share' });
    }
  };

  const handleSendRecordedVoiceNote = (durationStr: string) => {
    if (!currentConvId) return;
    const voiceAtt: MediaAttachment = {
      id: `att-voice-${Date.now()}`,
      type: 'audio',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      fileName: 'Voice_Message.mp3',
      duration: durationStr,
      fileSize: '480 KB',
    };

    sendMessage(currentConvId, '', replyTarget ? replyTarget.id : undefined, [voiceAtt]);
    setIsRecordingVoice(false);
    setReplyTarget(null);
    addToast({ type: 'success', title: 'Voice Message Sent' });
  };

  const handleCall = (type: 'voice' | 'video') => {
    if (!targetUser) return;
    if (type === 'voice') {
      startVoiceCall(targetUser, currentConvId || undefined);
    } else {
      startVideoCall(targetUser, currentConvId || undefined);
    }
  };

  const showList = !isMobile || (isMobile && !conversationId);
  const showChat = !isMobile || (isMobile && !!conversationId);

  const availableContacts = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    const q = newChatSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex w-full h-full max-w-full max-h-full overflow-hidden bg-white dark:bg-[#111b21]">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={mediaFileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={docFileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && currentConvId) {
            const url = URL.createObjectURL(file);
            const docAtt: MediaAttachment = {
              id: `att-doc-${Date.now()}`,
              type: 'document',
              url,
              fileName: file.name,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            };
            sendMessage(currentConvId, `Shared document ${file.name}`, undefined, [docAtt]);
            addToast({ type: 'success', title: 'Document sent' });
          }
        }}
        accept=".pdf,.doc,.docx,.txt,.zip"
        className="hidden"
      />

      {/* ----------------- SIDEBAR CONVERSATIONS LIST ----------------- */}
      {showList && (
        <div
          className={cn(
            'flex flex-col h-full border-r border-zinc-200 dark:border-[#222d34] bg-white dark:bg-[#111b21] flex-shrink-0 z-20',
            isMobile ? 'w-full' : 'w-80 lg:w-96'
          )}
        >
          {/* List Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-[#202c33] border-b border-zinc-200 dark:border-[#222d34]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Chats
              </h1>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-[#111b21] transition-colors"
                title="New Chat"
              >
                <MessageSquarePlus className="w-5 h-5" />
              </button>
              <Dropdown
                trigger={
                  <button className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-[#111b21] transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                }
                items={[
                  {
                    id: '1',
                    label: 'Mark all as read',
                    icon: <CheckCheck className="w-4 h-4" />,
                    onClick: () => {
                      markAllAsRead();
                      addToast({ type: 'success', title: 'All chats marked as read' });
                    },
                  },
                  {
                    id: '2',
                    label: `Archived chats (${archivedCount})`,
                    icon: <Archive className="w-4 h-4" />,
                    onClick: () => setActiveFilter('archived'),
                  },
                  {
                    id: '3',
                    label: 'New Group (Mock)',
                    icon: <Users className="w-4 h-4" />,
                    onClick: () => addToast({ type: 'info', title: 'Group feature coming soon' }),
                  },
                ]}
              />
            </div>
          </div>

          {/* Search & Filter Badges */}
          <div className="p-3 space-y-2.5 border-b border-zinc-200 dark:border-[#222d34]">
            <SearchBar
              value={listSearch}
              onChange={setListSearch}
              placeholder="Search or start new chat"
            />
            <div className="flex items-center gap-1.5 pt-1 text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
                { id: 'pinned', label: 'Pinned' },
                { id: 'archived', label: `Archived ${archivedCount > 0 ? `(${archivedCount})` : ''}` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                  className={cn(
                    'px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap',
                    activeFilter === tab.id
                      ? 'bg-emerald-600/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold'
                      : 'bg-zinc-100 dark:bg-[#202c33] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#2a3942]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Items List */}
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {filteredConversations.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-10 h-10 text-emerald-500" />}
                title={listSearch ? 'No matching chats' : `No ${activeFilter} chats`}
                description={
                  listSearch
                    ? `No conversations found for "${listSearch}".`
                    : 'Start a new conversation to begin chatting.'
                }
                action={{ label: 'Start New Chat', onClick: () => setIsNewChatModalOpen(true) }}
              />
            ) : (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isSelected={conv.id === currentConvId}
                  onSelect={() => handleSelectConversation(conv.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------- MAIN INDIVIDUAL CHAT VIEW ----------------- */}
      {showChat && (
        currentConversation && targetUser ? (
          <div className="flex-1 flex flex-col h-full max-h-full max-w-full bg-zinc-50 dark:bg-[#0b141a] border-l border-zinc-200 dark:border-[#222d34] overflow-hidden relative">
            {/* Top Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-[#202c33] border-b border-zinc-200 dark:border-[#222d34] z-20">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={() => navigate('/')}
                    className="p-1.5 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#111b21]"
                    title="Back to chats"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <Avatar
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  size="md"
                  presence={isTyping ? 'online' : targetPresence?.status === 'online' ? 'online' : 'offline'}
                  showPresence
                  onClick={() => navigate('/profile')}
                />
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {targetUser.name}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    {isTyping ? (
                      <span className="text-emerald-500 dark:text-[#00a884] font-semibold animate-pulse flex items-center gap-1">
                        <span>{targetUser.name.split(' ')[0]} is typing</span>
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" />
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce delay-100" />
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce delay-200" />
                        </span>
                      </span>
                    ) : targetPresence?.status === 'online' ? (
                      <span className="text-emerald-600 dark:text-[#00a884] font-medium">online</span>
                    ) : (
                      <span>
                        {formatLastSeen(
                          targetPresence?.lastSeen && targetPresence.lastSeen !== 'offline'
                            ? targetPresence.lastSeen
                            : targetUser.lastSeen,
                          false
                        )}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Call & Action Controls */}
              <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                <button
                  onClick={() => handleCall('voice')}
                  className="p-2.5 rounded-full hover:bg-zinc-200/60 dark:hover:bg-[#111b21] transition-colors"
                  title="Voice Call"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleCall('video')}
                  className="p-2.5 rounded-full hover:bg-zinc-200/60 dark:hover:bg-[#111b21] transition-colors"
                  title="Video Call"
                >
                  <Video className="w-5 h-5" />
                </button>
                <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />
                <button
                  onClick={() => setIsSearchingInChat(!isSearchingInChat)}
                  className={cn(
                    'p-2.5 rounded-full transition-colors',
                    isSearchingInChat
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'hover:bg-zinc-200/60 dark:hover:bg-[#111b21]'
                  )}
                  title="Search Messages"
                >
                  <Search className="w-5 h-5" />
                </button>
                <Dropdown
                  trigger={
                    <button className="p-2.5 rounded-full hover:bg-zinc-200/60 dark:hover:bg-[#111b21] transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  }
                  items={[
                    { id: '1', label: 'Contact Info', onClick: () => navigate('/profile') },
                    { id: '2', label: 'Mute Notifications', icon: <VolumeX className="w-4 h-4" />, onClick: () => addToast({ type: 'info', title: 'Notifications muted' }) },
                    { id: '3', label: 'Clear Messages', icon: <Trash2 className="w-4 h-4" />, onClick: () => addToast({ type: 'warning', title: 'Messages cleared (mock)' }) },
                  ]}
                />
              </div>
            </div>

            {/* In-Chat Search Bar Drawer */}
            {isSearchingInChat && (
              <div className="px-4 py-2 bg-zinc-100 dark:bg-[#202c33] border-b border-zinc-200 dark:border-[#222d34] flex items-center gap-2 animate-in slide-in-from-top-2 duration-150 z-20">
                <SearchBar
                  value={chatSearchQuery}
                  onChange={setChatSearchQuery}
                  placeholder="Search in conversation..."
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchingInChat(false);
                    setChatSearchQuery('');
                  }}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Scrollable Message Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-bg-pattern">
              {/* Encryption Banner */}
              <div className="flex justify-center my-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 dark:bg-[#182229] border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 max-w-md text-center flex items-center justify-center gap-1.5 shadow-2xs">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.</span>
                </div>
              </div>

              {conversationMessages.map((msg, index) => {
                const isMe = msg.senderId === currentUser.id;

                const showDateHeader =
                  index === 0 || msg.date !== conversationMessages[index - 1].date;

                const replyMsg = msg.replyToMessageId
                  ? rawMessages.find((m) => m.id === msg.replyToMessageId)
                  : undefined;

                return (
                  <React.Fragment key={msg.id}>
                    {showDateHeader && msg.date && (
                      <div className="flex justify-center my-4">
                        <span className="px-3 py-1 rounded-full bg-white dark:bg-[#111b21] border border-zinc-200 dark:border-[#222d34] text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 shadow-2xs uppercase tracking-wider">
                          {msg.date}
                        </span>
                      </div>
                    )}

                    <MessageBubble
                      message={msg}
                      isMe={isMe}
                      senderName={isMe ? 'You' : targetUser.name}
                      replyMessage={replyMsg}
                      currentUserId={currentUser.id}
                      onReply={(m) => setReplyTarget(m)}
                      onForward={(m) => setForwardTargetMessage(m)}
                      onDelete={(id) => currentConvId && deleteMessage(currentConvId, id)}
                      onStar={(id) => currentConvId && toggleStarMessage(currentConvId, id)}
                      onReact={(id, emoji) => currentConvId && addReaction(currentConvId, id, emoji)}
                      onImageClick={handleOpenImageViewer}
                      onScrollToMessage={handleScrollToMessage}
                      isHighlighted={highlightedMessageId === msg.id}
                    />
                  </React.Fragment>
                );
              })}

              {/* Typing indicator bubble */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 py-1 animate-pulse">
                  <div className="px-4 py-2.5 rounded-2xl rounded-tl-xs bg-white dark:bg-[#202c33] border border-zinc-200 dark:border-transparent flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-100" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-200" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply Target Banner Overlay above Composer */}
            {replyTarget && (
              <div className="px-4 py-2.5 bg-zinc-200/90 dark:bg-[#111b21] border-t border-zinc-300 dark:border-[#222d34] flex items-center justify-between z-10 animate-in slide-in-from-bottom-2 duration-150">
                <div className="border-l-4 border-emerald-500 pl-3 text-xs min-w-0 flex-1">
                  <span className="font-semibold text-emerald-600 dark:text-[#00a884] block truncate">
                    Replying to {replyTarget.senderId === currentUser.id ? 'yourself' : targetUser.name}
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-300 truncate max-w-md">
                    "{replyTarget.content}"
                  </p>
                </div>
                <button
                  onClick={() => setReplyTarget(null)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors ml-2"
                  title="Cancel reply"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="px-4 py-2 bg-white dark:bg-[#202c33] border-t border-zinc-200 dark:border-[#222d34] flex items-center gap-2 overflow-x-auto z-10 no-scrollbar">
                {['😀', '😂', '😍', '🔥', '👍', '🙏', '🎉', '❤️', '🙌', '🚀', '👏', '😢', '😮'].map(
                  (emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setMessageInput((prev) => prev + emoji)}
                      className="text-lg p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-transform hover:scale-125"
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>
            )}

            {/* Attachment Menu Popover */}
            <AttachmentMenu
              isOpen={isAttachmentMenuOpen}
              onClose={() => setIsAttachmentMenuOpen(false)}
              onSelectOption={handleSelectAttachmentOption}
            />

            {/* Bottom Message Composer / Voice Recorder */}
            {isRecordingVoice ? (
              <VoiceRecorder
                onSendVoiceNote={handleSendRecordedVoiceNote}
                onCancel={() => setIsRecordingVoice(false)}
              />
            ) : (
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 p-2.5 sm:p-3 bg-zinc-100 dark:bg-[#202c33] border-t border-zinc-200 dark:border-[#222d34] z-20 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
              >
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={cn(
                    'p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-[#111b21] transition-colors',
                    showEmojiPicker && 'text-emerald-500 dark:text-emerald-400'
                  )}
                  title="Emojis"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                  className={cn(
                    'p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-[#111b21] transition-colors',
                    isAttachmentMenuOpen && 'text-emerald-500 dark:text-emerald-400'
                  )}
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-[#2a3942] text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-transparent transition-all"
                />

                {messageInput.trim() ? (
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00a884] dark:hover:bg-[#008f6f] text-white shadow-xs transition-transform active:scale-95"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsRecordingVoice(true)}
                    className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/30 transition-transform active:scale-95"
                    title="Record voice note"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </form>
            )}
          </div>
        ) : (
          <ChatPlaceholder onNewChat={() => setIsNewChatModalOpen(true)} />
        )
      )}

      {/* ----------------- MODALS ----------------- */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="New Chat"
        description="Select a contact to begin chatting"
      >
        <div className="space-y-4">
          <SearchBar
            value={newChatSearch}
            onChange={setNewChatSearch}
            placeholder="Search by name, email, or phone..."
            autoFocus
          />

          <div className="space-y-1 max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-[#222d34]">
            {isSearchingUsers ? (
              <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                Searching registered users...
              </div>
            ) : newChatSearch.trim().length >= 2 && searchResults.length === 0 ? (
              <div className="py-8 text-center px-4">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No users found</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Try searching by:</p>
                <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 space-y-0.5">
                  <p>• Full or partial Name</p>
                  <p>• Email address (e.g. rahul@gmail.com)</p>
                  <p>• Phone number</p>
                </div>
              </div>
            ) : (
              (newChatSearch.trim().length >= 2 ? searchResults : availableContacts).map((u: any) => {
                const uId = u.id || u._id;
                const avatarUrl = u.profilePicture || u.avatar || '';
                const presence = u.isOnline ? 'online' : u.presence || 'offline';
                return (
                  <div
                    key={uId}
                    onClick={() => handleStartNewChat(uId)}
                    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#202c33] cursor-pointer transition-colors"
                  >
                    <Avatar src={avatarUrl} alt={u.name} size="md" presence={presence} showPresence />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{u.name}</h4>
                        {u.email && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate shrink-0">
                            {u.email}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{u.about || u.bio || u.email}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Pre-Send Media Preview Modal */}
      <MediaPreview
        isOpen={isMediaPreviewOpen}
        file={selectedFile}
        mediaUrl={previewMediaUrl}
        mediaType={previewMediaType}
        onClose={() => {
          setIsMediaPreviewOpen(false);
          setPreviewMediaUrl(null);
          setSelectedFile(null);
        }}
        onSend={handleSendMediaPreview}
      />

      {/* Full Screen Image Gallery Viewer */}
      <ImageViewer
        isOpen={isImageViewerOpen}
        images={imageGalleryList}
        initialIndex={viewerInitialIndex}
        onClose={() => setIsImageViewerOpen(false)}
        onForward={(imgId) => {
          const targetMsg = rawMessages.find((m) => m.id === imgId);
          if (targetMsg) setForwardTargetMessage(targetMsg);
        }}
        onDelete={(imgId) => {
          if (currentConvId) deleteMessage(currentConvId, imgId);
        }}
      />

      <ForwardModal
        isOpen={!!forwardTargetMessage}
        message={forwardTargetMessage}
        onClose={() => setForwardTargetMessage(null)}
      />
    </div>
  );
};
