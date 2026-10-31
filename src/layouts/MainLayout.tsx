import React, { useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { MobileBottomNav } from './MobileBottomNav';
import { useApp } from '../context/AppContext';
import { VoiceCallScreen } from '../components/call/VoiceCallScreen';
import { VideoCallScreen } from '../components/call/VideoCallScreen';
import { FloatingCallWindow } from '../components/call/FloatingCallWindow';
import { IncomingCallModal } from '../components/call/IncomingCallModal';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const {
    incomingCallData,
    activeCallSession,
    acceptIncomingCall,
    rejectIncomingCall,
    endCallSession,
    toggleMuteCall,
    toggleCameraCall,
    toggleSpeakerCall,
    switchCameraCall,
    minimizeCall,
    maximizeCall,
  } = useApp();

  const globalAudioRef = useRef<HTMLAudioElement | null>(null);

  // Guarantee persistent remote audio playback across full-screen, minimized window, and routing
  useEffect(() => {
    if (globalAudioRef.current && activeCallSession.remoteStream) {
      if (globalAudioRef.current.srcObject !== activeCallSession.remoteStream) {
        globalAudioRef.current.srcObject = activeCallSession.remoteStream;
      }
      globalAudioRef.current.play().catch((err) => console.log('[MainLayout] Audio play notice:', err));
    }
  }, [activeCallSession.remoteStream]);

  const handleMinimize = () => {
    minimizeCall();
    if (activeCallSession.conversationId) {
      navigate(`/chat/${activeCallSession.conversationId}`);
    }
  };

  const isCallActive = Boolean(activeCallSession.callId && activeCallSession.peerUser);
  const isMinimized = Boolean(activeCallSession.isMinimized);

  return (
    <div className="flex h-screen h-[100dvh] w-screen max-w-full bg-zinc-100 dark:bg-[#0b141a] text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans select-none">
      {/* Persistent Global WebRTC Audio Element */}
      <audio ref={globalAudioRef} autoPlay playsInline className="hidden" />

      {/* Desktop Left Navigation Bar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarNav />
      </div>

      {/* Main Outlet View Area */}
      <main className="flex-1 flex w-full h-full max-w-full max-h-full overflow-hidden relative">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Incoming Call Overlay */}
      {incomingCallData && (
        <IncomingCallModal
          caller={incomingCallData.caller}
          callType={incomingCallData.type}
          onAccept={acceptIncomingCall}
          onReject={rejectIncomingCall}
        />
      )}

      {/* Global Full-Screen Voice Call Screen */}
      <VoiceCallScreen
        isOpen={isCallActive && activeCallSession.type === 'voice' && !isMinimized}
        peerUser={activeCallSession.peerUser}
        callState={activeCallSession.callState}
        remoteStream={activeCallSession.remoteStream}
        seconds={activeCallSession.seconds}
        isMuted={activeCallSession.isMuted}
        onToggleMute={toggleMuteCall}
        isSpeakerOn={activeCallSession.isSpeakerOn}
        onToggleSpeaker={toggleSpeakerCall}
        onMinimize={handleMinimize}
        onEndCall={endCallSession}
        onClose={endCallSession}
      />

      {/* Global Full-Screen Video Call Screen */}
      <VideoCallScreen
        isOpen={isCallActive && activeCallSession.type === 'video' && !isMinimized}
        peerUser={activeCallSession.peerUser}
        callState={activeCallSession.callState}
        remoteStream={activeCallSession.remoteStream}
        localStream={activeCallSession.localStream}
        seconds={activeCallSession.seconds}
        isMuted={activeCallSession.isMuted}
        onToggleMute={toggleMuteCall}
        isCameraOn={activeCallSession.isCameraOn}
        onToggleCamera={toggleCameraCall}
        isSpeakerOn={activeCallSession.isSpeakerOn}
        onToggleSpeaker={toggleSpeakerCall}
        facingMode={activeCallSession.facingMode || 'user'}
        onSwitchCamera={switchCameraCall}
        onMinimize={handleMinimize}
        onEndCall={endCallSession}
        onClose={endCallSession}
      />

      {/* Picture-in-Picture Floating Minimized Call Window */}
      {isCallActive && isMinimized && (
        <FloatingCallWindow
          callSession={activeCallSession}
          onMaximize={maximizeCall}
          onEndCall={endCallSession}
          onToggleMute={toggleMuteCall}
          onToggleCamera={toggleCameraCall}
          onSwitchCamera={switchCameraCall}
          facingMode={activeCallSession.facingMode || 'user'}
        />
      )}
    </div>
  );
};
