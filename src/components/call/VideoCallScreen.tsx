import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { RemoteVideoArea } from './RemoteVideoArea';
import { LocalVideoPreview } from './LocalVideoPreview';
import { CallControls } from './CallControls';
import type { CallState } from './CallStatus';

interface VideoCallScreenProps {
  isOpen: boolean;
  peerUser: User | null;
  onClose: (durationSecs: number) => void;
  callState?: CallState;
  remoteStream?: MediaStream | null;
  localStream?: MediaStream | null;
  seconds?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isCameraOn?: boolean;
  onToggleCamera?: () => void;
  isSpeakerOn?: boolean;
  onToggleSpeaker?: () => void;
  facingMode?: 'user' | 'environment';
  onSwitchCamera?: () => void;
  onEndCall?: () => void;
}

export const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  isOpen,
  peerUser,
  onClose,
  callState: propCallState,
  remoteStream,
  localStream,
  seconds: propSeconds,
  isMuted: propIsMuted,
  onToggleMute: propOnToggleMute,
  isCameraOn: propIsCameraOn,
  onToggleCamera: propOnToggleCamera,
  isSpeakerOn: propIsSpeakerOn,
  onToggleSpeaker: propOnToggleSpeaker,
  facingMode = 'user',
  onSwitchCamera,
  onEndCall: propOnEndCall,
}) => {
  const { currentUser } = useApp();
  const { addToast } = useToast();

  const [internalCallState, setInternalCallState] = useState<CallState>('calling');
  const [internalMuted, setInternalMuted] = useState(false);
  const [internalCameraOn, setInternalCameraOn] = useState(true);
  const [internalSpeakerOn, setInternalSpeakerOn] = useState(true);
  const [internalSeconds, setInternalSeconds] = useState(0);

  const callState = propCallState !== undefined ? propCallState : internalCallState;
  const seconds = propSeconds !== undefined ? propSeconds : internalSeconds;
  const isMuted = propIsMuted !== undefined ? propIsMuted : internalMuted;
  const isCameraOn = propIsCameraOn !== undefined ? propIsCameraOn : internalCameraOn;
  const isSpeakerOn = propIsSpeakerOn !== undefined ? propIsSpeakerOn : internalSpeakerOn;

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Fallback internal timer
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

  const handleToggleMute = () => {
    if (propOnToggleMute) {
      propOnToggleMute();
    } else {
      setInternalMuted((prev) => {
        const next = !prev;
        addToast({ type: 'info', title: next ? 'Microphone Muted' : 'Microphone Unmuted' });
        return next;
      });
    }
  };

  const handleToggleCamera = () => {
    if (propOnToggleCamera) {
      propOnToggleCamera();
    } else {
      setInternalCameraOn((prev) => {
        const next = !prev;
        addToast({ type: 'info', title: next ? 'Camera Off' : 'Camera On' });
        return next;
      });
    }
  };

  const handleToggleSpeaker = () => {
    if (propOnToggleSpeaker) {
      propOnToggleSpeaker();
    } else {
      setInternalSpeakerOn((prev) => {
        const next = !prev;
        addToast({ type: 'info', title: next ? 'Speaker On' : 'Speaker Off' });
        return next;
      });
    }
  };

  const handleEndCall = () => {
    if (propOnEndCall) {
      propOnEndCall();
    } else {
      setInternalCallState('ended');
      addToast({
        type: 'info',
        title: 'Video Call Ended',
        description: seconds > 0 ? `Duration: ${Math.floor(seconds / 60)}m ${seconds % 60}s` : 'Call ended',
      });
      setTimeout(() => {
        onClose(seconds);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 text-white select-none animate-in fade-in duration-200 overflow-hidden w-full h-full h-[100dvh] max-w-full max-h-full">
      {/* ----------------- REMOTE VIDEO (LARGE AREA) ----------------- */}
      <RemoteVideoArea
        peerUser={peerUser}
        callState={callState}
        isRemoteCameraOn={true}
        remoteVideoRef={remoteVideoRef}
        remoteStream={remoteStream}
        seconds={seconds}
      />

      {/* ----------------- LOCAL VIDEO PREVIEW (CORNER OVERLAY) ----------------- */}
      <LocalVideoPreview
        currentUser={currentUser}
        isCameraOn={isCameraOn}
        isMuted={isMuted}
        localVideoRef={localVideoRef}
        localStream={localStream}
        facingMode={facingMode}
        onSwitchCamera={onSwitchCamera}
      />

      {/* ----------------- CALL CONTROLS BAR (BOTTOM CENTER) ----------------- */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-auto pb-[env(safe-area-inset-bottom,0px)]">
        <div className="bg-zinc-900/85 backdrop-blur-xl px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-full border border-white/10 shadow-2xl max-w-[96vw] overflow-x-auto no-scrollbar">
          <CallControls
            isVideoCall
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            isCameraOn={isCameraOn}
            onToggleCamera={handleToggleCamera}
            isSpeakerOn={isSpeakerOn}
            onToggleSpeaker={handleToggleSpeaker}
            facingMode={facingMode}
            onSwitchCamera={onSwitchCamera}
            onEndCall={handleEndCall}
          />
        </div>
      </div>
    </div>
  );
};
