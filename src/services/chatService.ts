import { apiFetch } from './api';
import type { Conversation, Message, Status, Call } from '../types';

export const chatService = {
  // Conversations
  async getConversations() {
    return await apiFetch<Conversation[]>('/conversations');
  },

  async createConversation(targetUserId: string) {
    return await apiFetch<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  },

  async togglePin(id: string) {
    return await apiFetch<Conversation>(`/conversations/${id}/pin`, { method: 'PATCH' });
  },

  async toggleMute(id: string) {
    return await apiFetch<Conversation>(`/conversations/${id}/mute`, { method: 'PATCH' });
  },

  async toggleArchive(id: string) {
    return await apiFetch<Conversation>(`/conversations/${id}/archive`, { method: 'PATCH' });
  },

  async deleteConversation(id: string) {
    return await apiFetch(`/conversations/${id}`, { method: 'DELETE' });
  },

  // Messages
  async getMessages(conversationId: string) {
    return await apiFetch<Message[]>(`/messages/${conversationId}`);
  },

  async sendMessage(payload: {
    conversationId: string;
    content: string;
    replyToMessageId?: string;
    attachments?: any[];
    callSummary?: any;
  }) {
    return await apiFetch<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteMessage(id: string) {
    return await apiFetch(`/messages/${id}`, { method: 'DELETE' });
  },

  async reactToMessage(id: string, emoji: string) {
    return await apiFetch<Message>(`/messages/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  },

  // Statuses
  async getStatuses() {
    return await apiFetch<Status[]>('/statuses');
  },

  async createStatus(payload: { type: string; content: string; bgColor?: string; caption?: string }) {
    return await apiFetch<Status>('/statuses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async markStatusViewed(id: string) {
    return await apiFetch<Status>(`/statuses/${id}/view`, { method: 'POST' });
  },

  // Calls
  async getCalls() {
    return await apiFetch<Call[]>('/calls');
  },

  async logCall(payload: { receiverId: string; type: 'voice' | 'video'; status: string; duration: string }) {
    return await apiFetch<Call>('/calls', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
