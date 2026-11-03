import React, { useState } from 'react';
import { ArrowDown, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import type { MediaAttachment } from '../../types';
import { cn } from '../../utils/cn';

interface ImageMessageProps {
  attachment: MediaAttachment;
  isMe?: boolean;
  onClick: () => void;
  className?: string;
}

export const ImageMessage: React.FC<ImageMessageProps> = ({
  attachment,
  isMe = false,
  onClick,
  className,
}) => {
  // Check if image was previously downloaded on this device
  const [isDownloaded, setIsDownloaded] = useState<boolean>(() => {
    if (isMe) return true;
    try {
      const stored = localStorage.getItem(`wa_downloaded_${attachment.id || attachment.url}`);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Trigger file download to device
  const handleDownload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.fileName || `photo_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('Download error:', err);
    }

    setTimeout(() => {
      setIsDownloading(false);
      setIsDownloaded(true);
      try {
        localStorage.setItem(`wa_downloaded_${attachment.id || attachment.url}`, 'true');
      } catch (e) {
        // Ignore localStorage error
      }
    }, 450);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isDownloaded) {
      // If blurred, clicking downloads and unblurs the image
      handleDownload(e);
    } else {
      // If unblurred and clear, clicking opens full-screen ImageViewer
      onClick();
    }
  };

  if (hasError) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-500 max-w-sm">
        <div className="p-2.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
          <ImageIcon className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate text-zinc-700 dark:text-zinc-300">
            {attachment.fileName || 'Photo'}
          </p>
          <span className="text-[10px] text-zinc-400">Media unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'relative group cursor-pointer rounded-xl overflow-hidden shadow-xs transition-transform active:scale-[0.99] bg-zinc-900 max-w-sm select-none',
        className
      )}
    >
      {/* Photo Image Element */}
      <img
        src={attachment.url}
        alt={attachment.fileName || 'Shared photo'}
        onError={() => setHasError(true)}
        className={cn(
          'w-full max-h-72 object-cover rounded-xl transition-all duration-500',
          !isDownloaded
            ? 'filter blur-md scale-110 brightness-75'
            : 'filter-none scale-100 group-hover:scale-[1.02]'
        )}
        loading="lazy"
      />

      {/* Blurred Overlay with Central WhatsApp-Style Download Symbol for Receiver */}
      {!isDownloaded && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 p-4 transition-all group-hover:bg-black/50">
          <button
            type="button"
            onClick={handleDownload}
            className="w-13 h-13 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center border border-white/25 shadow-2xl transition-all transform hover:scale-110 active:scale-95"
            title="Click to download photo"
          >
            {isDownloading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            ) : (
              <ArrowDown className="w-6 h-6 text-white stroke-[2.5]" />
            )}
          </button>
          <span className="text-[11px] font-semibold tracking-wide text-white bg-black/60 px-3 py-1 rounded-full border border-white/15 shadow-sm">
            {attachment.fileSize || 'Photo'}
          </span>
        </div>
      )}

      {/* Clear Downloaded State: Subtle hover overlay and top-right download button */}
      {isDownloaded && (
        <>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors rounded-xl pointer-events-none" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement('a');
              link.href = attachment.url;
              link.download = attachment.fileName || `photo_${Date.now()}.jpg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md border border-white/20 z-10"
            title="Download image to device"
          >
            <Download className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};
