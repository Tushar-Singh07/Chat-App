import React from 'react';
import { cn } from '../../utils/cn';

interface CallTimerProps {
  seconds: number;
  className?: string;
}

export const CallTimer: React.FC<CallTimerProps> = ({ seconds, className }) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className={cn('text-2xl font-bold text-white tracking-widest font-mono select-none', className)}>
      {formatTime(seconds)}
    </div>
  );
};
