import React from 'react';
import { cn } from '../../utils/cn';

export type CallState = 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'busy';

interface CallStatusProps {
  state: CallState;
  isVideo?: boolean;
  className?: string;
}

export const CallStatus: React.FC<CallStatusProps> = ({ state, isVideo = false, className }) => {
  const getStatusText = () => {
    switch (state) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return isVideo ? 'Video Call Connected' : 'Voice Call Connected';
      case 'ended':
        return 'Call ended';
      case 'rejected':
        return 'Call rejected';
      case 'busy':
        return 'User is busy';
      default:
        return '';
    }
  };

  return (
    <div className={cn('text-center select-none', className)}>
      <p
        className={cn(
          'text-sm font-semibold tracking-wide transition-colors',
          state === 'connected'
            ? 'text-emerald-400'
            : state === 'ended' || state === 'rejected' || state === 'busy'
            ? 'text-rose-400'
            : 'text-zinc-300 animate-pulse'
        )}
      >
        {getStatusText()}
      </p>
    </div>
  );
};
