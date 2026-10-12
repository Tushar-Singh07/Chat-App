import React, { useState } from 'react';
import { Phone, PhoneOutgoing } from 'lucide-react';
import type { Call, User } from '../../types';
import { CallHistoryItem } from './CallHistoryItem';
import { SearchBar } from '../SearchBar';
import { useApp } from '../../context/AppContext';

interface CallListProps {
  calls: Call[];
  currentUser: User;
  selectedCall: Call | null;
  onSelectCall: (call: Call) => void;
  onVoiceCall: (peer: User) => void;
  onVideoCall: (peer: User) => void;
  onNewCall?: () => void;
}

export const CallList: React.FC<CallListProps> = ({
  calls,
  currentUser,
  selectedCall,
  onSelectCall,
  onVoiceCall,
  onVideoCall,
  onNewCall,
}) => {
  const { getUserById } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalls = calls.filter((c) => {
    const peerId = c.callerId === currentUser.id ? c.receiverId : c.callerId;
    const peer = getUserById(peerId);
    return peer.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col h-full border-r border-zinc-200 dark:border-[#222d34] flex-shrink-0 z-20 bg-white dark:bg-[#111b21]">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-zinc-50 dark:bg-[#202c33] border-b border-zinc-200 dark:border-[#222d34] flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Phone className="w-5 h-5 text-emerald-500" />
          Calls
        </h1>
        {onNewCall && (
          <button
            onClick={onNewCall}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#111b21] transition-colors"
            title="Start Call"
          >
            <PhoneOutgoing className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-zinc-200 dark:border-[#222d34]">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search call logs"
        />
      </div>

      {/* Call History Item Feed */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredCalls.length > 0 ? (
          filteredCalls.map((c) => (
            <CallHistoryItem
              key={c.id}
              call={c}
              currentUserId={currentUser.id}
              isSelected={selectedCall?.id === c.id}
              onClick={() => onSelectCall(c)}
              onVoiceCall={onVoiceCall}
              onVideoCall={onVideoCall}
            />
          ))
        ) : (
          <div className="text-center py-8 text-xs text-zinc-400">
            No call logs found
          </div>
        )}
      </div>
    </div>
  );
};
