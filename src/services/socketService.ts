import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket && this.socket.connected) return;

    const token = getToken();

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to backend real-time server (User:', userId, ')');
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from real-time server');
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave_conversation', conversationId);
  }

  sendTyping(conversationId: string, userId: string) {
    this.socket?.emit('typing', { conversationId, userId });
  }

  sendStopTyping(conversationId: string, userId: string) {
    this.socket?.emit('stop_typing', { conversationId, userId });
  }

  sendMessage(message: any) {
    this.socket?.emit('send_message', message);
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.socket?.on('receive_message', callback);
  }

  offReceiveMessage() {
    this.socket?.off('receive_message');
  }

  onUserTyping(callback: (data: { conversationId: string; userId: string }) => void) {
    this.socket?.on('user_typing', callback);
  }

  onUserStopTyping(callback: (data: { conversationId: string; userId: string }) => void) {
    this.socket?.on('user_stop_typing', callback);
  }

  onPresenceChange(callback: (data: { userId: string; isOnline: boolean; lastSeen: string }) => void) {
    this.socket?.on('user_presence_change', callback);
  }

  // ===============================================
  // WebRTC Call Signaling Methods
  // ===============================================

  initiateCall(payload: {
    callId: string;
    receiverId: string;
    type: 'voice' | 'video';
    offer: any;
    caller: any;
  }) {
    this.socket?.emit('call:initiate', payload);
  }

  acceptCall(payload: { callId: string; answer: any }) {
    this.socket?.emit('call:accept', payload);
  }

  rejectCall(payload: { callId: string; to?: string }) {
    this.socket?.emit('call:reject', payload);
  }

  cancelCall(payload: { callId: string; to?: string }) {
    this.socket?.emit('call:cancel', payload);
  }

  endCall(payload: { callId: string; to?: string }) {
    this.socket?.emit('call:end', payload);
  }

  sendIceCandidate(payload: { callId: string; to: string; candidate: any }) {
    this.socket?.emit('call:ice-candidate', payload);
  }

  onIncomingCall(callback: (data: any) => void) {
    this.socket?.on('call:incoming', callback);
  }

  onCallRinging(callback: (data: any) => void) {
    this.socket?.on('call:ringing', callback);
  }

  onCallAccepted(callback: (data: any) => void) {
    this.socket?.on('call:accepted', callback);
  }

  onCallRejected(callback: (data: any) => void) {
    this.socket?.on('call:rejected', callback);
  }

  onCallCancelled(callback: (data: any) => void) {
    this.socket?.on('call:cancelled', callback);
  }

  onCallEnded(callback: (data: any) => void) {
    this.socket?.on('call:ended', callback);
  }

  onCallBusy(callback: (data: any) => void) {
    this.socket?.on('call:busy', callback);
  }

  onCallUnavailable(callback: (data: any) => void) {
    this.socket?.on('call:unavailable', callback);
  }

  onIceCandidate(callback: (data: any) => void) {
    this.socket?.on('call:ice-candidate', callback);
  }

  offCallEvents() {
    this.socket?.off('call:incoming');
    this.socket?.off('call:ringing');
    this.socket?.off('call:accepted');
    this.socket?.off('call:rejected');
    this.socket?.off('call:cancelled');
    this.socket?.off('call:ended');
    this.socket?.off('call:busy');
    this.socket?.off('call:unavailable');
    this.socket?.off('call:ice-candidate');
  }
}

export const socketService = new SocketService();
