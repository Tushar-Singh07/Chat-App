import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Smile,
} from 'lucide-react';
import type { Status, User } from '../../types';
import { Avatar } from '../Avatar';
import { getUserById } from '../../data/users';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

interface StatusViewerProps {
  statuses: Status[];
  initialStatusId?: string;
  onClose: () => void;
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  statuses,
  initialStatusId,
  onClose,
}) => {
  const { currentUser, getUserById, markStatusAsViewed, sendMessage, createConversation } = useApp();
  const { addToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!initialStatusId) return 0;
    const idx = statuses.findIndex((s) => s.id === initialStatusId);
    return idx >= 0 ? idx : 0;
  });

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [showViewersDrawer, setShowViewersDrawer] = useState(false);

  const currentStatus = statuses[currentIndex];
  const author: User | undefined = currentStatus ? getUserById(currentStatus.userId) : undefined;
  const isMine = currentStatus ? currentStatus.userId === currentUser.id : false;

  // Mark status as viewed when displayed
  useEffect(() => {
    if (currentStatus) {
      markStatusAsViewed(currentStatus.id);
    }
  }, [currentIndex, currentStatus, markStatusAsViewed]);

  // Auto progress timer effect (5000ms per status)
  useEffect(() => {
    if (!currentStatus || isPaused || showViewersDrawer) return;

    const duration = 5000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, currentStatus, isPaused, showViewersDrawer]);

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0);
    setShowViewersDrawer(false);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyInput.trim() || !author || isMine) return;

    const convId = await createConversation(author.id);
    if (convId) {
      sendMessage(convId, `Replied to status: "${replyInput.trim()}"`);
    }

    addToast({
      type: 'success',
      title: 'Reply Sent',
      description: `Sent to ${author.name}`,
    });

    setReplyInput('');
  };

  if (!currentStatus || !author) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-white select-none overflow-hidden animate-in fade-in duration-200"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full h-full max-w-lg mx-auto flex flex-col justify-between bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Top Header Overlay: Progress Bars & Author Details */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Segmented Progress Bar */}
          <div className="flex gap-1.5 w-full mb-3">
            {statuses.map((s, idx) => {
              let fillWidth = '0%';
              if (idx < currentIndex) fillWidth = '100%';
              else if (idx === currentIndex) fillWidth = `${progress}%`;

              return (
                <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-75 ease-linear"
                    style={{ width: fillWidth }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={author.avatar} alt={author.name} size="md" />
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {isMine ? 'Your Status' : author.name}
                </h3>
                <p className="text-xs text-zinc-300 opacity-80">{currentStatus.createdAt}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-md"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ----------------- MAIN MEDIA / TEXT CONTENT STAGE ----------------- */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Navigation Tap Zones */}
          <div
            onClick={handlePrev}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer flex items-center justify-start p-4 group"
          >
            <div className="p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
              <ChevronLeft className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={handleNext}
            className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer flex items-center justify-end p-4 group"
          >
            <div className="p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>

          {/* Content Rendering: Text vs Image vs Video */}
          {currentStatus.mediaType === 'text' ? (
            <div
              className={cn(
                'w-full h-full flex flex-col items-center justify-center p-8 text-center',
                currentStatus.bgColor || 'bg-gradient-to-br from-emerald-700 to-teal-900'
              )}
            >
              <p
                className={cn(
                  'text-2xl sm:text-3xl text-white font-bold leading-relaxed drop-shadow-lg max-w-md',
                  currentStatus.fontStyle === 'serif' && 'font-serif',
                  currentStatus.fontStyle === 'mono' && 'font-mono',
                  currentStatus.fontStyle === 'handwriting' && 'font-sans italic',
                  currentStatus.fontStyle === 'display' && 'font-sans uppercase tracking-wider font-black'
                )}
              >
                {currentStatus.text || currentStatus.caption}
              </p>
            </div>
          ) : currentStatus.mediaType === 'video' ? (
            <video
              src={currentStatus.mediaUrl}
              autoPlay
              muted
              playsInline
              loop
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStatus.mediaUrl}
              alt="Status"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* ----------------- BOTTOM OVERLAY: CAPTION / REPLY / VIEWS ----------------- */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-3">
          {/* Caption Text overlay */}
          {currentStatus.caption && currentStatus.mediaType !== 'text' && (
            <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-sm font-medium text-center text-white max-w-sm">
              {currentStatus.caption}
            </div>
          )}

          {/* View Count Badge for User's Own Status */}
          {isMine ? (
            <button
              onClick={() => setShowViewersDrawer(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-zinc-200 transition-transform active:scale-95 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>{currentStatus.viewers.length} Views</span>
            </button>
          ) : (
            /* Reply Bar for Contact's Status */
            <form
              onSubmit={handleSendReply}
              className="w-full flex items-center gap-2 max-w-sm"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder={`Reply to ${author.name}...`}
                className="flex-1 px-4 py-2.5 rounded-full bg-white/15 text-white placeholder-white/60 text-xs backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/10"
              />
              <button
                type="submit"
                disabled={!replyInput.trim()}
                className={cn(
                  'p-2.5 rounded-full transition-all active:scale-90',
                  replyInput.trim()
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* ----------------- VIEWERS DRAWER (FOR MY STATUS) ----------------- */}
        {showViewersDrawer && isMine && (
          <div
            className="absolute inset-x-0 bottom-0 z-40 bg-zinc-900 border-t border-zinc-700 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-200"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Viewed by {currentStatus.viewers.length}
                </h4>
              </div>
              <button
                onClick={() => setShowViewersDrawer(false)}
                className="p-1 rounded-full hover:bg-white/10 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {currentStatus.viewers.length > 0 ? (
                currentStatus.viewers.map((v) => {
                  const viewerUser = getUserById(v.userId);
                  return (
                    <div key={v.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar src={viewerUser.avatar} alt={viewerUser.name} size="sm" />
                        <span className="text-xs font-semibold text-white">{viewerUser.name}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400">{v.viewedAt}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-zinc-400 text-center py-4">No views yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
