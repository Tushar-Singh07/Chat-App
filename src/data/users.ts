import type { User } from '../types';

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

export const CURRENT_USER: User = {
  id: '',
  name: '',
  email: '',
  avatar: DEFAULT_AVATAR,
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
