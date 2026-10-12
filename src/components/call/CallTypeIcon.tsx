import React from 'react';
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from 'lucide-react';
import type { CallType, CallStatus } from '../../types';
import { cn } from '../../utils/cn';

interface CallTypeIconProps {
  type: CallType;
  status: CallStatus;
  isOutgoing: boolean;
  className?: string;
  showLabel?: boolean;
}

export const CallTypeIcon: React.FC<CallTypeIconProps> = ({
  type,
  status,
  isOutgoing,
  className,
  showLabel = true,
}) => {
  const isMissed = status === 'missed' || status === 'rejected';

  const getIcon = () => {
    if (isMissed) {
      return <PhoneMissed className="w-4 h-4 text-rose-500 flex-shrink-0" />;
    }
    if (isOutgoing) {
      return <PhoneOutgoing className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
    }
    return <PhoneIncoming className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
  };

  const getLabel = () => {
    const mediaLabel = type === 'video' ? 'Video call' : 'Voice call';
    if (isMissed) return `Missed ${mediaLabel.toLowerCase()}`;
    if (isOutgoing) return `Outgoing ${mediaLabel.toLowerCase()}`;
    return `Incoming ${mediaLabel.toLowerCase()}`;
  };

  return (
    <div className={cn('flex items-center gap-1.5 select-none', className)}>
      {getIcon()}
      {showLabel && (
        <span
          className={cn(
            'text-xs capitalize font-medium',
            isMissed ? 'text-rose-500 font-semibold' : 'text-zinc-600 dark:text-zinc-400'
          )}
        >
          {getLabel()}
        </span>
      )}
    </div>
  );
};
