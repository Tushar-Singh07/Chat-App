import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, Film } from 'lucide-react';
import { Button } from '../Button';

interface MediaPreviewProps {
  isOpen: boolean;
  file: File | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'video';
  onClose: () => void;
  onSend: (caption: string) => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  isOpen,
  file,
  mediaUrl,
  mediaType,
  onClose,
  onSend,
}) => {
  const [caption, setCaption] = useState('');

  if (!isOpen || !mediaUrl) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(caption);
    setCaption('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-zinc-800 max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 text-white">
          <div className="flex items-center gap-2">
            {mediaType === 'image' ? (
              <ImageIcon className="w-5 h-5 text-emerald-400" />
            ) : (
              <Film className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-sm font-semibold truncate">
              {file ? file.name : 'Media Preview'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Feed */}
        <div className="flex-1 overflow-hidden p-6 flex items-center justify-center bg-black/60 min-h-[300px]">
          {mediaType === 'image' ? (
            <img
              src={mediaUrl}
              alt="Media Preview"
              className="max-w-full max-h-[50vh] object-contain rounded-2xl shadow-xl"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              className="max-w-full max-h-[50vh] rounded-2xl shadow-xl"
            />
          )}
        </div>

        {/* Bottom Caption Input & Send Form */}
        <form onSubmit={handleSend} className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center gap-3">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            autoFocus
            className="flex-1 px-4 py-3 text-sm bg-zinc-800 text-white placeholder-zinc-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all"
          />
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
