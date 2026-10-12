import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import type { User } from '../../types';
import { Avatar } from '../Avatar';
import { CallStatus } from './CallStatus';
import type { CallState } from './CallStatus';
import { CallTimer } from './CallTimer';
import { CallControls } from './CallControls';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';

interface VoiceCallScreenProps {
  isOpen: boolean;
  peerUser: User | null;
  onClose: (durationSecs: number) => void;
  callState?: CallState;
  remoteStream?: MediaStream | null;
  seconds?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isSpeakerOn?: boolean;
  onToggleSpeaker?: () => void;
  onEndCall?: () => void;
}

export const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({
  isOpen,
  peerUser,
  onClose,
  callState: propCallState,
  remoteStream,
  seconds: propSeconds,
  isMuted,
  onToggleMute,
  isSpeakerOn,
  onToggleSpeaker,
  onEndCall: propOnEndCall,
}) => {
  const { addToast } = useToast();
  const { getUserPresence } = useApp();
  const [internalCallState, setInternalCallState] = useState<CallState>('calling');
  const [internalSeconds, setInternalSeconds] = useState(0);

  const callState = propCallState !== undefined ? propCallState : internalCallState;
  const seconds = propSeconds !== undefined ? propSeconds : internalSeconds;

  const peerPresence = peerUser ? getUserPresence(peerUser.id) : null;
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Attach real remote WebRTC stream to audio element
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((err) => console.log('[VoiceCall] Audio play error:', err));
    }
  }, [remoteStream]);

  // Internal fallback timer if propSeconds is not controlled externally
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isOpen && callState === 'connected' && propSeconds === undefined) {
      timer = setInterval(() => {
        setInternalSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, callState, propSeconds]);

  if (!isOpen || !peerUser) return null;

  const handleEndCall = () => {
    if (propOnEndCall) {
      propOnEndCall();
    } else {
      setInternalCallState('ended');
      addToast({
        type: 'info',
        title: 'Call Ended',
        description: seconds > 0 ? `Duration: ${Math.floor(seconds / 60)}m ${seconds % 60}s` : 'Call ended',
      });
      setTimeout(() => {
        onClose(seconds);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 text-white p-8 select-none animate-in fade-in duration-200 chat-bg-pattern">
      {/* Hidden Remote Audio Element for WebRTC MediaStream */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* Top Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-zinc-200">SecureConnect Voice</span>
        </div>
        <div className="flex items-center gap-1 opacity-70">
          <Lock className="w-3.5 h-3.5" />
          <span>End-to-end Encrypted</span>
        </div>
      </div>

      {/* Main Avatar & Call Info Stage */}
      <div className="flex flex-col items-center justify-center text-center my-auto space-y-6">
        {/* Avatar with Ripple Glow Rings */}
        <div className="relative flex items-center justify-center">
          {callState === 'connected' && (
            <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 animate-ping" />
          )}
          {callState === 'calling' && (
            <div className="absolute w-44 h-44 rounded-full bg-white/10 animate-pulse" />
          )}
          <Avatar
            src={peerUser.avatar}
            alt={peerUser.name}
            size="xl"
            className="w-32 h-32 border-4 border-zinc-800 shadow-2xl relative z-10"
          />
        </div>

        {/* Contact Info */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">{peerUser.name}</h2>
          <p className="text-xs text-zinc-400">
            {peerPresence?.status === 'online' ? 'Online' : peerPresence?.lastSeen || peerUser.phone}
          </p>
        </div>

        {/* Call Status & Timer */}
        <div className="space-y-2 pt-2">
          <CallStatus state={callState} />
          {callState === 'connected' && <CallTimer seconds={seconds} />}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="py-6 border-t border-zinc-900">
        <CallControls
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          isSpeakerOn={isSpeakerOn}
          onToggleSpeaker={onToggleSpeaker}
          onEndCall={handleEndCall}
        />
      </div>
    </div>
  );
};
