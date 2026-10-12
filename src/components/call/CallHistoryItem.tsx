import React from 'react';
import { Phone, Video } from 'lucide-react';
import type { Call, User } from '../../types';
import { Avatar } from '../Avatar';
import { CallTypeIcon } from './CallTypeIcon';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

interface CallHistoryItemProps {
  call: Call;
  currentUserId: string;
  isSelected?: boolean;
  onClick: () => void;
  onVoiceCall: (peer: User) => void;
  onVideoCall: (peer: User) => void;
  className?: string;
}

export const CallHistoryItem: React.FC<CallHistoryItemProps> = ({
  call,
  currentUserId,
  isSelected = false,
  onClick,
  onVoiceCall,
  onVideoCall,
  className,
}) => {
  const { getUserById } = useApp();
  const isOutgoing = call.callerId === currentUserId;
  const peerId = isOutgoing ? call.receiverId : call.callerId;
  const peer = getUserById(peerId);

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all select-none group',
        isSelected
          ? 'bg-zinc-100 dark:bg-[#2a3942]'
          : 'hover:bg-zinc-100/70 dark:hover:bg-[#202c33]',
        className
      )}
    >
      <Avatar src={peer.avatar} alt={peer.name} size="lg" presence={peer.presence} showPresence />

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {peer.name}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <CallTypeIcon type={call.type} status={call.status} isOutgoing={isOutgoing} />
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            {call.duration || call.timestamp}
          </span>
        </div>
      </div>

      {/* Voice & Video Quick Action Buttons */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onVoiceCall(peer)}
          className="p-2 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          title={`Voice call ${peer.name}`}
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          onClick={() => onVideoCall(peer)}
          className="p-2 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          title={`Video call ${peer.name}`}
        >
          <Video className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
