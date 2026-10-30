import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Lock, Signal } from 'lucide-react';
import type { User } from '../../types';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../Avatar';
import { CallStatus, type CallState } from './CallStatus';
import { CallTimer } from './CallTimer';
import { cn } from '../../utils/cn';

interface RemoteVideoAreaProps {
  peerUser: User;
  callState: CallState;
  isRemoteCameraOn?: boolean;
  remoteVideoRef?: React.RefObject<HTMLVideoElement | null>;
  remoteStream?: MediaStream | null;
  seconds: number;
}

export const RemoteVideoArea: React.FC<RemoteVideoAreaProps> = ({
  peerUser,
  callState,
  isRemoteCameraOn = true,
  remoteVideoRef,
  remoteStream,
  seconds,
}) => {
  const { getUserPresence } = useApp();
  const peerPresence = getUserPresence(peerUser.id);
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasLiveVideoTrack, setHasLiveVideoTrack] = useState<boolean>(false);

  // Helper to attach stream to video element with guaranteed autoplay
  const attachAndPlay = useCallback((videoEl: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!videoEl || !stream) return;

    if (videoEl.srcObject !== stream) {
      console.log('[RemoteVideoArea] Binding stream to video element:', stream.id, 'Tracks:', stream.getTracks().length);
      videoEl.srcObject = stream;
    }

    // Keep video element strictly muted to prevent browser autoplay blocks (audio is handled by dedicated <audio>)
    videoEl.muted = true;

    const vTracks = stream.getVideoTracks();
    if (vTracks.length > 0) {
      setHasLiveVideoTrack(true);
    }

    videoEl.play().catch((err) => {
      console.warn('[RemoteVideoArea] Video play error (retrying):', err.message);
      videoEl.muted = true;
      videoEl.play().catch((e) => console.error('[RemoteVideoArea] Play retry failed:', e));
    });
  }, []);

  // Monitor remoteStream changes and dynamically added tracks
  useEffect(() => {
    const videoEl = remoteVideoRef?.current || internalVideoRef.current;
    if (remoteStream) {
      attachAndPlay(videoEl, remoteStream);

      const vTracks = remoteStream.getVideoTracks();
      if (vTracks.length > 0) {
        setHasLiveVideoTrack(true);
      }

      // Dedicated audio element plays remote voice
      if (remoteAudioRef.current) {
        if (remoteAudioRef.current.srcObject !== remoteStream) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
        remoteAudioRef.current.play().catch((err) => console.warn('[RemoteVideoArea] Audio play notice:', err));
      }

      const handleTrackChange = () => {
        const currentVTracks = remoteStream.getVideoTracks();
        if (currentVTracks.length > 0) {
          setHasLiveVideoTrack(true);
        }
        const currentEl = remoteVideoRef?.current || internalVideoRef.current;
        if (currentEl) {
          attachAndPlay(currentEl, remoteStream);
        }
      };

      remoteStream.addEventListener('addtrack', handleTrackChange);
      remoteStream.addEventListener('removetrack', handleTrackChange);

      remoteStream.getVideoTracks().forEach((track) => {
        track.addEventListener('unmute', handleTrackChange);
        track.addEventListener('mute', handleTrackChange);
      });

      return () => {
        remoteStream.removeEventListener('addtrack', handleTrackChange);
        remoteStream.removeEventListener('removetrack', handleTrackChange);
        remoteStream.getVideoTracks().forEach((track) => {
          track.removeEventListener('unmute', handleTrackChange);
          track.removeEventListener('mute', handleTrackChange);
        });
      };
    }
  }, [remoteStream, remoteVideoRef, attachAndPlay]);

  const isConnected = callState === 'connected';
  const hasVideoTrack = Boolean(remoteStream && remoteStream.getVideoTracks().length > 0);
  const showVideoFeed = isConnected && isRemoteCameraOn && (hasVideoTrack || hasLiveVideoTrack);

  return (
    <div className="relative w-full h-full bg-zinc-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Hidden dedicated audio element to guarantee remote voice playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* Real WebRTC Remote Video Element - permanently muted so browser never blocks or pauses video */}
      <video
        ref={(el) => {
          internalVideoRef.current = el;
          if (remoteVideoRef && 'current' in remoteVideoRef) {
            (remoteVideoRef as any).current = el;
          }
          if (el && remoteStream) {
            attachAndPlay(el, remoteStream);
          }
        }}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={() => setHasLiveVideoTrack(true)}
        onCanPlay={() => setHasLiveVideoTrack(true)}
        onPlaying={() => setHasLiveVideoTrack(true)}
        className={cn(
          'w-full h-full object-cover absolute inset-0 transition-opacity duration-300',
          showVideoFeed ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'
        )}
      />

      {/* Top Overlay Header Bar */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
              {peerUser.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <span className="flex items-center gap-1 text-emerald-400">
                <Signal className="w-3 h-3" /> HD Video
              </span>
              <span>•</span>
              <CallStatus state={callState} isVideo />
            </div>
          </div>
        </div>

        {/* Call Timer & Encrypted badge */}
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
              <CallTimer seconds={seconds} className="text-sm font-semibold tracking-wider text-emerald-400 font-mono" />
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* Center Stage: Shown before connection OR when video feed is not yet available */}
      {!showVideoFeed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/85 backdrop-blur-md">
          {/* Avatar Ring Animation */}
          <div className="relative flex items-center justify-center mb-6">
            {callState === 'calling' && (
              <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-emerald-500/20 animate-ping" />
            )}
            {callState === 'connecting' && (
              <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-amber-500/20 animate-pulse" />
            )}
            {isConnected && (
              <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-indigo-500/20 animate-pulse" />
            )}
            <Avatar
              src={peerUser.avatar}
              alt={peerUser.name}
              size="xl"
              className="w-32 h-32 sm:w-44 sm:h-44 border-4 border-zinc-800 shadow-2xl relative z-10"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
            {peerUser.name}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mb-4">
            {peerPresence?.status === 'online' ? 'Online' : peerPresence?.lastSeen || peerUser.phone}
          </p>

          <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-zinc-200 border border-white/10">
            <CallStatus state={callState} isVideo />
          </div>

          {!isRemoteCameraOn && isConnected && (
            <p className="mt-4 text-xs text-zinc-400 bg-black/50 px-3 py-1 rounded-full border border-white/10">
              Camera is turned off
            </p>
          )}

          {isConnected && isRemoteCameraOn && !hasLiveVideoTrack && (
            <p className="mt-4 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
              Connecting video stream...
            </p>
          )}
        </div>
      )}

      {/* Bottom overlay gradient for button contrast */}
      <div className="relative z-10 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
    </div>
  );
};
