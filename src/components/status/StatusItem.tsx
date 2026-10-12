import React from 'react';
import { Plus, Eye } from 'lucide-react';
import type { User, Status } from '../../types';
import { Avatar } from '../Avatar';
import { cn } from '../../utils/cn';

interface StatusItemProps {
  user: User;
  status?: Status;
  isMine?: boolean;
  isViewed?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  onAddStatus?: () => void;
  className?: string;
}

export const StatusItem: React.FC<StatusItemProps> = ({
  user,
  status,
  isMine = false,
  isViewed = false,
  isSelected = false,
  onClick,
  onAddStatus,
  className,
}) => {
  const hasStatus = !!status;

  // Determine avatar ring color based on status viewed state
  const ringColorClass = !hasStatus
    ? ''
    : isViewed
    ? 'ring-2 ring-zinc-400 dark:ring-zinc-600'
    : 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-[#111b21]';

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all select-none group',
        isSelected
          ? 'bg-zinc-100 dark:bg-[#2a3942]'
          : 'hover:bg-zinc-100 dark:hover:bg-[#202c33]',
        className
      )}
    >
      {/* Avatar Container with Ring Indicator */}
      <div className="relative flex-shrink-0">
        <div className={cn('rounded-full transition-all duration-200 p-0.5', ringColorClass)}>
          <Avatar src={user.avatar} alt={user.name} size="lg" />
        </div>

        {/* My Status "+" Badge if adding new status */}
        {isMine && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAddStatus) onAddStatus();
              else onClick();
            }}
            className="absolute bottom-0 right-0 p-1 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white ring-2 ring-white dark:ring-[#111b21] transition-transform active:scale-90 shadow-md"
            title="Add Status"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {isMine ? 'My Status' : user.name}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
          {hasStatus
            ? status.createdAt
            : isMine
            ? 'Tap to add status update'
            : 'No status updates'}
        </p>
      </div>

      {/* My Status View Count Indicator */}
      {isMine && hasStatus && (
        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-[#202c33] px-2.5 py-1 rounded-full">
          <Eye className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-medium">{status.viewers.length}</span>
        </div>
      )}
    </div>
  );
};
