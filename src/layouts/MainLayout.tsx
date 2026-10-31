import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { MobileBottomNav } from './MobileBottomNav';
import { useApp } from '../context/AppContext';
import { VoiceCallScreen } from '../components/call/VoiceCallScreen';
import { VideoCallScreen } from '../components/call/VideoCallScreen';
import { IncomingCallModal } from '../components/call/IncomingCallModal';

export const MainLayout: React.FC = () => {
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
  } = useApp();

  return (
    <div className="flex h-screen h-[100dvh] w-screen max-w-full bg-zinc-100 dark:bg-[#0b141a] text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans select-none">
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

      {/* Global Voice Call Screen */}
      <VoiceCallScreen
        isOpen={activeCallSession.type === 'voice' && !!activeCallSession.peerUser}
        peerUser={activeCallSession.peerUser}
        callState={activeCallSession.callState}
        remoteStream={activeCallSession.remoteStream}
        seconds={activeCallSession.seconds}
        isMuted={activeCallSession.isMuted}
        onToggleMute={toggleMuteCall}
        isSpeakerOn={activeCallSession.isSpeakerOn}
        onToggleSpeaker={toggleSpeakerCall}
        onEndCall={endCallSession}
        onClose={endCallSession}
      />

      {/* Global Video Call Screen */}
      <VideoCallScreen
        isOpen={activeCallSession.type === 'video' && !!activeCallSession.peerUser}
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
        onEndCall={endCallSession}
        onClose={endCallSession}
      />
    </div>
  );
};
