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
 * Formats a Date into standard 12-hour format with AM/PM (e.g., "4:35 PM").
 */
export const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minutesStr} ${ampm}`;
};

/**
 * Formats a last-seen date/time accurately with:
 * - "online" if isOnline is true
 * - "last seen today at 4:35 PM" if last online today
 * - "last seen yesterday at 11:20 PM" if last online yesterday
 * - "last seen Wednesday at 2:15 PM" if within the past week (day of the week)
 * - "last seen 20 Oct at 5:30 PM" if older than 7 days
 * - "last seen 20 Oct 2025 at 5:30 PM" if previous years
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
  const timeStr = formatTime(date);

  // Compare calendar days (midnight to midnight)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfTarget) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return `last seen today at ${timeStr}`;
  }

  if (diffDays === 1) {
    return `last seen yesterday at ${timeStr}`;
  }

  if (diffDays > 1 && diffDays < 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `last seen ${dayName} at ${timeStr}`;
  }

  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  if (now.getFullYear() === date.getFullYear()) {
    return `last seen ${day} ${month} at ${timeStr}`;
  }

  return `last seen ${day} ${month} ${date.getFullYear()} at ${timeStr}`;
};

