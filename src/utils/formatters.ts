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

/**
 * Formats a last-seen date/time accurately in local user time.
 * - "online" if isOnline is true
 * - "last seen just now" if < 1 minute ago
 * - "last seen today at 8:15 PM"
 * - "last seen yesterday at 10:30 AM"
 * - "last seen 25 Oct at 4:20 PM"
 * - "last seen 15 Jan 2024 at 1:10 PM"
 */
export const formatLastSeen = (raw?: string | Date | null, isOnline?: boolean): string => {
  if (isOnline || raw === 'Online' || raw === 'online') {
    return 'online';
  }
  if (!raw || raw === 'Offline' || raw === 'offline') {
    return 'offline';
  }

  // If already formatted like "last seen today at ...", return as is
  if (typeof raw === 'string' && raw.toLowerCase().startsWith('last seen')) {
    return raw;
  }

  let date: Date;
  if (raw instanceof Date) {
    date = raw;
  } else {
    // If it's a raw time like "08:15 PM" or "14:20" without date
    const timeOnlyMatch = typeof raw === 'string' && raw.match(/^(\d{1,2}):(\d{2})(\s*[APap][Mm])?$/);
    if (timeOnlyMatch) {
      return `last seen today at ${raw}`;
    }
    date = new Date(raw);
  }

  if (isNaN(date.getTime())) {
    return 'offline';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If in the future or under 1 minute ago
  if (diffMs < 60 * 1000 && diffMs >= -5000) {
    return 'last seen just now';
  }

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  const isToday =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  if (isToday) {
    return `last seen today at ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    yesterday.getDate() === date.getDate() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getFullYear() === date.getFullYear();

  if (isYesterday) {
    return `last seen yesterday at ${timeStr}`;
  }

  const isThisYear = now.getFullYear() === date.getFullYear();
  const day = date.getDate();
  const month = date.toLocaleDateString([], { month: 'short' });

  if (isThisYear) {
    return `last seen ${day} ${month} at ${timeStr}`;
  }

  return `last seen ${day} ${month} ${date.getFullYear()} at ${timeStr}`;
};

