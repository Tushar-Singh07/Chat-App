import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { MediaAttachment } from '../../types';
import { useToast } from '../../context/ToastContext';

interface LocationMessageProps {
  attachment: MediaAttachment;
}

export const LocationMessage: React.FC<LocationMessageProps> = ({ attachment }) => {
  const { addToast } = useToast();

  const handleOpenMap = () => {
    addToast({
      type: 'info',
      title: 'Opening Map Location',
      description: attachment.locationName || 'Live Location',
    });
  };

  return (
    <div
      onClick={handleOpenMap}
      className="cursor-pointer rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-[#111b21] max-w-xs group shadow-xs"
    >
      <div className="relative h-28 bg-emerald-950/40 flex items-center justify-center overflow-hidden">
        {/* Mock Map Background Grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00a884_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative p-3 rounded-full bg-emerald-600 text-white shadow-lg animate-bounce">
          <MapPin className="w-6 h-6" />
        </div>
      </div>

      <div className="p-3 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {attachment.locationName || 'Shared Location'}
          </h4>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Tap to open directions</p>
        </div>
        <Navigation className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
