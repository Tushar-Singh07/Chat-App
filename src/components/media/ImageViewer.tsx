import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Forward, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface ImageMediaItem {
  id: string;
  url: string;
  fileName?: string;
  caption?: string;
  timestamp?: string;
}

interface ImageViewerProps {
  isOpen: boolean;
  images: ImageMediaItem[];
  initialIndex?: number;
  onClose: () => void;
  onForward?: (imageId: string) => void;
  onDelete?: (imageId: string) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
  onForward,
  onDelete,
}) => {
  const { addToast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentImage.url;
    a.download = currentImage.fileName || `image_${currentIndex + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast({ type: 'info', title: 'Downloading image file' });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 z-10 text-white">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
            {currentIndex + 1} of {images.length}
          </span>
          {currentImage.timestamp && (
            <span className="text-xs opacity-75">{currentImage.timestamp}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Download Image"
          >
            <Download className="w-5 h-5" />
          </button>
          {onForward && (
            <button
              onClick={() => onForward(currentImage.id)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Forward Image"
            >
              <Forward className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                onDelete(currentImage.id);
                onClose();
              }}
              className="p-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors"
              title="Delete Image"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform active:scale-90 z-10"
            title="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Display Image */}
        <img
          src={currentImage.url}
          alt={currentImage.fileName || 'Full screen viewer'}
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-all duration-200"
        />

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform active:scale-90 z-10"
            title="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption Footer */}
      {currentImage.caption && (
        <div className="p-4 text-center z-10">
          <p className="inline-block px-4 py-2 rounded-xl bg-black/60 text-white text-sm backdrop-blur-xs">
            {currentImage.caption}
          </p>
        </div>
      )}
    </div>
  );
};
