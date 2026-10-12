import React, { useState } from 'react';
import type { Message } from '../types';
import { Modal } from './Modal';
import { SearchBar } from './SearchBar';
import { Avatar } from './Avatar';
import { useApp } from '../context/AppContext';
import { getUserById } from '../data/users';
import { useToast } from '../context/ToastContext';

interface ForwardModalProps {
  isOpen: boolean;
  message: Message | null;
  onClose: () => void;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  const { conversations, currentUser, getUserById, forwardMessage } = useApp();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');

  if (!message) return null;

  const targetConversations = conversations.filter((c) => {
    const partnerId = c.participantIds.find((id) => id !== currentUser.id) || '';
    const partner = getUserById(partnerId);
    return partner.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleForwardTo = (targetConvId: string) => {
    forwardMessage(targetConvId, message);
    onClose();
    addToast({
      type: 'success',
      title: 'Message Forwarded',
      description: 'Message sent to selected chat',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Forward Message"
      description="Select a contact to forward this message"
    >
      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search contacts"
        />

        <div className="space-y-1 max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-[#222d34]">
          {targetConversations.map((conv) => {
            const partnerId = conv.participantIds.find((id) => id !== currentUser.id) || '';
            const partner = getUserById(partnerId);

            return (
              <div
                key={conv.id}
                onClick={() => handleForwardTo(conv.id)}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#202c33] cursor-pointer transition-colors"
              >
                <Avatar src={partner.avatar} alt={partner.name} size="md" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {partner.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{partner.phone}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
