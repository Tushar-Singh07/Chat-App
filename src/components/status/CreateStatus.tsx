import React, { useState } from 'react';
import { Camera, Image, Type, X } from 'lucide-react';
import { TextStatus } from './TextStatus';
import { MediaStatus } from './MediaStatus';
import type { StatusFontStyle } from '../../types';

interface CreateStatusProps {
  isOpen: boolean;
  initialMode?: 'camera' | 'gallery' | 'text' | null;
  onClose: () => void;
  onPostText: (text: string, bgColor: string, fontStyle: StatusFontStyle) => void;
  onPostMedia: (mediaUrl: string, mediaType: 'image' | 'video', caption: string) => void;
}

export const CreateStatus: React.FC<CreateStatusProps> = ({
  isOpen,
  initialMode = null,
  onClose,
  onPostText,
  onPostMedia,
}) => {
  const [mode, setMode] = useState<'menu' | 'camera' | 'gallery' | 'text'>(
    initialMode || 'menu'
  );

  if (!isOpen) return null;

  if (mode === 'text') {
    return (
      <TextStatus
        onPost={(text, bgColor, fontStyle) => {
          onPostText(text, bgColor, fontStyle);
          onClose();
        }}
        onClose={onClose}
      />
    );
  }

  if (mode === 'gallery' || mode === 'camera') {
    return (
      <MediaStatus
        initialType={mode === 'camera' ? 'image' : 'image'}
        onPost={(mediaUrl, mediaType, caption) => {
          onPostMedia(mediaUrl, mediaType, caption);
          onClose();
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-[#111b21] rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-[#222d34] animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Add Status</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Text Option */}
          <button
            onClick={() => setMode('text')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 transition-all active:scale-95 border border-purple-500/20"
          >
            <div className="p-3 rounded-full bg-purple-600 text-white shadow-md">
              <Type className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Text</span>
          </button>

          {/* Gallery Option */}
          <button
            onClick={() => setMode('gallery')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all active:scale-95 border border-emerald-500/20"
          >
            <div className="p-3 rounded-full bg-emerald-600 text-white shadow-md">
              <Image className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Gallery</span>
          </button>

          {/* Camera Option */}
          <button
            onClick={() => setMode('camera')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all active:scale-95 border border-blue-500/20"
          >
            <div className="p-3 rounded-full bg-blue-600 text-white shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Camera</span>
          </button>
        </div>
      </div>
    </div>
  );
};
