import React, { useState, useRef } from 'react';
import { X, Send, Image as ImageIcon, Video as VideoIcon, Smile } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MediaStatusProps {
  initialType?: 'image' | 'video';
  onPost: (mediaUrl: string, mediaType: 'image' | 'video', caption: string) => void;
  onClose: () => void;
}

const SAMPLE_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
];

const SAMPLE_VIDEO_PRESET = 'https://www.w3schools.com/html/mov_bbb.mp4';

const EMOJI_LIST = ['😀', '😂', '😍', '🔥', '👍', '🎉', '❤️', '🙌', '✨', '🌊', '☕', '🚀'];

export const MediaStatus: React.FC<MediaStatusProps> = ({
  initialType = 'image',
  onPost,
  onClose,
}) => {
  const [mediaType, setMediaType] = useState<'image' | 'video'>(initialType);
  const [mediaUrl, setMediaUrl] = useState<string>(
    initialType === 'image' ? SAMPLE_IMAGE_PRESETS[0] : SAMPLE_VIDEO_PRESET
  );
  const [caption, setCaption] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');

    setMediaUrl(fileUrl);
    setMediaType(isVideo ? 'video' : 'image');
  };

  const handlePost = () => {
    if (!mediaUrl) return;
    onPost(mediaUrl, mediaType, caption.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 text-white select-none animate-in fade-in duration-200">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent z-20">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-md"
          title="Cancel"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {/* Choose File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors"
          >
            {mediaType === 'image' ? <ImageIcon className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
            <span>Choose File</span>
          </button>
        </div>
      </div>

      {/* Media Preview Center Stage */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
        {mediaType === 'image' ? (
          <img
            src={mediaUrl}
            alt="Status preview"
            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <video
            src={mediaUrl}
            controls
            autoPlay
            loop
            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
          />
        )}
      </div>

      {/* Emoji Bar Popover */}
      {showEmojiPicker && (
        <div className="mx-auto mb-2 p-2 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full flex items-center justify-center gap-2 overflow-x-auto z-20 no-scrollbar">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setCaption((prev) => prev + emoji)}
              className="text-xl p-1.5 rounded-lg hover:bg-white/20 transition-transform active:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Caption & Post Action Bar */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={cn(
              'p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md',
              showEmojiPicker && 'ring-2 ring-emerald-500'
            )}
            title="Emojis"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="flex-1 px-4 py-3 bg-white/15 text-white placeholder-white/60 rounded-2xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />

          <button
            onClick={handlePost}
            className="p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl transition-all duration-200 active:scale-90 ring-4 ring-emerald-600/30"
            title="Post Status"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
