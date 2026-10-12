import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'fullScreen';
  message?: string;
  count?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  message = 'Loading...',
  count = 4,
  className,
}) => {
  if (type === 'fullScreen') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900 text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm font-medium tracking-wide text-zinc-300">{message}</p>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-[#202c33]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-200 dark:bg-[#202c33] rounded w-1/3" />
              <div className="h-3 bg-zinc-200 dark:bg-[#202c33] rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 gap-3', className)}>
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      {message && <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{message}</p>}
    </div>
  );
};
