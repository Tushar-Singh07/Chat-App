import React from 'react';
import { CircleDashed, Plus, Camera, Image, Type } from 'lucide-react';
import type { User, Status } from '../../types';
import { StatusItem } from './StatusItem';
import { useApp } from '../../context/AppContext';

interface StatusListProps {
  currentUser: User;
  statuses: Status[];
  selectedStatus: Status | null;
  onSelectStatus: (status: Status) => void;
  onOpenCreateModal: (type?: 'camera' | 'gallery' | 'text') => void;
}

export const StatusList: React.FC<StatusListProps> = ({
  currentUser,
  statuses,
  selectedStatus,
  onSelectStatus,
  onOpenCreateModal,
}) => {
  const { getUserById } = useApp();
  // My Status (if user has active status)
  const myStatus = statuses.find((s) => s.userId === currentUser.id);

  // Group contact statuses into Recent (unviewed by current user) and Viewed
  const contactStatuses = statuses.filter((s) => s.userId !== currentUser.id);

  const recentUpdates: { status: Status; user: User }[] = [];
  const viewedUpdates: { status: Status; user: User }[] = [];

  contactStatuses.forEach((s) => {
    const user = getUserById(s.userId);
    const isViewed = s.viewers.some((v) => v.userId === currentUser.id);
    if (isViewed) {
      viewedUpdates.push({ status: s, user });
    } else {
      recentUpdates.push({ status: s, user });
    }
  });

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col h-full border-r border-zinc-200 dark:border-[#222d34] flex-shrink-0 z-20 bg-white dark:bg-[#111b21]">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-zinc-50 dark:bg-[#202c33] border-b border-zinc-200 dark:border-[#222d34] flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <CircleDashed className="w-5 h-5 text-emerald-500" />
          Status
        </h1>

        {/* Quick Add Status Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenCreateModal('text')}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#111b21] transition-colors"
            title="Create Text Status"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenCreateModal('camera')}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#111b21] transition-colors"
            title="Camera Status"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenCreateModal('gallery')}
            className="p-2 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            title="Add Media Status"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Status Section Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* ----------------- MY STATUS SECTION ----------------- */}
        <div>
          <h2 className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 mb-2 tracking-wider px-1">
            My Status
          </h2>
          <StatusItem
            user={currentUser}
            status={myStatus}
            isMine
            isSelected={selectedStatus?.id === myStatus?.id}
            onClick={() => {
              if (myStatus) {
                onSelectStatus(myStatus);
              } else {
                onOpenCreateModal();
              }
            }}
            onAddStatus={() => onOpenCreateModal()}
          />
        </div>

        {/* ----------------- RECENT UPDATES SECTION ----------------- */}
        {recentUpdates.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 mb-2 tracking-wider px-1">
              Recent Updates
            </h2>
            <div className="space-y-1">
              {recentUpdates.map(({ status, user }) => (
                <StatusItem
                  key={status.id}
                  user={user}
                  status={status}
                  isViewed={false}
                  isSelected={selectedStatus?.id === status.id}
                  onClick={() => onSelectStatus(status)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ----------------- VIEWED UPDATES SECTION ----------------- */}
        {viewedUpdates.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500 mb-2 tracking-wider px-1">
              Viewed Updates
            </h2>
            <div className="space-y-1">
              {viewedUpdates.map(({ status, user }) => (
                <StatusItem
                  key={status.id}
                  user={user}
                  status={status}
                  isViewed={true}
                  isSelected={selectedStatus?.id === status.id}
                  onClick={() => onSelectStatus(status)}
                />
              ))}
            </div>
          </div>
        )}

        {recentUpdates.length === 0 && viewedUpdates.length === 0 && (
          <div className="text-center py-8 text-zinc-400 text-xs">
            No contact status updates available
          </div>
        )}
      </div>
    </div>
  );
};
