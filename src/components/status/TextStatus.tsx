import React, { useState } from 'react';
import { X, Send, Palette, Type, Smile } from 'lucide-react';
import type { StatusFontStyle } from '../../types';
import { cn } from '../../utils/cn';

interface TextStatusProps {
  onPost: (text: string, bgColor: string, fontStyle: StatusFontStyle) => void;
  onClose: () => void;
}

const BG_PRESETS = [
  { id: 'bg-1', name: 'Purple Sunset', class: 'bg-gradient-to-br from-purple-700 via-pink-600 to-rose-500' },
  { id: 'bg-2', name: 'Emerald Teal', class: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800' },
  { id: 'bg-3', name: 'Midnight Violet', class: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900' },
  { id: 'bg-4', name: 'Amber Warmth', class: 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-700' },
  { id: 'bg-5', name: 'Ocean Breeze', class: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-sky-800' },
  { id: 'bg-6', name: 'Neon Cyber', class: 'bg-gradient-to-br from-fuchsia-600 via-purple-700 to-blue-700' },
];

const FONT_PRESETS: { id: StatusFontStyle; label: string; fontClass: string }[] = [
  { id: 'sans', label: 'Sans', fontClass: 'font-sans font-bold' },
  { id: 'serif', label: 'Serif', fontClass: 'font-serif font-bold' },
  { id: 'mono', label: 'Mono', fontClass: 'font-mono font-bold' },
  { id: 'handwriting', label: 'Casual', fontClass: 'font-sans italic tracking-wide' },
  { id: 'display', label: 'Display', fontClass: 'font-sans uppercase font-black tracking-wider' },
];

const EMOJI_LIST = ['😀', '😂', '😍', '🔥', '👍', '🎉', '❤️', '🙌', '✨', '⚡', '☕', '🚀', '💯', '🌟', '😎', '💪'];

export const TextStatus: React.FC<TextStatusProps> = ({ onPost, onClose }) => {
  const [text, setText] = useState('');
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const currentBg = BG_PRESETS[selectedBgIndex];
  const currentFont = FONT_PRESETS[selectedFontIndex];

  const handleCycleBg = () => {
    setSelectedBgIndex((prev) => (prev + 1) % BG_PRESETS.length);
  };

  const handleCycleFont = () => {
    setSelectedFontIndex((prev) => (prev + 1) % FONT_PRESETS.length);
  };

  const handlePost = () => {
    if (!text.trim()) return;
    onPost(text.trim(), currentBg.class, currentFont.id);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col justify-between text-white p-6 transition-all duration-300 select-none animate-in fade-in duration-200',
        currentBg.class
      )}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between z-20">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-md"
          title="Cancel"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          {/* Cycle Font Button */}
          <button
            onClick={handleCycleFont}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-md text-xs font-semibold"
            title="Change Font Style"
          >
            <Type className="w-4 h-4" />
            <span>{currentFont.label}</span>
          </button>

          {/* Cycle Background Button */}
          <button
            onClick={handleCycleBg}
            className="p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-md"
            title="Change Background Color"
          >
            <Palette className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Text Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full text-center relative z-10">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a status update..."
          rows={5}
          autoFocus
          className={cn(
            'w-full bg-transparent text-white placeholder-white/60 resize-none focus:outline-none text-2xl sm:text-4xl text-center leading-relaxed drop-shadow-lg',
            currentFont.fontClass
          )}
        />
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="mx-auto mb-4 p-3 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 max-w-sm w-full flex items-center justify-center gap-2 overflow-x-auto z-20 no-scrollbar">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
              }}
              className="text-2xl p-1.5 rounded-lg hover:bg-white/20 transition-transform active:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Bar Controls & Post Button */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full z-20">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={cn(
            'p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-md',
            showEmojiPicker && 'ring-2 ring-white/60'
          )}
          title="Add Emoji"
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* Post Button */}
        <button
          onClick={handlePost}
          disabled={!text.trim()}
          className={cn(
            'p-4 rounded-full shadow-2xl transition-all duration-200 active:scale-95 flex items-center justify-center',
            text.trim()
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-4 ring-emerald-500/30'
              : 'bg-white/20 text-white/40 cursor-not-allowed'
          )}
          title="Post Status"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
