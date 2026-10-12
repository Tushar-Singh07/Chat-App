import React from 'react';
import { cn } from '../../utils/cn';

interface AudioWaveformProps {
  progress?: number; // 0 to 100
  barCount?: number;
  heights?: number[];
  isMe?: boolean;
  onSeek?: (percentage: number) => void;
  className?: string;
}

const DEFAULT_HEIGHTS = [
  30, 50, 20, 80, 60, 100, 45, 90, 65, 85, 40, 75, 50, 95, 30, 60, 85, 55, 40, 90,
  35, 70, 45, 80, 60, 95, 50, 75, 40, 85
];

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  progress = 0,
  barCount = 28,
  heights = DEFAULT_HEIGHTS,
  isMe = false,
  onSeek,
  className,
}) => {
  const bars = heights.slice(0, barCount);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeek(percentage);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-1 h-7 cursor-pointer select-none py-1',
        className
      )}
    >
      {bars.map((height, i) => {
        const barPercentage = (i / bars.length) * 100;
        const isFilled = barPercentage <= progress;

        return (
          <div
            key={i}
            style={{ height: `${height}%` }}
            className={cn(
              'w-1 rounded-full transition-colors duration-150',
              isFilled
                ? isMe
                  ? 'bg-emerald-700 dark:bg-emerald-300'
                  : 'bg-emerald-600 dark:bg-[#00a884]'
                : isMe
                ? 'bg-emerald-600/30 dark:bg-emerald-500/30'
                : 'bg-zinc-300 dark:bg-zinc-700'
            )}
          />
        );
      })}
    </div>
  );
};
