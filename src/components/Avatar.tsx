import React, { useState } from 'react';
import type { Presence } from '../types';
import { cn } from '../utils/cn';
import { getInitials, getPresenceBadgeColor } from '../utils/formatters';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  presence?: Presence;
  showPresence?: boolean;
  hasUnreadStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-32 h-32 text-4xl font-bold',
};

const presenceSizeClasses = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-6 h-6 border-4',
};

const isDemoAvatar = (url?: string) => {
  if (!url) return true;
  return url.includes('images.unsplash.com/photo-1534528741775-53994a69daeb');
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  presence,
  showPresence = false,
  hasUnreadStatus = false,
  className,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative inline-block select-none flex-shrink-0',
        onClick && 'cursor-pointer transition-transform active:scale-95',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-semibold bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-black/5 dark:border-white/10 transition-all',
          sizeClasses[size],
          hasUnreadStatus && 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-[#111b21]'
        )}
      >
        {src && !imageError && !isDemoAvatar(src) ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(alt)}</span>
        )}
      </div>

      {showPresence && presence && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white dark:border-[#111b21]',
            presenceSizeClasses[size],
            getPresenceBadgeColor(presence)
          )}
          title={`Status: ${presence}`}
        />
      )}
    </div>
  );
};
