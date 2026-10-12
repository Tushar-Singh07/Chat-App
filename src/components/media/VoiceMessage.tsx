import React, { useState, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';
import type { MediaAttachment } from '../../types';
import { cn } from '../../utils/cn';

interface VoiceMessageProps {
  attachment: MediaAttachment;
  isMe?: boolean;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({ attachment, isMe = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 4;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (progress >= 100) setProgress(0);
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-2xl min-w-[250px] max-w-xs border transition-colors',
        isMe
          ? 'bg-emerald-600/10 dark:bg-emerald-500/20 border-emerald-500/20'
          : 'bg-zinc-100 dark:bg-[#111b21] border-zinc-200 dark:border-[#222d34]'
      )}
    >
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-transform active:scale-95 shadow-md',
          isMe ? 'bg-emerald-600 dark:bg-[#00a884]' : 'bg-emerald-600 dark:bg-[#00a884]'
        )}
        title={isPlaying ? 'Pause Voice Note' : 'Play Voice Note'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-white" />
        ) : (
          <Play className="w-5 h-5 fill-white ml-0.5" />
        )}
      </button>

      {/* Waveform & Duration */}
      <div className="flex-1 min-w-0 space-y-1">
        <AudioWaveform
          progress={progress}
          isMe={isMe}
          onSeek={(pct) => setProgress(pct)}
        />
        <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-[#00a884]">
            <Mic className="w-3 h-3" />
            Voice Message
          </span>
          <span>{attachment.duration || '0:14'}</span>
        </div>
      </div>
    </div>
  );
};
