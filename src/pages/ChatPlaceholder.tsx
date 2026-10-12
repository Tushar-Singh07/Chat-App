import React from 'react';
import { Lock, ShieldCheck, MessageSquarePlus } from 'lucide-react';
import { Button } from '../components/Button';

interface ChatPlaceholderProps {
  onNewChat?: () => void;
}

export const ChatPlaceholder: React.FC<ChatPlaceholderProps> = ({ onNewChat }) => {
  return (
    <div className="hidden md:flex flex-col items-center justify-center flex-1 h-full bg-zinc-50 dark:bg-[#111b21] border-l border-zinc-200 dark:border-[#222d34] p-8 text-center chat-bg-pattern relative select-none">
      <div className="flex flex-col items-center max-w-md animate-in fade-in duration-300">
        <div className="w-24 h-24 rounded-full bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-inner">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          SecureConnect Web
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
          Send and receive messages, make high quality voice and video calls, and share stories with your contacts.
        </p>

        {onNewChat && (
          <Button
            onClick={onNewChat}
            variant="primary"
            leftIcon={<MessageSquarePlus className="w-4 h-4" />}
            className="mb-8"
          >
            Start a Conversation
          </Button>
        )}

        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <Lock className="w-3.5 h-3.5" />
          <span>End-to-end encrypted frontend application shell</span>
        </div>
      </div>
    </div>
  );
};
