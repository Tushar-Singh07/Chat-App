import React from 'react';
import { X, Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface MediaPreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  imageUrl,
  onClose,
}) => {
  const { addToast } = useToast();

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => addToast({ type: 'info', title: 'Downloading image file' })}
          className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Download Image"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image View */}
      <div className="p-4 max-w-4xl max-h-[90vh]">
        <img
          src={imageUrl}
          alt="Media Preview"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
};
