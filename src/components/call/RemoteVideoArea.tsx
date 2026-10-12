import React, { useRef, useEffect } from 'react';
import { ShieldCheck, Lock, Signal } from 'lucide-react';
import type { User } from '../../types';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../Avatar';
import { CallStatus, type CallState } from './CallStatus';
import { CallTimer } from './CallTimer';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic canvas ambient video simulation for connected state
  useEffect(() => {
    if (callState !== 'connected' || !isRemoteCameraOn) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let step = 0;

    const render = () => {
      step += 0.02;
      const w = (canvas.width = canvas.offsetWidth || 640);
      const h = (canvas.height = canvas.offsetHeight || 480);

      // Deep, futuristic video gradient backdrop
      const grad = ctx.createLinearGradient(
        w / 2 + Math.sin(step) * 80,
        0,
        w / 2 + Math.cos(step) * 80,
        h
      );
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Ambient radial glow behind remote participant avatar/silhouette
      const auraGrad = ctx.createRadialGradient(
        w / 2 + Math.sin(step * 0.8) * 15,
        h / 2 + Math.cos(step * 0.8) * 12,
        20,
        w / 2,
        h / 2,
        240
      );
      auraGrad.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
      auraGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.12)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 240, 0, Math.PI * 2);
      ctx.fill();

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [callState, isRemoteCameraOn]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef?.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => console.log('Remote video play error:', err));
    }
  }, [remoteStream, remoteVideoRef]);

  const isConnected = callState === 'connected';
  const hasRemoteVideo = isConnected && isRemoteCameraOn && remoteStream;

  return (
    <div className="relative w-full h-full bg-zinc-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Real WebRTC Video Stream Element */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={isConnected && isRemoteCameraOn ? 'w-full h-full object-cover absolute inset-0 z-10' : 'hidden'}
      />

      {/* Simulated Video Canvas when connected & remote camera ON (fallback if no real stream) */}
      {isConnected && isRemoteCameraOn && !remoteStream && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

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

      {/* Center Stage: Shown before connection OR when remote camera is disabled */}
      {(!isConnected || !isRemoteCameraOn) && (
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
        </div>
      )}

      {/* Bottom overlay gradient for button contrast */}
      <div className="relative z-10 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
    </div>
  );
};
