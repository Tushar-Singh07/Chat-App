import React, { useState } from 'react';
import { CircleDashed, Plus, Eye, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { StatusList } from '../components/status/StatusList';
import { StatusViewer } from '../components/status/StatusViewer';
import { CreateStatus } from '../components/status/CreateStatus';
import type { Status, StatusFontStyle } from '../types';

export const StatusPage: React.FC = () => {
  const { statuses, currentUser, addStatus } = useApp();
  const { addToast } = useToast();

  const [activeViewerStatus, setActiveViewerStatus] = useState<Status | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState<'camera' | 'gallery' | 'text' | null>(null);

  const handleOpenCreate = (mode?: 'camera' | 'gallery' | 'text') => {
    setCreateInitialMode(mode || null);
    setIsCreateModalOpen(true);
  };

  const handlePostTextStatus = (text: string, bgColor: string, fontStyle: StatusFontStyle) => {
    addStatus({
      mediaType: 'text',
      text,
      bgColor,
      fontStyle,
    });
    addToast({
      type: 'success',
      title: 'Status Posted',
      description: 'Your text status was shared successfully',
    });
  };

  const handlePostMediaStatus = (mediaUrl: string, mediaType: 'image' | 'video', caption: string) => {
    addStatus({
      mediaUrl,
      mediaType,
      caption,
    });
    addToast({
      type: 'success',
      title: 'Status Posted',
      description: `Your ${mediaType} status was shared successfully`,
    });
  };

  return (
    <div className="flex w-full h-full overflow-hidden bg-white dark:bg-[#111b21]">
      {/* ----------------- STATUS LIST SIDEBAR / FEED ----------------- */}
      <StatusList
        currentUser={currentUser}
        statuses={statuses}
        selectedStatus={activeViewerStatus}
        onSelectStatus={(status) => setActiveViewerStatus(status)}
        onOpenCreateModal={handleOpenCreate}
      />

      {/* ----------------- DESKTOP MAIN PLACEHOLDER / PREVIEW PANEL ----------------- */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative p-6 border-l border-zinc-200 dark:border-[#222d34]">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-xl">
            <CircleDashed className="w-10 h-10 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Status Updates</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Click on any contact's status to view updates or tap the plus icon to add your own status update.
            </p>
          </div>

          <button
            onClick={() => handleOpenCreate('text')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-md transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create Status
          </button>
        </div>
      </div>

      {/* ----------------- FULL SCREEN STATUS VIEWER MODAL ----------------- */}
      {activeViewerStatus && (
        <StatusViewer
          statuses={statuses}
          initialStatusId={activeViewerStatus.id}
          onClose={() => setActiveViewerStatus(null)}
        />
      )}

      {/* ----------------- CREATE STATUS MODAL ----------------- */}
      <CreateStatus
        isOpen={isCreateModalOpen}
        initialMode={createInitialMode}
        onClose={() => setIsCreateModalOpen(false)}
        onPostText={handlePostTextStatus}
        onPostMedia={handlePostMediaStatus}
      />
    </div>
  );
};
