import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  MoreVertical,
  UserPlus,
  Grid,
  Video,
  VideoOff,
  ScreenShare,
  Sparkles,
  SwitchCamera,
} from 'lucide-react';
import { Dropdown } from '../Dropdown';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

interface CallControlsProps {
  onEndCall: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isSpeakerOn?: boolean;
  onToggleSpeaker?: () => void;
  isVideoCall?: boolean;
  isCameraOn?: boolean;
  onToggleCamera?: () => void;
  facingMode?: 'user' | 'environment';
  onSwitchCamera?: () => void;
  className?: string;
}

export const CallControls: React.FC<CallControlsProps> = ({
  onEndCall,
  isMuted: propIsMuted,
  onToggleMute,
  isSpeakerOn: propIsSpeakerOn,
  onToggleSpeaker,
  isVideoCall = false,
  isCameraOn: propIsCameraOn,
  onToggleCamera,
  facingMode = 'user',
  onSwitchCamera,
  className,
}) => {
  const { addToast } = useToast();

  // Internal state fallbacks if props are not controlled
  const [internalMuted, setInternalMuted] = useState(false);
  const [internalSpeaker, setInternalSpeaker] = useState(true);
  const [internalCamera, setInternalCamera] = useState(true);

  const isMuted = propIsMuted !== undefined ? propIsMuted : internalMuted;
  const isSpeakerOn = propIsSpeakerOn !== undefined ? propIsSpeakerOn : internalSpeaker;
  const isCameraOn = propIsCameraOn !== undefined ? propIsCameraOn : internalCamera;

  const handleToggleMute = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      setInternalMuted(!internalMuted);
      addToast({
        type: 'info',
        title: !internalMuted ? 'Microphone Muted' : 'Microphone Unmuted',
      });
    }
  };

  const handleToggleSpeaker = () => {
    if (onToggleSpeaker) {
      onToggleSpeaker();
    } else {
      setInternalSpeaker(!internalSpeaker);
      addToast({
        type: 'info',
        title: !internalSpeaker ? 'Speaker On' : 'Speaker Off',
      });
    }
  };

  const handleToggleCamera = () => {
    if (onToggleCamera) {
      onToggleCamera();
    } else {
      setInternalCamera(!internalCamera);
      addToast({
        type: 'info',
        title: !internalCamera ? 'Camera Turned On' : 'Camera Turned Off',
      });
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-2 sm:gap-4 select-none', className)}>
      {/* Microphone Toggle Button */}
      <button
        onClick={handleToggleMute}
        className={cn(
          'p-2.5 sm:p-3.5 rounded-full transition-all duration-200 active:scale-90 shadow-lg',
          isMuted
            ? 'bg-rose-600 text-white ring-4 ring-rose-600/30'
            : 'bg-white/15 text-white hover:bg-white/25'
        )}
        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* Camera Toggle Button (for Video Call) */}
      {isVideoCall && (
        <button
          onClick={handleToggleCamera}
          className={cn(
            'p-2.5 sm:p-3.5 rounded-full transition-all duration-200 active:scale-90 shadow-lg',
            !isCameraOn
              ? 'bg-rose-600 text-white ring-4 ring-rose-600/30'
              : 'bg-white/15 text-white hover:bg-white/25'
          )}
          title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {!isCameraOn ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      )}

      {/* Switch Camera Button (Selfie <-> Rear) */}
      {isVideoCall && onSwitchCamera && (
        <button
          onClick={onSwitchCamera}
          className={cn(
            'p-2.5 sm:p-3.5 rounded-full transition-all duration-200 active:scale-90 shadow-lg',
            'bg-white/15 text-white hover:bg-white/25 ring-2 ring-white/10'
          )}
          title={facingMode === 'environment' ? 'Switch to Selfie (Front) Camera' : 'Switch to Rear (Back) Camera'}
        >
          <SwitchCamera className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
        </button>
      )}

      {/* Speaker Toggle Button */}
      <button
        onClick={handleToggleSpeaker}
        className={cn(
          'p-2.5 sm:p-3.5 rounded-full transition-all duration-200 active:scale-90 shadow-lg',
          isSpeakerOn
            ? 'bg-white/25 text-white ring-4 ring-white/20'
            : 'bg-white/15 text-white hover:bg-white/25'
        )}
        title={isSpeakerOn ? 'Speaker Off' : 'Speaker On'}
      >
        {isSpeakerOn ? <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* More Options Dropdown */}
      <Dropdown
        align="left"
        trigger={
          <button
            className="p-2.5 sm:p-3.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-all duration-200 active:scale-90 shadow-lg"
            title="More Options"
          >
            <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        }
        items={[
          {
            id: '1',
            label: 'Add Participant',
            icon: <UserPlus className="w-4 h-4" />,
            onClick: () => addToast({ type: 'info', title: 'Add participant to call' }),
          },
          ...(isVideoCall
            ? [
                {
                  id: 'screen-share',
                  label: 'Share Screen (Simulation)',
                  icon: <ScreenShare className="w-4 h-4" />,
                  onClick: () => addToast({ type: 'info', title: 'Screen sharing started' }),
                },
                {
                  id: 'effects',
                  label: 'Background Effects',
                  icon: <Sparkles className="w-4 h-4" />,
                  onClick: () => addToast({ type: 'info', title: 'Background blur toggled' }),
                },
              ]
            : []),
          {
            id: 'keypad',
            label: 'Keypad',
            icon: <Grid className="w-4 h-4" />,
            onClick: () => addToast({ type: 'info', title: 'Keypad drawer opened' }),
          },
        ]}
      />

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className="p-2.5 sm:p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl transition-all duration-200 active:scale-90 ring-4 ring-rose-600/40 ml-0.5 sm:ml-1"
        title="End Call"
      >
        <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};
