import React from 'react';
import { FileText, Download } from 'lucide-react';
import type { MediaAttachment } from '../../types';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

interface DocumentMessageProps {
  attachment: MediaAttachment;
  isMe?: boolean;
}

export const DocumentMessage: React.FC<DocumentMessageProps> = ({ attachment, isMe = false }) => {
  const { addToast } = useToast();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      type: 'info',
      title: 'Downloading file',
      description: attachment.fileName || 'document.pdf',
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl min-w-[220px] max-w-sm border transition-colors',
        isMe
          ? 'bg-black/5 dark:bg-black/25 border-black/5 dark:border-white/10'
          : 'bg-zinc-100 dark:bg-[#111b21] border-zinc-200 dark:border-[#222d34]'
      )}
    >
      <div className="p-2.5 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
        <FileText className="w-7 h-7" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
          {attachment.fileName || 'Document.pdf'}
        </p>
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
          {attachment.fileSize || 'PDF Document'}
        </span>
      </div>

      <button
        onClick={handleDownload}
        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 transition-colors"
        title="Download File"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
};
