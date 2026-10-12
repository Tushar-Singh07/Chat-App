import React from 'react';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import type { User } from '../../types';
import { Avatar } from '../Avatar';

interface IncomingCallModalProps {
  caller: User;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  caller,
  callType,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center relative overflow-hidden select-none">
        {/* Glow backdrop effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        {/* Pulsing Avatar */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="absolute w-28 h-28 rounded-full bg-emerald-500/30 animate-pulse" />
          <Avatar
            src={caller.avatar}
            alt={caller.name}
            size="xl"
            className="w-24 h-24 border-4 border-zinc-800 shadow-2xl relative z-10"
          />
        </div>

        {/* Caller Details */}
        <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{caller.name}</h3>
        <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold mb-6">
          {callType === 'video' ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>Incoming {callType === 'video' ? 'Video' : 'Voice'} Call...</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8 w-full pt-4 border-t border-zinc-800/80">
          {/* Decline Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onReject}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl transition-all duration-200 active:scale-90 ring-4 ring-rose-600/30"
              title="Decline Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-xs text-zinc-400 font-medium">Decline</span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onAccept}
              className="p-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl transition-all duration-200 active:scale-90 ring-4 ring-emerald-600/30 animate-bounce"
              title="Accept Call"
            >
              <Phone className="w-6 h-6" />
            </button>
            <span className="text-xs text-zinc-400 font-medium">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
};
