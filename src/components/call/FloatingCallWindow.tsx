import React, { useRef, useEffect, useState } from 'react';
import {
  Maximize2,
  Mic,
  MicOff,
  PhoneOff,
  SwitchCamera,
  VideoOff,
  Move,
} from 'lucide-react';
import type { ActiveCallSession } from '../../context/AppContext';
import { Avatar } from '../Avatar';
import { CallTimer } from './CallTimer';
import { cn } from '../../utils/cn';

interface FloatingCallWindowProps {
  callSession: ActiveCallSession;
  onMaximize: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera?: () => void;
  onSwitchCamera?: () => void;
  facingMode?: 'user' | 'environment';
}

export const FloatingCallWindow: React.FC<FloatingCallWindowProps> = ({
  callSession,
  onMaximize,
  onEndCall,
  onToggleMute,
  onToggleCamera,
  onSwitchCamera,
  facingMode = 'user',
}) => {
  const { peerUser, type, seconds, isMuted, isCameraOn, remoteStream, callState } = callSession;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [position, setPosition] = useState<'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'>('bottom-right');

  // Attach WebRTC remoteStream to video element with guaranteed autoplay
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      if (videoRef.current.srcObject !== remoteStream) {
        videoRef.current.srcObject = remoteStream;
      }
      videoRef.current.muted = true; // Permanently muted (audio is handled by MainLayout master audio element)
      videoRef.current.play().catch((err) => console.log('[FloatingCallWindow] Video play notice:', err));
    }
  }, [remoteStream]);

  if (!peerUser || !callSession.callId) return null;

  const isVideo = type === 'video';
  const hasVideoTrack = Boolean(remoteStream && remoteStream.getVideoTracks().length > 0);
  const isConnected = callState === 'connected';

  const togglePosition = () => {
    const posMap: Record<string, 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'> = {
      'bottom-right': 'bottom-left',
      'bottom-left': 'top-left',
      'top-left': 'top-right',
      'top-right': 'bottom-right',
    };
    setPosition((prev) => posMap[prev]);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-16 right-4 sm:top-20 sm:right-6';
      case 'top-left':
        return 'top-16 left-4 sm:top-20 sm:left-6';
      case 'bottom-left':
        return 'bottom-20 left-4 sm:bottom-6 sm:left-6';
      case 'bottom-right':
      default:
        return 'bottom-20 right-4 sm:bottom-6 sm:right-6';
    }
  };

  // ----------------- VOICE CALL FLOATING PILL -----------------
  if (!isVideo) {
    return (
      <div
        className={cn(
          'fixed z-50 flex items-center gap-3 bg-zinc-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-full px-4 py-2.5 shadow-2xl text-white select-none transition-all duration-300 animate-in fade-in zoom-in-95 hover:border-emerald-400 group',
          getPositionClasses()
        )}
      >
        {/* Clickable Area to Expand Call */}
        <div
          onClick={onMaximize}
          className="flex items-center gap-3 cursor-pointer"
          title="Click to return to full-screen call"
        >
          <div className="relative">
            <Avatar
              src={peerUser.avatar}
              alt={peerUser.name}
              size="sm"
              className="w-9 h-9 border-2 border-emerald-500/80"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900 animate-pulse" />
          </div>
          <div className="min-w-0 pr-1">
            <div className="text-xs font-bold text-white truncate max-w-[110px] leading-tight">
              {peerUser.name}
            </div>
            <div className="text-[11px] font-mono text-emerald-400">
              {isConnected ? <CallTimer seconds={seconds} /> : 'Connecting...'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-700/80">
          <button
            type="button"
            onClick={onToggleMute}
            className={cn(
              'p-2 rounded-full transition-all active:scale-90',
              isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-zinc-200'
            )}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onMaximize}
            className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-90"
            title="Maximize call"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onEndCall}
            className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all active:scale-90"
            title="End call"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ----------------- VIDEO CALL FLOATING MINI WINDOW -----------------
  return (
    <div
      className={cn(
        'fixed z-50 w-36 h-52 sm:w-52 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/60 bg-zinc-950 backdrop-blur-xl flex flex-col justify-between select-none transition-all duration-300 animate-in fade-in zoom-in-95 group hover:border-emerald-400 hover:shadow-emerald-500/25',
        getPositionClasses()
      )}
    >
      {/* Real WebRTC Remote Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          'w-full h-full object-cover absolute inset-0 z-0 transition-opacity duration-300',
          hasVideoTrack && isConnected ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Fallback Avatar when video is not active */}
      {(!hasVideoTrack || !isConnected) && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-3 bg-zinc-900 text-center">
          <Avatar
            src={peerUser.avatar}
            alt={peerUser.name}
            size="md"
            className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-emerald-500/80 shadow-lg mb-2"
          />
          <span className="text-xs font-semibold text-white truncate max-w-[100px]">
            {peerUser.name}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5">
            {isConnected ? <CallTimer seconds={seconds} /> : 'Connecting...'}
          </span>
        </div>
      )}

      {/* Top Header Overlay Bar */}
      <div className="relative z-20 flex items-center justify-between p-2 sm:p-2.5 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <div
          onClick={onMaximize}
          className="flex flex-col min-w-0 cursor-pointer pr-1"
          title="Click to maximize call"
        >
          <span className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[80px] sm:max-w-[120px] leading-tight">
            {peerUser.name}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 leading-tight">
            {isConnected ? <CallTimer seconds={seconds} /> : 'Call in progress'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Reposition corner button */}
          <button
            type="button"
            onClick={togglePosition}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white backdrop-blur-xs transition-transform active:scale-90"
            title="Move call window to another corner"
          >
            <Move className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>

          {/* Full Screen Maximize Button */}
          <button
            type="button"
            onClick={onMaximize}
            className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-transform active:scale-90"
            title="Back to full-screen call"
          >
            <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Click Area to Expand Video */}
      <div
        onClick={onMaximize}
        className="flex-1 w-full relative z-10 cursor-pointer"
        title="Click anywhere to return to full-screen call"
      />

      {/* Bottom Floating Controls Overlay */}
      <div className="relative z-20 flex items-center justify-around p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        {/* Mute Button */}
        <button
          type="button"
          onClick={onToggleMute}
          className={cn(
            'p-2 rounded-full transition-transform active:scale-90 shadow-md',
            isMuted ? 'bg-rose-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
          )}
          title={isMuted ? 'Unmute mic' : 'Mute mic'}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Switch Camera Button */}
        {onSwitchCamera && isCameraOn && (
          <button
            type="button"
            onClick={onSwitchCamera}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-emerald-400 shadow-md transition-transform active:scale-90"
            title={facingMode === 'environment' ? 'Switch to Selfie' : 'Switch to Rear'}
          >
            <SwitchCamera className="w-3.5 h-3.5" />
          </button>
        )}

        {/* End Call Button */}
        <button
          type="button"
          onClick={onEndCall}
          className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform active:scale-90"
          title="End call"
        >
          <PhoneOff className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
