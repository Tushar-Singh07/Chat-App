import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User, Conversation, Message, Status, Call, ActiveTab, MediaAttachment, UserPresence } from '../types';
import { useAuth, sanitizeAvatar } from './AuthContext';
import { useToast } from './ToastContext';
import { userService } from '../services/userService';
import { chatService } from '../services/chatService';
import { socketService } from '../services/socketService';
import { WebRTCService } from '../services/webrtcService';
import { formatLastSeen } from '../utils/formatters';

export interface IncomingCallData {
  callId: string;
  callerId: string;
  receiverId: string;
  caller: User;
  type: 'voice' | 'video';
  offer: any;
  conversationId?: string;
}

export interface ActiveCallSession {
  callId: string | null;
  peerUser: User | null;
  type: 'voice' | 'video' | null;
  callState: 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'busy';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeakerOn: boolean;
  facingMode?: 'user' | 'environment';
  isMinimized?: boolean;
  seconds: number;
  conversationId?: string | null;
}

interface AppContextType {
  currentUser: User;
  users: User[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  statuses: Status[];
  calls: Call[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  typingUsers: Record<string, boolean>;

  // User Lookup
  getUserById: (id: string) => User;

  // Presence state & handlers
  userPresences: Record<string, UserPresence>;
  getUserPresence: (userId: string) => UserPresence;
  setUserPresence: (userId: string, presence: Partial<UserPresence>) => void;

  // Real WebRTC Call State & Handlers
  incomingCallData: IncomingCallData | null;
  activeCallSession: ActiveCallSession;
  startVoiceCall: (peerUser: User, conversationId?: string) => Promise<void>;
  startVideoCall: (peerUser: User, conversationId?: string) => Promise<void>;
  endVoiceCall: (durationSecs: number) => void;
  endVideoCall: (durationSecs: number) => void;
  activeCallUser: User | null;
  activeVideoCallUser: User | null;
  acceptIncomingCall: () => Promise<void>;
  rejectIncomingCall: () => Promise<void>;
  endCallSession: () => Promise<void>;
  toggleMuteCall: () => void;
  toggleCameraCall: () => void;
  toggleSpeakerCall: () => void;
  switchCameraCall: () => Promise<void>;
  minimizeCall: () => void;
  maximizeCall: () => void;

  // Conversation Handlers
  togglePinConversation: (id: string) => void;
  toggleMuteConversation: (id: string) => void;
  toggleArchiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearChat: (id: string) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  createConversation: (targetUserId: string) => Promise<string>;

  // Status Handlers
  addStatus: (newStatusData: Omit<Status, 'id' | 'userId' | 'createdAt' | 'expiresAt' | 'viewers'>) => Promise<void>;
  markStatusAsViewed: (statusId: string) => Promise<void>;

  // Message Handlers
  sendMessage: (
    conversationId: string,
    content: string,
    replyToMessageId?: string,
    attachments?: MediaAttachment[]
  ) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  editMessage: (conversationId: string, messageId: string, content: string) => Promise<void>;
  togglePinMessage: (conversationId: string, messageId: string) => Promise<void>;
  toggleStarMessage: (conversationId: string, messageId: string) => Promise<void>;
  addReaction: (conversationId: string, messageId: string, emoji: string) => Promise<void>;
  forwardMessage: (targetConversationId: string, message: Message) => Promise<void>;
  sendTypingSignal: (conversationId: string, isTyping: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser: authUser } = useAuth();
  const { addToast } = useToast();

  const currentUser: User = authUser || {
    id: '',
    name: 'Guest',
    email: '',
    avatar: '',
    bio: 'Hey there! I am using WhatsApp.',
    phone: '',
    presence: 'offline',
  };

  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chats');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string>(currentUser.id);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    currentUserIdRef.current = currentUser.id;
  }, [currentUser.id]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsapp_theme') as 'dark' | 'light';
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [userPresences, setUserPresences] = useState<Record<string, UserPresence>>({});

  // Incoming Call state
  const [incomingCallData, setIncomingCallData] = useState<IncomingCallData | null>(null);

  // Active WebRTC Call Session state
  const [activeCallSession, setActiveCallSession] = useState<ActiveCallSession>({
    callId: null,
    peerUser: null,
    type: null,
    callState: 'calling',
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isCameraOn: true,
    isSpeakerOn: true,
    facingMode: 'user',
    isMinimized: false,
    seconds: 0,
    conversationId: null,
  });

  const webrtcRef = useRef<WebRTCService | null>(null);
  const callTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const earlyIceCandidatesRef = useRef<{ callId?: string; candidate: RTCIceCandidateInit }[]>([]);
  const activeCallSessionRef = useRef<ActiveCallSession>(activeCallSession);
  useEffect(() => {
    activeCallSessionRef.current = activeCallSession;
  }, [activeCallSession]);

  const incomingCallDataRef = useRef<IncomingCallData | null>(incomingCallData);
  useEffect(() => {
    incomingCallDataRef.current = incomingCallData;
  }, [incomingCallData]);

  const loggedCallEventsRef = useRef<Set<string>>(new Set());

  // Theme Sync across HTML root, colorScheme, and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('whatsapp_theme', theme);
    } catch (e) {
      // Ignore storage errors in restricted iframes
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Helper to map backend conversation object to frontend structure
  const normalizeConversation = useCallback(
    (rawConv: any): Conversation => {
      const isPinned = rawConv.pinnedBy?.includes(currentUser.id) || false;
      const isMuted = rawConv.mutedBy?.includes(currentUser.id) || false;
      const isArchived = rawConv.archivedBy?.includes(currentUser.id) || false;

      const participantObjs = (rawConv.participants || []).map((p: any) => ({
        id: p.id || p._id || p,
        name: p.name || 'User',
        email: p.email || '',
        avatar: sanitizeAvatar(p.profilePicture || p.avatar),
        bio: p.about || 'Hey there! I am using WhatsApp.',
        phone: p.phone || '',
        presence: (p.isOnline ? 'online' : 'offline') as any,
        lastSeen: p.lastSeen,
      }));

      setUsers((prev) => {
        let updated = [...prev];
        let changed = false;
        participantObjs.forEach((po: any) => {
          if (po.id === currentUser.id) return;
          const idx = updated.findIndex((u) => u.id === po.id);
          if (idx >= 0) {
            if (po.lastSeen && !updated[idx].lastSeen) {
              updated[idx] = { ...updated[idx], lastSeen: po.lastSeen };
              changed = true;
            }
          } else {
            updated.push(po);
            changed = true;
          }
        });
        return changed ? updated : prev;
      });

      const participantIds = participantObjs.map((p: any) => p.id);

      let lastMsg: Message | undefined = undefined;
      if (rawConv.lastMessage) {
        const m = rawConv.lastMessage;
        const sId = m.senderId?.id || m.senderId?._id || m.senderId || '';
        lastMsg = {
          id: m.id || m._id,
          conversationId: rawConv.id || rawConv._id,
          senderId: sId,
          content: m.content || '',
          timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          status: m.status || 'sent',
          attachments: m.attachments,
          callSummary: m.callSummary,
        };
      }

      return {
        id: rawConv.id || rawConv._id,
        participantIds,
        unreadCount: rawConv.unreadCounts?.[currentUser.id] || 0,
        isPinned,
        isMuted,
        isArchived,
        createdAt: rawConv.createdAt,
        updatedAt: rawConv.updatedAt,
        lastMessage: lastMsg,
      };
    },
    [currentUser.id]
  );

  // Helper to map backend message object to frontend structure
  const normalizeMessage = (m: any): Message => {
    const sId = m.senderId?.id || m.senderId?._id || m.senderId || '';
    const dateObj = new Date(m.createdAt || Date.now());
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const isStarred = Boolean(
      m.isStarred ||
      (m.starredBy &&
        Array.isArray(m.starredBy) &&
        m.starredBy.some(
          (u: any) => (u?.id || u?._id || u)?.toString() === currentUser.id.toString()
        ))
    );

    return {
      id: m.id || m._id,
      conversationId: m.conversationId,
      senderId: sId,
      content: m.content || '',
      timestamp: timeStr,
      date: dateObj.toLocaleDateString(),
      status: m.status || 'sent',
      replyToMessageId: m.replyTo?.id || m.replyTo?._id || m.replyTo,
      attachments: m.attachments,
      isStarred,
      isPinned: Boolean(m.isPinned),
      isEdited: Boolean(m.isEdited),
      editedAt: m.editedAt,
      reactions: (m.reactions || []).map((r: any) => ({
        id: r.id || r._id || `${r.userId}-${r.emoji}`,
        userId: r.userId?.id || r.userId?._id || r.userId,
        userName: r.userId?.name || 'User',
        emoji: r.emoji,
        timestamp: 'Just now',
      })),
      callSummary: m.callSummary,
    };
  };

  // User Lookup
  const getUserById = useCallback(
    (id: string): User => {
      if (!id || id === currentUser.id) return currentUser;
      const found = users.find((u) => u.id === id);
      if (found) return found;
      return {
        id,
        name: 'User',
        email: '',
        avatar: '',
        bio: 'WhatsApp user',
        phone: '',
        presence: 'offline',
      };
    },
    [currentUser, users]
  );

  const createConversation = useCallback(
    async (targetUserId: string): Promise<string> => {
      const res = await chatService.createConversation(targetUserId);
      if (res.success && res.data) {
        const norm = normalizeConversation(res.data);
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === norm.id);
          return exists ? prev : [norm, ...prev];
        });
        setActiveConversationId(norm.id);
        return norm.id;
      }
      return '';
    },
    [normalizeConversation]
  );

  const ensureConversation = useCallback(
    async (peerUserId: string): Promise<string> => {
      if (!peerUserId) return '';
      const existing = conversations.find(
        (c) => c.participantIds.includes(peerUserId) && c.participantIds.includes(currentUser.id)
      );
      if (existing) return existing.id;
      return await createConversation(peerUserId);
    },
    [conversations, currentUser.id, createConversation]
  );

  const sendCallMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      callSummary: {
        type: 'voice' | 'video';
        duration: string;
        status: 'started' | 'ended' | 'missed' | 'rejected' | 'declined';
        callId: string;
      }
    ) => {
      if (!conversationId || !callSummary?.callId) return;

      const eventKey = `${callSummary.callId}_${callSummary.status}`;
      if (loggedCallEventsRef.current.has(eventKey)) {
        return;
      }
      loggedCallEventsRef.current.add(eventKey);

      try {
        const res = await chatService.sendMessage({
          conversationId,
          content,
          callSummary,
        });

        if (res.success && res.data) {
          const norm = normalizeMessage(res.data);
          setMessages((prev) => {
            const currentList = prev[conversationId] || [];
            if (currentList.some((m) => m.id === norm.id)) {
              return prev;
            }
            return {
              ...prev,
              [conversationId]: [...currentList, norm],
            };
          });

          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId
                ? { ...c, lastMessage: norm, updatedAt: new Date().toISOString() }
                : c
            )
          );
        }
      } catch (err) {
        console.error('[CALL] Failed to send call message:', err);
      }
    },
    [normalizeMessage]
  );

  // Cleanup active WebRTC Call Session
  const cleanupCallSession = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    if (webrtcRef.current) {
      webrtcRef.current.close();
      webrtcRef.current = null;
    }
    earlyIceCandidatesRef.current = [];
    setActiveCallSession({
      callId: null,
      peerUser: null,
      type: null,
      callState: 'calling',
      localStream: null,
      remoteStream: null,
      isMuted: false,
      isCameraOn: true,
      isSpeakerOn: true,
      facingMode: 'user',
      isMinimized: false,
      seconds: 0,
      conversationId: null,
    });
  }, []);

  // Connected Call Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (activeCallSession.callId && activeCallSession.callState === 'connected') {
      timer = setInterval(() => {
        setActiveCallSession((prev) => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCallSession.callId, activeCallSession.callState]);

  // Reload Call Logs from Backend
  const reloadCallLogs = useCallback(async () => {
    const res = await chatService.getCalls();
    if (res.success && res.data) {
      const normCalls: Call[] = res.data.map((c: any) => ({
        id: c.id || c._id,
        callerId: c.callerId?.id || c.callerId?._id || c.callerId,
        receiverId: c.receiverId?.id || c.receiverId?._id || c.receiverId,
        type: c.type,
        status: c.status,
        timestamp: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: c.duration || '00:00',
      }));
      setCalls(normCalls);
    }
  }, []);

  // Socket Connection & Call Event Handlers Setup
  useEffect(() => {
    if (!authUser?.id) return;

    socketService.connect(authUser.id);

    // Fetch registered users
    userService.getAllUsers().then((res) => {
      if (res.success && res.data) {
        const mappedUsers: User[] = res.data.map((u: any) => ({
          id: u.id || u._id,
          name: u.name,
          email: u.email || '',
          avatar: sanitizeAvatar(u.profilePicture || u.avatar),
          bio: u.about || 'Hey there! I am using WhatsApp.',
          phone: u.phone || '',
          presence: u.isOnline ? 'online' : 'offline',
          lastSeen: u.lastSeen,
        }));
        setUsers(mappedUsers);
      }
    });

    // Fetch conversations
    chatService.getConversations().then((res) => {
      if (res.success && res.data) {
        const normConvs = res.data.map(normalizeConversation);
        setConversations(normConvs);
        if (normConvs.length > 0 && !activeConversationId) {
          setActiveConversationId(normConvs[0].id);
        }
      }
    });

    // Fetch statuses
    chatService.getStatuses().then((res) => {
      if (res.success && res.data) {
        const normStatuses: Status[] = res.data.map((s: any) => ({
          id: s.id || s._id,
          userId: s.userId?.id || s.userId?._id || s.userId,
          mediaType: s.type || 'text',
          text: s.type === 'text' ? s.content : undefined,
          mediaUrl: s.type !== 'text' ? s.content : undefined,
          bgColor: s.bgColor || 'from-emerald-600 to-teal-800',
          caption: s.caption || '',
          createdAt: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          expiresAt: new Date(s.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          viewers: (s.viewers || []).map((v: any) => ({
            userId: v.id || v._id || v,
            viewedAt: 'Recently',
          })),
        }));
        setStatuses(normStatuses);
      }
    });

    // Fetch calls
    reloadCallLogs();

    socketService.onReceiveMessage((incomingMsg) => {
      const norm = normalizeMessage(incomingMsg);
      const isCurrentChatOpen = activeConversationIdRef.current === norm.conversationId;

      if (norm.callSummary?.callId && norm.callSummary?.status) {
        loggedCallEventsRef.current.add(`${norm.callSummary.callId}_${norm.callSummary.status}`);
      }

      // When a new message arrives from the partner in this conversation, end typing immediately
      setTypingUsers((prev) => {
        if (!prev[norm.conversationId]) return prev;
        return { ...prev, [norm.conversationId]: false };
      });
      const senderIdStr = String(norm.senderId);
      if (senderIdStr) {
        setUserPresences((prev) => {
          const cur = prev[senderIdStr];
          if (cur?.status === 'typing') {
            return {
              ...prev,
              [senderIdStr]: {
                ...cur,
                status: 'online',
              },
            };
          }
          return prev;
        });
      }

      setMessages((prev) => {
        const currentList = prev[norm.conversationId] || [];
        if (currentList.some((m) => m.id === norm.id)) {
          return {
            ...prev,
            [norm.conversationId]: currentList.map((m) => (m.id === norm.id ? { ...m, ...norm } : m)),
          };
        }
        return {
          ...prev,
          [norm.conversationId]: [...currentList, norm],
        };
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === norm.conversationId
            ? {
                ...c,
                lastMessage: norm,
                updatedAt: new Date().toISOString(),
                unreadCount: isCurrentChatOpen ? 0 : (c.unreadCount || 0) + 1,
              }
            : c
        )
      );

      // If receiver currently has this conversation open, acknowledge as read immediately (turn blue ticks)
      if (isCurrentChatOpen) {
        socketService.markRead(norm.conversationId);
        chatService.markMessagesAsRead(norm.conversationId).catch(() => {});
      }
    });

    // Real-Time Delivery Receipt Listener (Turn 1 tick into 2 ticks)
    socketService.onMessagesDelivered((data) => {
      if (!data?.messages || data.messages.length === 0) return;
      const deliveredIds = new Set(data.messages.map((m) => m.messageId));

      setMessages((prev) => {
        const updated = { ...prev };
        for (const item of data.messages) {
          if (updated[item.conversationId]) {
            updated[item.conversationId] = updated[item.conversationId].map((m) =>
              deliveredIds.has(m.id) && m.status === 'sent' ? { ...m, status: 'delivered' } : m
            );
          }
        }
        return updated;
      });

      setConversations((prev) =>
        prev.map((c) => {
          const match = data.messages.find((m) => m.conversationId === c.id);
          if (match && c.lastMessage && deliveredIds.has(c.lastMessage.id) && c.lastMessage.status === 'sent') {
            return {
              ...c,
              lastMessage: { ...c.lastMessage, status: 'delivered' },
            };
          }
          return c;
        })
      );
    });

    // Real-Time Read Receipt Listener (Turn 2 gray ticks into 2 blue ticks)
    socketService.onMessagesRead((data) => {
      if (!data?.conversationId) return;

      const targetConvId = String(data.conversationId);
      const readerId = data.readerId ? String(data.readerId) : '';
      const myId = String(currentUserIdRef.current);

      setMessages((prev) => {
        if (!prev[targetConvId]) return prev;
        return {
          ...prev,
          [targetConvId]: prev[targetConvId].map((m) => {
            const senderIdStr = String(m.senderId);
            const shouldMarkRead = senderIdStr === myId || (readerId && senderIdStr !== readerId);
            if (shouldMarkRead && m.status !== 'read') {
              return { ...m, status: 'read' };
            }
            return m;
          }),
        };
      });

      setConversations((prev) =>
        prev.map((c) => {
          if (String(c.id) === targetConvId && c.lastMessage) {
            const senderIdStr = String(c.lastMessage.senderId);
            const shouldMarkRead = senderIdStr === myId || (readerId && senderIdStr !== readerId);
            if (shouldMarkRead) {
              return {
                ...c,
                lastMessage: { ...c.lastMessage, status: 'read' },
              };
            }
          }
          return c;
        })
      );
    });

    // Real-Time Chat Cleared Listener
    socketService.onChatCleared(({ conversationId }) => {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, lastMessage: undefined, unreadCount: 0 } : c
        )
      );
    });

    // Real-Time Message Deleted Listener
    socketService.onMessageDeleted(({ messageId, conversationId }) => {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter((m) => m.id !== messageId),
      }));
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId && c.lastMessage?.id === messageId) {
            const remaining = (messages[conversationId] || []).filter((m) => m.id !== messageId);
            const latest = remaining[remaining.length - 1];
            return { ...c, lastMessage: latest };
          }
          return c;
        })
      );
    });

    // Real-Time Message Edited Listener
    socketService.onMessageEdited((updatedMsg) => {
      const norm = normalizeMessage(updatedMsg);
      setMessages((prev) => ({
        ...prev,
        [norm.conversationId]: (prev[norm.conversationId] || []).map((m) =>
          m.id === norm.id ? norm : m
        ),
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === norm.conversationId && c.lastMessage?.id === norm.id
            ? { ...c, lastMessage: norm }
            : c
        )
      );
    });

    // Real-Time Message Pinned Listener
    socketService.onMessagePinned(({ messageId, conversationId, isPinned }) => {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          m.id === messageId ? { ...m, isPinned } : m
        ),
      }));
    });

    const typingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

    socketService.onUserTyping(({ conversationId, userId }) => {
      if (userId && userId === authUser?.id) return;
      setTypingUsers((prev) => ({ ...prev, [conversationId]: true }));

      if (userId) {
        setUserPresences((prev) => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            status: 'typing',
          },
        }));
      }

      const existingTimer = typingTimeouts.get(conversationId);
      if (existingTimer) clearTimeout(existingTimer);

      // Fallback timer: if peer unexpectedly disconnects without emitting stop_typing, reset after 3.5s
      const timer = setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [conversationId]: false }));
        if (userId) {
          setUserPresences((prev) => {
            const cur = prev[userId];
            if (cur?.status === 'typing') {
              return {
                ...prev,
                [userId]: {
                  ...cur,
                  status: 'online',
                },
              };
            }
            return prev;
          });
        }
        typingTimeouts.delete(conversationId);
      }, 3500);
      typingTimeouts.set(conversationId, timer);
    });

    socketService.onUserStopTyping(({ conversationId, userId }) => {
      if (userId && userId === authUser?.id) return;
      if (conversationId) {
        const existingTimer = typingTimeouts.get(conversationId);
        if (existingTimer) {
          clearTimeout(existingTimer);
          typingTimeouts.delete(conversationId);
        }
        setTypingUsers((prev) => ({ ...prev, [conversationId]: false }));
      } else {
        setTypingUsers({});
      }

      if (userId) {
        setUserPresences((prev) => {
          const cur = prev[userId];
          if (cur?.status === 'typing') {
            return {
              ...prev,
              [userId]: {
                ...cur,
                status: 'online',
              },
            };
          }
          return prev;
        });
      }
    });

    socketService.onPresenceChange(({ userId, isOnline, lastSeen }) => {
      const formatted = formatLastSeen(lastSeen, isOnline);
      setUserPresences((prev) => ({
        ...prev,
        [userId]: {
          status: isOnline ? 'online' : 'offline',
          lastSeen: formatted,
        },
      }));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, presence: isOnline ? 'online' : 'offline', lastSeen: formatted }
            : u
        )
      );
    });

    // ==========================================
    // Real-Time WebRTC Call Signaling Listeners
    // ==========================================

    // 1. Incoming Call
    socketService.onIncomingCall((data: IncomingCallData) => {
      console.log('[CALL] Incoming call received:', data);
      // Normalize caller object if missing avatar/name
      const callerObj: User = {
        id: data.caller?.id || data.callerId,
        name: data.caller?.name || 'Unknown User',
        email: data.caller?.email || '',
        avatar: sanitizeAvatar(data.caller?.avatar || (data.caller as any)?.profilePicture),
        bio: data.caller?.bio || 'Hey there!',
        phone: data.caller?.phone || '',
        presence: 'online',
      };
      setIncomingCallData({
        ...data,
        caller: callerObj,
        conversationId: data.conversationId,
      });
    });

    // 2. Call Ringing
    socketService.onCallRinging(({ callId }) => {
      console.log('[CALL] Receiver is ringing:', callId);
      setActiveCallSession((prev) => (prev.callId === callId ? { ...prev, callState: 'ringing' } : prev));
    });

    // 3. Call Accepted by Receiver
    socketService.onCallAccepted(async ({ callId, answer }) => {
      console.log('[CALL] Call accepted by receiver:', callId);
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      try {
        if (webrtcRef.current) {
          await webrtcRef.current.handleAnswer(answer);
          if (earlyIceCandidatesRef.current.length > 0) {
            console.log(`[CALL] Draining ${earlyIceCandidatesRef.current.length} early ICE candidates on caller`);
            for (const item of earlyIceCandidatesRef.current) {
              await webrtcRef.current.addIceCandidate(item.candidate);
            }
            earlyIceCandidatesRef.current = [];
          }
        }
        setActiveCallSession((prev) => (prev.callId === callId ? { ...prev, callState: 'connected' } : prev));
        addToast({ type: 'success', title: 'Call Connected' });
      } catch (err: any) {
        console.error('[CALL] Error handling answer:', err);
        addToast({ type: 'error', title: 'Connection Failed', description: err.message });
        cleanupCallSession();
      }
    });

    // 4. Call Rejected
    socketService.onCallRejected(async ({ callId }) => {
      console.log('[CALL] Call rejected:', callId);
      const session = activeCallSessionRef.current;
      setActiveCallSession((prev) => (prev.callId === callId ? { ...prev, callState: 'rejected' } : prev));
      addToast({ type: 'info', title: 'Call Declined' });

      if (session && session.callId === callId && session.conversationId) {
        await sendCallMessage(
          session.conversationId,
          `Missed ${session.type === 'video' ? 'video' : 'voice'} call (Declined)`,
          {
            type: session.type || 'voice',
            duration: '00:00',
            status: 'ended',
            callId,
          }
        );
      }

      setTimeout(() => {
        cleanupCallSession();
      }, 1200);
    });

    // 5. Call Cancelled by Caller
    socketService.onCallCancelled(async ({ callId, conversationId }) => {
      console.log('[CALL] Call cancelled by caller:', callId);
      const incoming = incomingCallDataRef.current;
      setIncomingCallData((prev) => (prev?.callId === callId ? null : prev));
      addToast({ type: 'info', title: 'Missed Call', description: 'Caller ended the call request' });

      let convId = incoming?.conversationId || conversationId;
      if (!convId && incoming) {
        const existing = conversations.find(
          (c) =>
            c.participantIds.includes(incoming.callerId) &&
            c.participantIds.includes(currentUser.id)
        );
        convId = existing?.id;
      }

      if (convId && incoming) {
        await sendCallMessage(
          convId,
          `Missed ${incoming.type === 'video' ? 'video' : 'voice'} call`,
          {
            type: incoming.type,
            duration: '00:00',
            status: 'ended',
            callId,
          }
        );
      }
    });

    // 6. Call Ended by Peer or Server Disconnect
    socketService.onCallEnded(async ({ callId, conversationId, reason }) => {
      console.log('[CALL] Call ended by peer/server:', callId, reason);
      const session = activeCallSessionRef.current;
      setActiveCallSession((prev) => (prev.callId === callId ? { ...prev, callState: 'ended' } : prev));
      addToast({ type: 'info', title: 'Call Ended', description: reason || 'Call has ended' });

      if (session && session.callId === callId && session.peerUser) {
        const mins = Math.floor(session.seconds / 60);
        const secs = session.seconds % 60;
        const durationStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        let convId = session.conversationId || conversationId;
        if (!convId) {
          const existing = conversations.find(
            (c) =>
              c.participantIds.includes(session.peerUser!.id) &&
              c.participantIds.includes(currentUser.id)
          );
          convId = existing?.id;
        }

        if (convId) {
          const content = session.seconds > 0
            ? `${session.type === 'video' ? 'Video' : 'Voice'} call ended (${durationStr})`
            : `Missed ${session.type === 'video' ? 'video' : 'voice'} call`;

          await sendCallMessage(
            convId,
            content,
            {
              type: session.type || 'voice',
              duration: durationStr,
              status: 'ended',
              callId,
            }
          );
        }
      }

      setTimeout(() => {
        cleanupCallSession();
      }, 1000);
    });

    // 7. Call Busy
    socketService.onCallBusy(async ({ callId, conversationId }) => {
      console.log('[CALL] User is busy:', callId);
      const session = activeCallSessionRef.current;
      setActiveCallSession((prev) => (prev.callId === callId ? { ...prev, callState: 'busy' } : prev));
      addToast({ type: 'warning', title: 'User is Busy', description: 'The user is currently in another call' });

      let convId = session?.conversationId || conversationId;
      if (!convId && session?.peerUser) {
        const existing = conversations.find(
          (c) =>
            c.participantIds.includes(session.peerUser!.id) &&
            c.participantIds.includes(currentUser.id)
        );
        convId = existing?.id;
      }

      if (convId && session) {
        await sendCallMessage(
          convId,
          `Missed ${session.type === 'video' ? 'video' : 'voice'} call (User busy)`,
          {
            type: session.type || 'voice',
            duration: '00:00',
            status: 'ended',
            callId,
          }
        );
      }

      setTimeout(() => {
        cleanupCallSession();
      }, 1500);
    });

    // 8. User Unavailable
    socketService.onCallUnavailable(async ({ callId, conversationId, reason }) => {
      console.log('[CALL] User unavailable:', callId);
      const session = activeCallSessionRef.current;
      addToast({ type: 'warning', title: 'Unavailable', description: reason || 'User is currently offline' });

      let convId = session?.conversationId || conversationId;
      if (!convId && session?.peerUser) {
        const existing = conversations.find(
          (c) =>
            c.participantIds.includes(session.peerUser!.id) &&
            c.participantIds.includes(currentUser.id)
        );
        convId = existing?.id;
      }

      if (convId && session) {
        await sendCallMessage(
          convId,
          `Missed ${session.type === 'video' ? 'video' : 'voice'} call (User offline)`,
          {
            type: session.type || 'voice',
            duration: '00:00',
            status: 'ended',
            callId,
          }
        );
      }

      cleanupCallSession();
    });

    // 9. ICE Candidates
    socketService.onIceCandidate(({ callId, candidate }) => {
      console.log('[CALL] Received ICE candidate:', candidate);
      if (webrtcRef.current && webrtcRef.current.hasPeerConnection()) {
        webrtcRef.current.addIceCandidate(candidate);
      } else {
        console.log('[CALL] WebRTC not ready yet, queuing early candidate');
        earlyIceCandidatesRef.current.push({ callId, candidate });
      }
    });

    return () => {
      socketService.offReceiveMessage();
      socketService.offMessagesDelivered();
      socketService.offMessagesRead();
      socketService.offChatCleared();
      socketService.offMessageDeleted();
      socketService.offMessageEdited();
      socketService.offMessagePinned();
      socketService.offCallEvents();
      socketService.disconnect();
    };
  }, [authUser?.id, normalizeConversation, reloadCallLogs, cleanupCallSession, addToast]);

  // Fetch messages and mark as read when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    socketService.joinConversation(activeConversationId);
    socketService.markRead(activeConversationId);
    chatService.markMessagesAsRead(activeConversationId).catch(() => {});

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
    );

    chatService.getMessages(activeConversationId).then((res) => {
      if (res.success && res.data) {
        const normMsgs = res.data.map(normalizeMessage);
        setMessages((prev) => ({
          ...prev,
          [activeConversationId]: normMsgs,
        }));
      }
    });

    return () => {
      socketService.leaveConversation(activeConversationId);
    };
  }, [activeConversationId]);

  const getUserPresence = useCallback(
    (userId: string): UserPresence => {
      if (userPresences[userId]) return userPresences[userId];
      const u = users.find((x) => x.id === userId);
      if (u) {
        const isOnline = u.presence === 'online';
        return {
          status: isOnline ? 'online' : 'offline',
          lastSeen: formatLastSeen(u.lastSeen, isOnline),
        };
      }
      return { status: 'offline', lastSeen: 'offline' };
    },
    [userPresences, users]
  );

  const setUserPresence = useCallback((userId: string, presence: Partial<UserPresence>) => {
    setUserPresences((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { status: 'offline' }),
        ...presence,
      },
    }));
  }, []);

  const sendTypingSignal = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (isTyping) {
        socketService.sendTyping(conversationId, currentUser.id);
      } else {
        socketService.sendStopTyping(conversationId, currentUser.id);
      }
    },
    [currentUser.id]
  );

  // ==========================================
  // REAL WEBRTC CALL ACTIONS
  // ==========================================

  // Initiate Voice Call
  const startVoiceCall = useCallback(
    async (peerUser: User, conversationId?: string) => {
      if (!peerUser || !currentUser.id) return;
      if (activeCallSession.callId) {
        addToast({ type: 'warning', title: 'Call in Progress', description: 'You are already in a call.' });
        return;
      }

      let targetConvId = conversationId;
      if (!targetConvId) {
        targetConvId = (await ensureConversation(peerUser.id)) || undefined;
      }

      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      console.log(`[CALL] Starting voice call to ${peerUser.name} (${peerUser.id}), convId: ${targetConvId}`);

      try {
        const webrtc = new WebRTCService();
        webrtcRef.current = webrtc;

        const localStream = await webrtc.getMediaStream(false);

        webrtc.createPeerConnection(
          (remoteStream) => {
            console.log('[CALL] Remote stream received in voice call');
            setActiveCallSession((prev) => ({ ...prev, remoteStream }));
          },
          (candidate) => {
            socketService.sendIceCandidate({ callId, to: peerUser.id, candidate });
          }
        );

        const offer = await webrtc.createOffer();

        // 1. Send Message 1: Voice Call Started to conversation inbox
        if (targetConvId) {
          sendCallMessage(targetConvId, 'Voice call started', {
            type: 'voice',
            duration: '00:00',
            status: 'started',
            callId,
          });
        }

        socketService.initiateCall({
          callId,
          receiverId: peerUser.id,
          type: 'voice',
          offer,
          caller: currentUser,
          conversationId: targetConvId,
        });

        setActiveCallSession({
          callId,
          peerUser,
          type: 'voice',
          callState: 'calling',
          localStream,
          remoteStream: null,
          isMuted: false,
          isCameraOn: false,
          isSpeakerOn: true,
          seconds: 0,
          conversationId: targetConvId || null,
        });

        // 45s Call Timeout
        callTimeoutRef.current = setTimeout(() => {
          console.log('[CALL] Voice call timed out');
          socketService.cancelCall({ callId, to: peerUser.id, conversationId: targetConvId });
          chatService.logCall({
            receiverId: peerUser.id,
            type: 'voice',
            status: 'missed',
            duration: '00:00',
          });
          reloadCallLogs();
          if (targetConvId) {
            sendCallMessage(targetConvId, 'Missed voice call', {
              type: 'voice',
              duration: '00:00',
              status: 'ended',
              callId,
            });
          }
          addToast({ type: 'info', title: 'No Answer', description: `${peerUser.name} did not answer.` });
          cleanupCallSession();
        }, 45000);
      } catch (err: any) {
        console.error('[CALL] Start voice call error:', err);
        addToast({ type: 'error', title: 'Call Error', description: err.message });
        cleanupCallSession();
      }
    },
    [currentUser, activeCallSession.callId, addToast, reloadCallLogs, cleanupCallSession, ensureConversation, sendCallMessage]
  );

  // Initiate Video Call
  const startVideoCall = useCallback(
    async (peerUser: User, conversationId?: string) => {
      if (!peerUser || !currentUser.id) return;
      if (activeCallSession.callId) {
        addToast({ type: 'warning', title: 'Call in Progress', description: 'You are already in a call.' });
        return;
      }

      let targetConvId = conversationId;
      if (!targetConvId) {
        targetConvId = (await ensureConversation(peerUser.id)) || undefined;
      }

      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      console.log(`[CALL] Starting video call to ${peerUser.name} (${peerUser.id}), convId: ${targetConvId}`);

      try {
        const webrtc = new WebRTCService();
        webrtcRef.current = webrtc;

        const localStream = await webrtc.getMediaStream(true);

        webrtc.createPeerConnection(
          (remoteStream) => {
            console.log('[CALL] Remote stream received in video call');
            setActiveCallSession((prev) => ({ ...prev, remoteStream }));
          },
          (candidate) => {
            socketService.sendIceCandidate({ callId, to: peerUser.id, candidate });
          }
        );

        const offer = await webrtc.createOffer();

        // 1. Send Message 1: Video Call Started to conversation inbox
        if (targetConvId) {
          sendCallMessage(targetConvId, 'Video call started', {
            type: 'video',
            duration: '00:00',
            status: 'started',
            callId,
          });
        }

        socketService.initiateCall({
          callId,
          receiverId: peerUser.id,
          type: 'video',
          offer,
          caller: currentUser,
          conversationId: targetConvId,
        });

        setActiveCallSession({
          callId,
          peerUser,
          type: 'video',
          callState: 'calling',
          localStream,
          remoteStream: null,
          isMuted: false,
          isCameraOn: true,
          isSpeakerOn: true,
          facingMode: 'user',
          isMinimized: false,
          seconds: 0,
          conversationId: targetConvId || null,
        });

        // 45s Call Timeout
        callTimeoutRef.current = setTimeout(() => {
          console.log('[CALL] Video call timed out');
          socketService.cancelCall({ callId, to: peerUser.id, conversationId: targetConvId });
          chatService.logCall({
            receiverId: peerUser.id,
            type: 'video',
            status: 'missed',
            duration: '00:00',
          });
          reloadCallLogs();
          if (targetConvId) {
            sendCallMessage(targetConvId, 'Missed video call', {
              type: 'video',
              duration: '00:00',
              status: 'ended',
              callId,
            });
          }
          addToast({ type: 'info', title: 'No Answer', description: `${peerUser.name} did not answer.` });
          cleanupCallSession();
        }, 45000);
      } catch (err: any) {
        console.error('[CALL] Start video call error:', err);
        addToast({ type: 'error', title: 'Call Error', description: err.message });
        cleanupCallSession();
      }
    },
    [currentUser, activeCallSession.callId, addToast, reloadCallLogs, cleanupCallSession, ensureConversation, sendCallMessage]
  );

  // Accept Incoming Call
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCallData) return;

    const data = incomingCallData;
    setIncomingCallData(null);

    const callerUser: User = data.caller;
    console.log(`[CALL] Accepting incoming ${data.type} call from ${callerUser.name}`);

    let convId = data.conversationId;
    if (!convId) {
      convId = (await ensureConversation(callerUser.id)) || undefined;
    }

    try {
      const webrtc = new WebRTCService();
      webrtcRef.current = webrtc;

      const isVideo = data.type === 'video';
      const localStream = await webrtc.getMediaStream(isVideo);

      webrtc.createPeerConnection(
        (remoteStream) => {
          console.log('[CALL] Remote stream received after answer');
          setActiveCallSession((prev) => ({ ...prev, remoteStream }));
        },
        (candidate) => {
          socketService.sendIceCandidate({ callId: data.callId, to: data.callerId, candidate });
        }
      );

      const answer = await webrtc.handleOfferAndCreateAnswer(data.offer);

      // Drain any candidates that arrived while receiver was ringing
      if (earlyIceCandidatesRef.current.length > 0) {
        console.log(`[CALL] Draining ${earlyIceCandidatesRef.current.length} early ICE candidates on receiver`);
        for (const item of earlyIceCandidatesRef.current) {
          await webrtc.addIceCandidate(item.candidate);
        }
        earlyIceCandidatesRef.current = [];
      }

      socketService.acceptCall({
        callId: data.callId,
        to: data.callerId,
        callerId: data.callerId,
        answer,
        conversationId: convId,
      });

      setActiveCallSession({
        callId: data.callId,
        peerUser: callerUser,
        type: data.type,
        callState: 'connected',
        localStream,
        remoteStream: null,
        isMuted: false,
        isCameraOn: isVideo,
        isSpeakerOn: true,
        facingMode: 'user',
        isMinimized: false,
        seconds: 0,
        conversationId: convId || null,
      });

      addToast({ type: 'success', title: 'Call Connected' });
    } catch (err: any) {
      console.error('[CALL] Accept call error:', err);
      addToast({ type: 'error', title: 'Failed to Accept Call', description: err.message });
      cleanupCallSession();
    }
  }, [incomingCallData, addToast, cleanupCallSession, ensureConversation]);

  // Reject Incoming Call
  const rejectIncomingCall = useCallback(async () => {
    if (!incomingCallData) return;
    const data = incomingCallData;
    setIncomingCallData(null);

    console.log(`[CALL] Rejecting call ${data.callId}`);
    socketService.rejectCall({ callId: data.callId, to: data.callerId, conversationId: data.conversationId });

    await chatService.logCall({
      receiverId: currentUser.id,
      type: data.type,
      status: 'rejected',
      duration: '00:00',
    });
    reloadCallLogs();

    let convId = data.conversationId;
    if (!convId && data.caller?.id) {
      convId = (await ensureConversation(data.caller.id)) || undefined;
    }

    if (convId && data.callId) {
      await sendCallMessage(
        convId,
        `Missed ${data.type === 'video' ? 'video' : 'voice'} call (Declined)`,
        {
          type: data.type,
          duration: '00:00',
          status: 'ended',
          callId: data.callId,
        }
      );
    }
  }, [incomingCallData, currentUser.id, reloadCallLogs, ensureConversation, sendCallMessage]);

  // End Current Call Session
  const endCallSession = useCallback(async () => {
    const session = activeCallSessionRef.current.callId ? activeCallSessionRef.current : activeCallSession;
    if (!session.callId || !session.peerUser) {
      cleanupCallSession();
      return;
    }

    const { callId, peerUser, type, seconds } = session;
    console.log(`[CALL] Ending call ${callId}`);

    let convId = session.conversationId;
    if (!convId && peerUser?.id) {
      convId = (await ensureConversation(peerUser.id)) || null;
    }

    socketService.endCall({ callId: callId!, to: peerUser.id, conversationId: convId || undefined });

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const durationStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    await chatService.logCall({
      receiverId: peerUser.id,
      type: type || 'voice',
      status: seconds > 0 ? 'completed' : 'ended',
      duration: durationStr,
    });
    reloadCallLogs();

    if (convId && callId) {
      const isCallAnswered = session.callState === 'connected' || seconds > 0;
      const callTypeLabel = type === 'video' ? 'Video' : 'Voice';
      const content = isCallAnswered
        ? `${callTypeLabel} call ended (${durationStr})`
        : `Missed ${type === 'video' ? 'video' : 'voice'} call`;

      await sendCallMessage(
        convId,
        content,
        {
          type: type || 'voice',
          duration: durationStr,
          status: 'ended',
          callId,
        }
      );
    }

    cleanupCallSession();
  }, [activeCallSession, reloadCallLogs, cleanupCallSession, ensureConversation, sendCallMessage]);

  // Toggle Mute
  const toggleMuteCall = useCallback(() => {
    setActiveCallSession((prev) => {
      const nextMuted = !prev.isMuted;
      if (webrtcRef.current) {
        webrtcRef.current.toggleAudio(nextMuted);
      }
      addToast({ type: 'info', title: nextMuted ? 'Microphone Muted' : 'Microphone Unmuted' });
      return { ...prev, isMuted: nextMuted };
    });
  }, [addToast]);

  // Toggle Camera
  const toggleCameraCall = useCallback(() => {
    setActiveCallSession((prev) => {
      const nextCam = !prev.isCameraOn;
      if (webrtcRef.current) {
        webrtcRef.current.toggleVideo(nextCam);
      }
      addToast({ type: 'info', title: nextCam ? 'Camera On' : 'Camera Off' });
      return { ...prev, isCameraOn: nextCam };
    });
  }, [addToast]);

  // Toggle Speaker
  const toggleSpeakerCall = useCallback(() => {
    setActiveCallSession((prev) => {
      const nextSpeaker = !prev.isSpeakerOn;
      addToast({ type: 'info', title: nextSpeaker ? 'Speaker On' : 'Speaker Off' });
      return { ...prev, isSpeakerOn: nextSpeaker };
    });
  }, [addToast]);

  // Switch Camera between Selfie and Rear
  const switchCameraCall = useCallback(async () => {
    if (!webrtcRef.current) return;
    try {
      const nextMode = await webrtcRef.current.switchCamera();
      const newLocalStream = webrtcRef.current.getLocalStream();
      setActiveCallSession((prev) => ({
        ...prev,
        facingMode: nextMode,
        localStream: newLocalStream || prev.localStream,
      }));
      addToast({
        type: 'info',
        title: nextMode === 'environment' ? 'Switched to Rear Camera' : 'Switched to Selfie Camera',
      });
    } catch (err: any) {
      console.warn('Switch camera error:', err);
      addToast({
        type: 'warning',
        title: 'Camera Switch Unavailable',
        description: err?.message || 'Could not switch camera on this device',
      });
    }
  }, [addToast]);

  // Minimize Call to Floating Window
  const minimizeCall = useCallback(() => {
    setActiveCallSession((prev) => ({ ...prev, isMinimized: true }));
    addToast({ type: 'info', title: 'Call minimized to floating window' });
  }, [addToast]);

  // Maximize Call back to Full Screen
  const maximizeCall = useCallback(() => {
    setActiveCallSession((prev) => ({ ...prev, isMinimized: false }));
  }, []);

  // Legacy Call Handlers (for backward compatibility with existing components)
  const endVoiceCall = useCallback(
    (durationSecs: number) => {
      endCallSession();
    },
    [endCallSession]
  );

  const endVideoCall = useCallback(
    (durationSecs: number) => {
      endCallSession();
    },
    [endCallSession]
  );

  // Status Handlers
  const addStatus = useCallback(
    async (newStatusData: Omit<Status, 'id' | 'userId' | 'createdAt' | 'expiresAt' | 'viewers'>) => {
      const content = newStatusData.mediaUrl || newStatusData.text || '';
      const type = newStatusData.mediaType || 'text';

      const res = await chatService.createStatus({
        type,
        content,
        bgColor: newStatusData.bgColor,
        caption: newStatusData.caption,
      });

      if (res.success && res.data) {
        const s: any = res.data;
        const norm: Status = {
          id: s.id || s._id,
          userId: currentUser.id,
          mediaType: s.type || 'text',
          text: s.type === 'text' ? s.content : undefined,
          mediaUrl: s.type !== 'text' ? s.content : undefined,
          bgColor: s.bgColor,
          caption: s.caption || '',
          createdAt: 'Just now',
          expiresAt: '24h',
          viewers: [],
        };
        setStatuses((prev) => [norm, ...prev]);
      }
    },
    [currentUser.id]
  );

  const markStatusAsViewed = useCallback(
    async (statusId: string) => {
      await chatService.markStatusViewed(statusId);
      setStatuses((prev) =>
        prev.map((s) => {
          if (s.id !== statusId) return s;
          const alreadyViewed = s.viewers.some((v) => v.userId === currentUser.id);
          if (alreadyViewed) return s;
          return {
            ...s,
            viewers: [...s.viewers, { userId: currentUser.id, viewedAt: 'Just now' }],
          };
        })
      );
    },
    [currentUser.id]
  );

  // Conversation Toggles
  const togglePinConversation = useCallback(async (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
    await chatService.togglePin(id);
  }, []);

  const toggleMuteConversation = useCallback(async (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isMuted: !c.isMuted } : c))
    );
    await chatService.toggleMute(id);
  }, []);

  const toggleArchiveConversation = useCallback(async (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: !c.isArchived } : c))
    );
    await chatService.toggleArchive(id);
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) setActiveConversationId(null);
    await chatService.deleteConversation(id);
  }, [activeConversationId]);

  const clearChat = useCallback(async (id: string) => {
    setMessages((prev) => ({
      ...prev,
      [id]: [],
    }));
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, lastMessage: undefined, unreadCount: 0 } : c))
    );
    await chatService.clearChat(id);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    if (!id) return;
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    socketService.markRead(id);
    try {
      await chatService.markMessagesAsRead(id);
    } catch (err) {
      // Ignore background receipt failure
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
  }, []);

  const sendMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      replyToMessageId?: string,
      attachments?: MediaAttachment[]
    ) => {
      const res = await chatService.sendMessage({
        conversationId,
        content,
        replyToMessageId,
        attachments,
      });

      if (res.success && res.data) {
        const norm = normalizeMessage(res.data);
        setMessages((prev) => {
          const currentList = prev[conversationId] || [];
          if (currentList.some((m) => m.id === norm.id)) {
            return prev;
          }
          return {
            ...prev,
            [conversationId]: [...currentList, norm],
          };
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: norm, updatedAt: new Date().toISOString() }
              : c
          )
        );
      }
    },
    []
  );

  const deleteMessage = useCallback(async (conversationId: string, messageId: string) => {
    setMessages((prev) => {
      const remaining = (prev[conversationId] || []).filter((m) => m.id !== messageId);
      return {
        ...prev,
        [conversationId]: remaining,
      };
    });
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId && c.lastMessage?.id === messageId) {
          const remaining = (messages[conversationId] || []).filter((m) => m.id !== messageId);
          const latest = remaining[remaining.length - 1];
          return { ...c, lastMessage: latest };
        }
        return c;
      })
    );
    await chatService.deleteMessage(messageId);
  }, [messages]);

  const editMessage = useCallback(
    async (conversationId: string, messageId: string, content: string) => {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          m.id === messageId ? { ...m, content, isEdited: true } : m
        ),
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId && c.lastMessage?.id === messageId
            ? { ...c, lastMessage: { ...c.lastMessage, content, isEdited: true } }
            : c
        )
      );
      const res = await chatService.editMessage(messageId, content);
      if (res.success && res.data) {
        const norm = normalizeMessage(res.data);
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map((m) =>
            m.id === messageId ? norm : m
          ),
        }));
      }
    },
    [normalizeMessage]
  );

  const togglePinMessage = useCallback(
    async (conversationId: string, messageId: string) => {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
        ),
      }));
      await chatService.togglePinMessage(messageId);
    },
    []
  );

  const toggleStarMessage = useCallback(
    async (conversationId: string, messageId: string) => {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
        ),
      }));
      await chatService.toggleStarMessage(messageId);
    },
    []
  );

  const addReaction = useCallback(async (conversationId: string, messageId: string, emoji: string) => {
    const res = await chatService.reactToMessage(messageId, emoji);
    if (res.success && res.data) {
      const norm = normalizeMessage(res.data);
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) => (m.id === messageId ? norm : m)),
      }));
    }
  }, []);

  const forwardMessage = useCallback(
    async (targetConversationId: string, message: Message) => {
      await sendMessage(
        targetConversationId,
        `Forwarded: ${message.content}`,
        undefined,
        message.attachments
      );
    },
    [sendMessage]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        conversations,
        messages,
        statuses,
        calls,
        activeTab,
        setActiveTab,
        activeConversationId,
        setActiveConversationId,
        theme,
        toggleTheme,
        typingUsers,
        getUserById,
        userPresences,
        getUserPresence,
        setUserPresence,
        incomingCallData,
        activeCallSession,
        startVoiceCall,
        startVideoCall,
        endVoiceCall,
        endVideoCall,
        activeCallUser: activeCallSession.type === 'voice' ? activeCallSession.peerUser : null,
        activeVideoCallUser: activeCallSession.type === 'video' ? activeCallSession.peerUser : null,
        acceptIncomingCall,
        rejectIncomingCall,
        endCallSession,
        toggleMuteCall,
        toggleCameraCall,
        toggleSpeakerCall,
        switchCameraCall,
        minimizeCall,
        maximizeCall,
        togglePinConversation,
        toggleMuteConversation,
        toggleArchiveConversation,
        deleteConversation,
        clearChat,
        markAsRead,
        markAllAsRead,
        createConversation,
        addStatus,
        markStatusAsViewed,
        sendMessage,
        deleteMessage,
        editMessage,
        togglePinMessage,
        toggleStarMessage,
        addReaction,
        forwardMessage,
        sendTypingSignal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
