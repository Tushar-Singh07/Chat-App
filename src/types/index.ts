export type PresenceStatus = 'online' | 'offline' | 'typing';

export interface UserPresence {
  status: PresenceStatus;
  lastSeen?: string;
}

export type Presence = 'online' | 'offline' | 'away' | 'busy' | 'typing';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  phone: string;
  presence: Presence;
  lastSeen?: string;
  customStatus?: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'location';
  url: string;
  fileName?: string;
  fileSize?: string;
  duration?: string;
  thumbnailUrl?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'read';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  date?: string;
  status: MessageStatus;
  reactions?: Reaction[];
  replyToMessageId?: string;
  attachments?: MediaAttachment[];
  isStarred?: boolean;
  isSystem?: boolean;
  callSummary?: {
    type: 'voice' | 'video';
    duration: string;
  };
}

export interface Conversation {
  id: string;
  participantIds: string[];
  unreadCount: number;
  lastMessage?: Message;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StatusViewer {
  userId: string;
  viewedAt: string;
}

export type StatusMediaType = 'image' | 'video' | 'text';
export type StatusFontStyle = 'sans' | 'serif' | 'mono' | 'handwriting' | 'display';

export interface Status {
  id: string;
  userId: string;
  mediaUrl?: string;
  mediaType: StatusMediaType;
  caption?: string;
  text?: string;
  bgColor?: string;
  fontStyle?: StatusFontStyle;
  createdAt: string;
  expiresAt: string;
  viewers: StatusViewer[];
}

export type CallType = 'voice' | 'video';
export type CallStatus = 'missed' | 'incoming' | 'outgoing' | 'ended' | 'rejected';

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: CallType;
  status: CallStatus;
  timestamp: string;
  duration?: string;
}

export type ActiveTab = 'chats' | 'status' | 'calls' | 'profile' | 'settings';
