import type { User } from '../types';

export const DEFAULT_AVATAR = '';

export const CURRENT_USER: User = {
  id: '',
  name: '',
  email: '',
  avatar: '',
  bio: 'Hey there! I am using WhatsApp.',
  phone: '',
  presence: 'offline',
};

export const MOCK_USERS: User[] = [];

export const getUserById = (id: string, userList: User[] = []): User => {
  return userList.find((u) => u.id === id) || {
    id,
    name: 'User',
    email: '',
    avatar: DEFAULT_AVATAR,
    bio: 'WhatsApp user',
    phone: '',
    presence: 'offline',
  };
};
