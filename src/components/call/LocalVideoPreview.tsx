import React, { useRef, useEffect, useState } from 'react';
import { CameraOff, MicOff, Move, SwitchCamera } from 'lucide-react';
import type { User } from '../../types';
import { Avatar } from '../Avatar';
import { cn } from '../../utils/cn';

interface LocalVideoPreviewProps {
  currentUser: User;
  isCameraOn: boolean;
  isMuted: boolean;
  localVideoRef?: React.RefObject<HTMLVideoElement | null>;
  localStream?: MediaStream | null;
  facingMode?: 'user' | 'environment';
  onSwitchCamera?: () => void;
  className?: string;
}

export const LocalVideoPreview: React.FC<LocalVideoPreviewProps> = ({
  currentUser,
  isCameraOn,
  isMuted,
  localVideoRef,
  localStream,
  facingMode = 'user',
  onSwitchCamera,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [position, setPosition] = useState<'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'>('bottom-right');

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef?.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => console.log('Local video play error:', err));
    }
  }, [localStream, localVideoRef]);

  // Animated canvas ambient simulation for local webcam feed fallback
  useEffect(() => {
    if (!isCameraOn || localStream) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      step += 0.03;
      const w = (canvas.width = canvas.offsetWidth || 180);
      const h = (canvas.height = canvas.offsetHeight || 240);

      // Deep emerald / teal webcam simulation gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.5, '#022c22');
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Ambient light pulse
      const shineGrad = ctx.createRadialGradient(
        w / 2 + Math.sin(step) * 25,
        h / 3 + Math.cos(step) * 15,
        10,
        w / 2,
        h / 2,
        110
      );
      shineGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      shineGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shineGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 110, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isCameraOn, localStream]);

  const togglePosition = () => {
    const posMap: Record<string, 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'> = {
      'bottom-right': 'top-right',
      'top-right': 'top-left',
      'top-left': 'bottom-left',
      'bottom-left': 'bottom-right',
    };
    setPosition((prev) => posMap[prev]);
  };

  const getPosClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-20 right-3 sm:top-24 sm:right-6';
      case 'top-left':
        return 'top-20 left-3 sm:top-24 sm:left-6';
      case 'bottom-left':
        return 'bottom-20 left-3 sm:bottom-28 sm:left-6';
      case 'bottom-right':
      default:
        return 'bottom-20 right-3 sm:bottom-28 sm:right-6';
    }
  };

  return (
    <div
      onClick={togglePosition}
      className={cn(
        'absolute z-30 w-28 h-40 sm:w-36 md:w-44 sm:h-52 md:h-60 rounded-2xl shadow-2xl border-2 border-white/20 bg-zinc-900 overflow-hidden cursor-pointer transition-all duration-300 group hover:scale-105 active:scale-95 select-none touch-none',
        getPosClasses(),
        className
      )}
      title="Click to reposition preview"
    >
      {/* Real WebRTC Local Video Stream Element */}
      {/* NOTE: Mirror horizontally (-scale-x-100) only for selfie/user camera, keep normal (scale-x-100) for rear/environment camera */}
      <video
        ref={(el) => {
          if (localVideoRef && 'current' in localVideoRef) {
            (localVideoRef as any).current = el;
          }
          if (el && localStream && el.srcObject !== localStream) {
            el.srcObject = localStream;
            el.play().catch(console.warn);
          }
        }}
        autoPlay
        muted
        playsInline
        className={cn(
          'w-full h-full object-cover absolute inset-0 z-10 transition-transform duration-300',
          isCameraOn ? 'block' : 'hidden',
          facingMode === 'user' ? '-scale-x-100' : 'scale-x-100'
        )}
      />

      {isCameraOn ? (
        /* Camera ON: Simulated canvas overlay if no stream */
        !localStream && (
          <div className="relative w-full h-full z-0">
            <canvas
              ref={canvasRef}
              className={cn(
                'w-full h-full object-cover transition-transform duration-300',
                facingMode === 'user' ? '-scale-x-100' : 'scale-x-100'
              )}
            />
          </div>
        )
      ) : (
        /* Camera OFF: Show User Avatar instead of video preview */
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-2 text-center relative border border-zinc-800">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.name}
            size="lg"
            className="w-14 h-14 sm:w-20 sm:h-20 border-2 border-zinc-700 shadow-md mb-1"
          />
          <span className="text-[11px] font-medium text-zinc-300 truncate max-w-full">You</span>
          <div className="absolute top-2 right-2 p-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <CameraOff className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Top Left "You" Badge with active camera mode indicator */}
      {isCameraOn && (
        <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white tracking-wider border border-white/10 flex items-center gap-1 shadow-xs pointer-events-none">
          <span>You</span>
          <span className="text-emerald-400 font-normal">({facingMode === 'environment' ? 'Rear' : 'Selfie'})</span>
        </div>
      )}

      {/* Quick Flip Camera Button on Local Video Preview */}
      {onSwitchCamera && isCameraOn && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSwitchCamera();
          }}
          className="absolute bottom-2 left-2 z-30 p-1.5 rounded-full bg-black/75 hover:bg-black text-emerald-400 hover:text-white backdrop-blur-md border border-white/20 transition-all active:scale-90 shadow-lg"
          title={facingMode === 'environment' ? 'Switch to Selfie Camera' : 'Switch to Rear Camera'}
        >
          <SwitchCamera className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Mic Muted Overlay Badge */}
      {isMuted && (
        <div className="absolute bottom-2 right-2 z-20 p-1.5 rounded-full bg-rose-600 text-white shadow-md ring-2 ring-black/40">
          <MicOff className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Move Hint Icon on Hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-black/70 text-white z-20 pointer-events-none">
        <Move className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

