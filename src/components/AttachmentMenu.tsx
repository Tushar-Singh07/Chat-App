import React, { useRef, useEffect } from 'react';
import { Image, Camera, FileText, MapPin, User } from 'lucide-react';
import { cn } from '../utils/cn';

export type AttachmentOptionType = 'photos' | 'camera' | 'document' | 'location' | 'contact';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (type: AttachmentOptionType) => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  isOpen,
  onClose,
  onSelectOption,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: { id: AttachmentOptionType; label: string; icon: React.ElementType; color: string }[] = [
    {
      id: 'photos',
      label: 'Photos & Videos',
      icon: Image,
      color: 'bg-purple-500 text-white',
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      color: 'bg-[#00a884] text-white',
    },
    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      color: 'bg-indigo-500 text-white',
    },
    {
      id: 'location',
      label: 'Location',
      icon: MapPin,
      color: 'bg-rose-500 text-white',
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: User,
      color: 'bg-blue-500 text-white',
    },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute bottom-16 left-3 z-40 bg-white dark:bg-[#202c33] border border-zinc-200 dark:border-[#222d34] p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-56 animate-in slide-in-from-bottom-3 duration-150 select-none"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => {
              onSelectOption(item.id);
              onClose();
            }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#111b21] transition-colors text-xs font-semibold text-zinc-800 dark:text-zinc-200"
          >
            <div className={cn('p-2 rounded-full shadow-xs', item.color)}>
              <Icon className="w-4 h-4" />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
