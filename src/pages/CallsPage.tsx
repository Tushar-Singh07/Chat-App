import React, { useState } from 'react';
import { Phone, Video, PhoneOutgoing } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { getUserById } from '../data/users';
import { useToast } from '../context/ToastContext';
import { CallList } from '../components/call/CallList';
import { CallTypeIcon } from '../components/call/CallTypeIcon';
import type { Call } from '../types';

export const CallsPage: React.FC = () => {
  const { calls, currentUser, getUserById, startVoiceCall, startVideoCall } = useApp();
  const { addToast } = useToast();
  const [selectedCall, setSelectedCall] = useState<Call | null>(calls[0] || null);

  const selectedPeer = selectedCall
    ? getUserById(
        selectedCall.callerId === currentUser.id
          ? selectedCall.receiverId
          : selectedCall.callerId
      )
    : null;

  return (
    <div className="flex w-full h-full overflow-hidden bg-white dark:bg-[#111b21]">
      {/* ----------------- REUSABLE CALL LIST SIDEBAR ----------------- */}
      <CallList
        calls={calls}
        currentUser={currentUser}
        selectedCall={selectedCall}
        onSelectCall={(call) => setSelectedCall(call)}
        onVoiceCall={(peer) => startVoiceCall(peer)}
        onVideoCall={(peer) => startVideoCall(peer)}
        onNewCall={() => addToast({ type: 'info', title: 'Select a contact to start a call' })}
      />

      {/* ----------------- CALL DETAILS DESKTOP MAIN PANEL ----------------- */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-[#0b141a] p-8 text-center border-l border-zinc-200 dark:border-[#222d34]">
        {selectedCall && selectedPeer ? (
          <div className="flex flex-col items-center max-w-sm w-full bg-white dark:bg-[#111b21] p-8 rounded-3xl border border-zinc-200 dark:border-[#222d34] shadow-xl animate-in zoom-in-95 duration-200">
            <Avatar
              src={selectedPeer.avatar}
              alt={selectedPeer.name}
              size="xl"
              presence={selectedPeer.presence}
              showPresence
              className="mb-4"
            />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {selectedPeer.name}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 font-mono">
              {selectedPeer.phone}
            </p>

            {/* Call Status Badge */}
            <div className="w-full py-3 px-4 bg-zinc-100 dark:bg-[#202c33] rounded-2xl flex items-center justify-between text-xs font-medium mb-6">
              <CallTypeIcon
                type={selectedCall.type}
                status={selectedCall.status}
                isOutgoing={selectedCall.callerId === currentUser.id}
              />
              <span className="text-zinc-500 dark:text-zinc-400 font-mono">
                {selectedCall.duration || selectedCall.timestamp}
              </span>
            </div>

            {/* Action Buttons to trigger Voice / Video Call */}
            <div className="flex items-center justify-center gap-4 w-full">
              <button
                onClick={() => startVoiceCall(selectedPeer)}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-transform active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Voice Call</span>
              </button>

              <button
                onClick={() => startVideoCall(selectedPeer)}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/30 font-semibold text-sm transition-transform active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Video Call</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-zinc-400">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
              <Phone className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-1">Call Logs</h3>
            <p className="text-xs text-zinc-400">Select a call log from the sidebar to view details and start a call</p>
          </div>
        )}
      </div>
    </div>
  );
};
