import React, { useState, useRef } from 'react';
import {
  User,
  Phone,
  Camera,
  Shield,
  Check,
  Edit2,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';

// Mock shared media items
const MOCK_MEDIA = [
  { id: '1', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80', title: 'Workspace setup' },
  { id: '2', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80', title: 'Design sprint' },
  { id: '3', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', title: 'Beach trip' },
  { id: '4', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80', title: 'Code review' },
  { id: '5', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', title: 'Team meeting' },
  { id: '6', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80', title: 'Dev workstation' },
];

const MOCK_LINKS = [
  { id: '1', title: 'React 19 Official Documentation', url: 'https://react.dev', domain: 'react.dev', date: 'Yesterday' },
  { id: '2', title: 'Tailwind CSS v4 Release Notes', url: 'https://tailwindcss.com', domain: 'tailwindcss.com', date: 'Sep 28' },
  { id: '3', title: 'GitHub - Project Repository', url: 'https://github.com', domain: 'github.com', date: 'Sep 25' },
];

const MOCK_DOCS = [
  { id: '1', fileName: 'Project_Specification_v2.pdf', size: '2.4 MB', type: 'PDF', date: 'Today, 10:15 AM' },
  { id: '2', fileName: 'Architecture_Diagram.png', size: '1.8 MB', type: 'PNG', date: 'Yesterday, 14:30 PM' },
  { id: '3', fileName: 'Meeting_Notes_Q3.docx', size: '420 KB', type: 'DOCX', date: 'Sep 26, 11:00 AM' },
];

export const ProfilePage: React.FC = () => {
  const { currentUser, getUserPresence } = useApp();
  const { addToast } = useToast();

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'links' | 'docs'>('media');

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const myPresence = getUserPresence(currentUser.id);

  const handleSaveName = () => {
    setIsEditingName(false);
    addToast({ type: 'success', title: 'Profile Updated', description: 'Your display name has been saved.' });
  };

  const handleSaveBio = () => {
    setIsEditingBio(false);
    addToast({ type: 'success', title: 'About Section Updated', description: 'Your bio has been saved.' });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newUrl = URL.createObjectURL(file);
    setAvatarUrl(newUrl);
    addToast({ type: 'success', title: 'Profile Picture Updated', description: 'Your avatar preview has been updated.' });
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-zinc-50 dark:bg-[#0b141a] overflow-y-auto select-none">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="px-6 py-4 bg-zinc-100 dark:bg-[#202c33] border-b border-zinc-200 dark:border-[#222d34]">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-500" />
          User Profile
        </h1>
      </div>

      <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Avatar Upload Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] shadow-sm">
          <div
            className="relative group cursor-pointer"
            onClick={() => avatarInputRef.current?.click()}
            title="Click to change profile picture"
          >
            <Avatar
              src={avatarUrl}
              alt={name}
              size="xl"
              presence={myPresence.status === 'online' ? 'online' : 'offline'}
              showPresence
              className="w-32 h-32 border-4 border-emerald-500/20 shadow-xl"
            />
            <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
              <Camera className="w-7 h-7 mb-1" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Change</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-4">{name}</h2>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold mt-1">
            {myPresence.status === 'online' ? 'ONLINE' : myPresence.lastSeen || 'OFFLINE'}
          </span>
        </div>

        {/* Profile Info Form Cards */}
        <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-6 shadow-sm">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-emerald-600 dark:text-[#00a884] uppercase tracking-wider">
              Your Name
            </label>
            <div className="flex items-center justify-between gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-zinc-100 dark:bg-[#202c33] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-base text-zinc-900 dark:text-zinc-100 font-medium">{name}</p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-[#202c33]"
                    title="Edit Name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              This is not your username or PIN. This name will be visible to your contacts.
            </p>
          </div>

          <div className="border-t border-zinc-100 dark:border-[#222d34]" />

          {/* About / Bio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-emerald-600 dark:text-[#00a884] uppercase tracking-wider">
              About
            </label>
            <div className="flex items-center justify-between gap-3">
              {isEditingBio ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-zinc-100 dark:bg-[#202c33] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveBio}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">{bio}</p>
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-[#202c33]"
                    title="Edit About"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-[#222d34]" />

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-600 dark:text-[#00a884] uppercase tracking-wider">
              Phone Number
            </label>
            <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
              <Phone className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium font-mono">{currentUser.phone}</span>
            </div>
          </div>
        </div>

        {/* ----------------- MEDIA, LINKS, AND DOCUMENTS TABS ----------------- */}
        <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#222d34] pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Shared Content
            </h3>
            {/* Tab selector */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#202c33] p-1 rounded-xl">
              <button
                onClick={() => setActiveMediaTab('media')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                  activeMediaTab === 'media'
                    ? 'bg-white dark:bg-[#111b21] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                )}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media ({MOCK_MEDIA.length})</span>
              </button>
              <button
                onClick={() => setActiveMediaTab('links')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                  activeMediaTab === 'links'
                    ? 'bg-white dark:bg-[#111b21] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                )}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Links ({MOCK_LINKS.length})</span>
              </button>
              <button
                onClick={() => setActiveMediaTab('docs')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                  activeMediaTab === 'docs'
                    ? 'bg-white dark:bg-[#111b21] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Docs ({MOCK_DOCS.length})</span>
              </button>
            </div>
          </div>

          {/* Media Grid Tab */}
          {activeMediaTab === 'media' && (
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 pt-2">
              {MOCK_MEDIA.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToast({ type: 'info', title: `Viewing ${item.title}` })}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-zinc-100 dark:bg-[#202c33] border border-zinc-200 dark:border-[#222d34]"
                >
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white font-medium truncate">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Links List Tab */}
          {activeMediaTab === 'links' && (
            <div className="space-y-2 pt-2">
              {MOCK_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#202c33] hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors border border-zinc-200 dark:border-[#222d34]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{link.title}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{link.domain} • {link.date}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          )}

          {/* Documents Tab */}
          {activeMediaTab === 'docs' && (
            <div className="space-y-2 pt-2">
              {MOCK_DOCS.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => addToast({ type: 'success', title: `Downloading ${doc.fileName}` })}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#202c33] hover:bg-zinc-100 dark:hover:bg-[#2a3942] transition-colors border border-zinc-200 dark:border-[#222d34] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0 font-bold text-[10px] uppercase">
                      {doc.type}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{doc.fileName}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{doc.size} • {doc.date}</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security badge note */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
          <Shield className="w-5 h-5 flex-shrink-0" />
          <span>Your profile information is shared securely with your active one-to-one connections.</span>
        </div>
      </div>
    </div>
  );
};
