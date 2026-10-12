import type { User, Conversation, Message, Status, Call } from '../types';
import { MOCK_USERS, getUserById } from '../data/users';
import { MOCK_CONVERSATIONS } from '../data/conversations';
import { MOCK_MESSAGES } from '../data/messages';
import { MOCK_STATUSES } from '../data/statuses';
import { MOCK_CALLS } from '../data/calls';

export const mockDataService = {
  getUsers: (): User[] => MOCK_USERS,
  getUser: (id: string): User => getUserById(id),
  getConversations: (): Conversation[] => MOCK_CONVERSATIONS,
  getConversationById: (id: string): Conversation | undefined =>
    MOCK_CONVERSATIONS.find((c) => c.id === id),
  getMessages: (conversationId: string): Message[] => MOCK_MESSAGES[conversationId] || [],
  getStatuses: (): Status[] => MOCK_STATUSES,
  getCalls: (): Call[] => MOCK_CALLS,
};
