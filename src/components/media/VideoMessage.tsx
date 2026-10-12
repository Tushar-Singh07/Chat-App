import React, { useState } from 'react';
import { Play, Pause, Film } from 'lucide-react';
import type { MediaAttachment } from '../../types';
import { cn } from '../../utils/cn';

interface VideoMessageProps {
  attachment: MediaAttachment;
  isMe?: boolean;
}

export const VideoMessage: React.FC<VideoMessageProps> = ({ attachment, isMe = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative rounded-xl overflow-hidden bg-black max-w-sm group">
      {isPlaying ? (
        <video
          src={attachment.url}
          controls
          autoPlay
          onEnded={() => setIsPlaying(false)}
          className="w-full max-h-72 object-cover rounded-xl"
        />
      ) : (
        <div
          onClick={() => setIsPlaying(true)}
          className="relative cursor-pointer flex items-center justify-center min-h-[160px] bg-zinc-900 group"
        >
          {attachment.thumbnailUrl ? (
            <img
              src={attachment.thumbnailUrl}
              alt="Video preview"
              className="w-full max-h-72 object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-zinc-400">
              <Film className="w-12 h-12 text-emerald-500" />
              <span className="text-xs font-medium text-zinc-300">
                {attachment.fileName || 'Video Attachment'}
              </span>
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute p-4 rounded-full bg-emerald-600/90 text-white shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>

          {/* Duration Badge */}
          {attachment.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold backdrop-blur-xs">
              {attachment.duration}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
