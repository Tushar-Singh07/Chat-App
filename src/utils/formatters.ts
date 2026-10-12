import type { Presence } from '../types';

export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const getPresenceBadgeColor = (presence: Presence): string => {
  switch (presence) {
    case 'online':
      return 'bg-emerald-500';
    case 'busy':
      return 'bg-red-500';
    case 'away':
      return 'bg-amber-500';
    case 'offline':
    default:
      return 'bg-zinc-400 dark:bg-zinc-500';
  }
};
