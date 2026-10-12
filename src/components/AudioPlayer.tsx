import React, { useState } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { cn } from '../utils/cn';

interface AudioPlayerProps {
  url: string;
  duration?: string;
  isMe?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ duration = '0:34', isMe = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate playback progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 5;
        });
      }, 200);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2.5 rounded-2xl min-w-[240px]',
        isMe
          ? 'bg-emerald-600/10 dark:bg-emerald-500/20'
          : 'bg-zinc-100 dark:bg-[#111b21]'
      )}
    >
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-transform active:scale-95 shadow-xs',
          isMe ? 'bg-emerald-600 dark:bg-[#00a884]' : 'bg-emerald-600 dark:bg-[#00a884]'
        )}
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
      </button>

      {/* Waveform Bar */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-1 h-6">
          {[40, 70, 30, 90, 60, 80, 45, 100, 65, 85, 40, 75, 50, 95, 30, 60, 80, 55, 40, 90].map(
            (height, i) => (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className={cn(
                  'w-1 rounded-full transition-colors',
                  i <= (progress / 100) * 20
                    ? 'bg-emerald-600 dark:bg-[#00a884]'
                    : 'bg-zinc-300 dark:bg-zinc-700'
                )}
              />
            )
          )}
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 font-medium">
            <Mic className="w-3 h-3 text-emerald-500" />
            Voice Note
          </span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};
