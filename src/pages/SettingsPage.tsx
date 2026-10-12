import React, { useState } from 'react';
import {
  Settings,
  UserCheck,
  Lock,
  Bell,
  Moon,
  Sun,
  MessageSquare,
  Phone,
  HardDrive,
  HelpCircle,
  Info,
  Check,
  Volume2,
  VolumeX,
  Eye,
  Shield,
  Palette,
  Download,
  Trash2,
  Smartphone,
  Wifi,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';

type SettingsSection =
  | 'account'
  | 'privacy'
  | 'notifications'
  | 'appearance'
  | 'chats'
  | 'calls'
  | 'storage'
  | 'help'
  | 'about';

// Local storage persistent setting hook
function usePersistentState<T>(key: string, defaultValue: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistent = (val: T) => {
    setState(val);
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  };

  return [state, setPersistent];
}

const WALLPAPER_PRESETS = [
  { id: 'pattern', name: 'WhatsApp Pattern', bgClass: 'chat-bg-pattern bg-[#0b141a]' },
  { id: 'dark-slate', name: 'Dark Slate', bgClass: 'bg-slate-900' },
  { id: 'emerald', name: 'Emerald Gradient', bgClass: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-zinc-950' },
  { id: 'sunset', name: 'Sunset Purple', bgClass: 'bg-gradient-to-br from-purple-950 via-slate-900 to-zinc-950' },
  { id: 'ocean', name: 'Midnight Ocean', bgClass: 'bg-gradient-to-br from-blue-950 via-slate-900 to-black' },
  { id: 'solid-black', name: 'Solid Black', bgClass: 'bg-black' },
];

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useApp();
  const { logout, currentUser: authUser } = useAuth();
  const { addToast } = useToast();

  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
  };

  // Interactive Settings Controls State (persisted locally)
  const [notificationsEnabled, setNotificationsEnabled] = usePersistentState('set_notifications', true);
  const [soundEnabled, setSoundEnabled] = usePersistentState('set_sound', true);
  const [reactionNotifications, setReactionNotifications] = usePersistentState('set_reactions_notif', true);
  const [readReceipts, setReadReceipts] = usePersistentState('set_read_receipts', true);

  const [lastSeenPrivacy, setLastSeenPrivacy] = usePersistentState<'everyone' | 'contacts' | 'nobody'>('set_lastseen', 'everyone');
  const [onlinePrivacy, setOnlinePrivacy] = usePersistentState<'everyone' | 'same_as_last_seen'>('set_online', 'everyone');
  const [profilePhotoPrivacy, setProfilePhotoPrivacy] = usePersistentState<'everyone' | 'contacts' | 'nobody'>('set_avatar_priv', 'everyone');

  const [selectedWallpaper, setSelectedWallpaper] = usePersistentState('set_wallpaper', 'pattern');
  const [enterIsSend, setEnterIsSend] = usePersistentState('set_enter_send', true);
  const [fontSize, setFontSize] = usePersistentState<'small' | 'medium' | 'large'>('set_font_size', 'medium');

  const [lowDataCalls, setLowDataCalls] = usePersistentState('set_low_data_calls', false);
  const [callRingtone, setCallRingtone] = usePersistentState('set_call_ringtone', 'default');

  const [autoDownloadWifi, setAutoDownloadWifi] = usePersistentState('set_ad_wifi', { photos: true, audio: true, videos: true, docs: true });
  const [autoDownloadCellular, setAutoDownloadCellular] = usePersistentState('set_ad_cellular', { photos: true, audio: false, videos: false, docs: false });

  const currentWallpaperObj = WALLPAPER_PRESETS.find((w) => w.id === selectedWallpaper) || WALLPAPER_PRESETS[0];

  const sectionsList: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Lock className="w-4 h-4" /> },
    { id: 'chats', label: 'Chats & Wallpaper', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'calls', label: 'Calls', icon: <Phone className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage & Data', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'help', label: 'Help', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="flex w-full h-full overflow-hidden bg-white dark:bg-[#111b21] select-none">
      {/* ----------------- SETTINGS NAVIGATION SIDEBAR / TABS ----------------- */}
      <div className="w-full md:w-72 lg:w-80 flex flex-col h-full border-r border-zinc-200 dark:border-[#222d34] flex-shrink-0 z-20 bg-white dark:bg-[#111b21]">
        <div className="px-4 py-3 bg-zinc-50 dark:bg-[#202c33] border-b border-zinc-200 dark:border-[#222d34]">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            Settings
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sectionsList.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-left',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#202c33]'
                )}
              >
                <div className={cn('p-2 rounded-lg', isActive ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-[#202c33] text-zinc-500 dark:text-zinc-400')}>
                  {sec.icon}
                </div>
                <span className="flex-1">{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------- MAIN SETTINGS CONTROLS PANEL ----------------- */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-[#0b141a] p-4 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* SECTION 1: APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-6 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  Appearance & Theme
                </h2>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Dark Mode</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Switch between light and dark themes</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      'w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center',
                      theme === 'dark' ? 'bg-emerald-600 justify-end' : 'bg-zinc-300 justify-start'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="border-t border-zinc-100 dark:border-[#222d34]" />

                {/* Font Size Selector */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Font Size</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setFontSize(size);
                          addToast({ type: 'info', title: `Font size set to ${size}` });
                        }}
                        className={cn(
                          'py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all flex items-center justify-center gap-1.5',
                          fontSize === size
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#202c33]'
                        )}
                      >
                        {fontSize === size && <Check className="w-3.5 h-3.5" />}
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-6 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-500" />
                  Notifications & Alerts
                </h2>

                {/* Notifications Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Show Notifications</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Receive pop-up alerts for new messages</p>
                  </div>
                  <button
                    onClick={() => {
                      setNotificationsEnabled(!notificationsEnabled);
                      addToast({ type: 'info', title: `Notifications ${!notificationsEnabled ? 'Enabled' : 'Disabled'}` });
                    }}
                    className={cn(
                      'w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center',
                      notificationsEnabled ? 'bg-emerald-600 justify-end' : 'bg-zinc-300 justify-start'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="border-t border-zinc-100 dark:border-[#222d34]" />

                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Notification Sounds</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Play audio chime on incoming messages</p>
                  </div>
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      addToast({ type: 'info', title: `Notification Sound ${!soundEnabled ? 'Enabled' : 'Disabled'}` });
                    }}
                    className={cn(
                      'w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center',
                      soundEnabled ? 'bg-emerald-600 justify-end' : 'bg-zinc-300 justify-start'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="border-t border-zinc-100 dark:border-[#222d34]" />

                {/* Reaction Notifications Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Reaction Notifications</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Notify when contacts react to your messages</p>
                  </div>
                  <button
                    onClick={() => {
                      setReactionNotifications(!reactionNotifications);
                      addToast({ type: 'info', title: `Reaction Notifications ${!reactionNotifications ? 'Enabled' : 'Disabled'}` });
                    }}
                    className={cn(
                      'w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center',
                      reactionNotifications ? 'bg-emerald-600 justify-end' : 'bg-zinc-300 justify-start'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: PRIVACY */}
          {activeSection === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-6 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-500" />
                  Privacy & Security
                </h2>

                {/* Read Receipts Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Read Receipts</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      If turned off, you won't send or receive double blue ticks
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setReadReceipts(!readReceipts);
                      addToast({ type: 'info', title: `Read receipts ${!readReceipts ? 'enabled' : 'disabled'}` });
                    }}
                    className={cn(
                      'w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center',
                      readReceipts ? 'bg-emerald-600 justify-end' : 'bg-zinc-300 justify-start'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="border-t border-zinc-100 dark:border-[#222d34]" />

                {/* Last Seen Privacy */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Who can see my Last Seen</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['everyone', 'contacts', 'nobody'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setLastSeenPrivacy(opt);
                          addToast({ type: 'info', title: `Last seen set to ${opt}` });
                        }}
                        className={cn(
                          'py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all flex items-center justify-center gap-1.5',
                          lastSeenPrivacy === opt
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#202c33]'
                        )}
                      >
                        {lastSeenPrivacy === opt && <Check className="w-3.5 h-3.5" />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-[#222d34]" />

                {/* Online Privacy */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Who can see when I'm Online</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'everyone', label: 'Everyone' },
                      { id: 'same_as_last_seen', label: 'Same as Last Seen' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setOnlinePrivacy(opt.id as any);
                          addToast({ type: 'info', title: `Online visibility set to ${opt.label}` });
                        }}
                        className={cn(
                          'py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5',
                          onlinePrivacy === opt.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#202c33]'
                        )}
                      >
                        {onlinePrivacy === opt.id && <Check className="w-3.5 h-3.5" />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: CHATS & WALLPAPER */}
          {activeSection === 'chats' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-6 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-emerald-500" />
                  Chat Wallpaper & Theme
                </h2>

                {/* Live Wallpaper Preview Card */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Wallpaper Preview</p>
                  <div className={cn('w-full h-36 rounded-2xl p-4 border border-zinc-700 flex flex-col justify-end shadow-inner relative overflow-hidden', currentWallpaperObj.bgClass)}>
                    <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs max-w-xs shadow-md">
                      Hey! How does this chat wallpaper look? ✨
                    </div>
                  </div>
                </div>

                {/* Preset Picker Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {WALLPAPER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedWallpaper(preset.id);
                        addToast({ type: 'success', title: 'Wallpaper Updated', description: preset.name });
                      }}
                      className={cn(
                        'p-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-2',
                        selectedWallpaper === preset.id
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-[#202c33]'
                      )}
                    >
                      <div className={cn('w-full h-12 rounded-xl border border-white/10', preset.bgClass)} />
                      <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-full">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-zinc-100 dark:border-[#222d34]" />

                {/* Enter is Send Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Enter is Send</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Pressing Enter key will send your message</p>
                  </div>
                  <button
                    onClick={() => {
                      setEnterIsSend(!enterIsSend);
                      addToast({ type: 'info', title: `Enter is send ${!enterIsSend ? 'enabled' : 'disabled'}` });
                    }}
                    className={cn(
                      'w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center',
                      enterIsSend ? 'bg-emerald-600 justify-end' : 'bg-zinc-300 justify-start'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: CALLS */}
          {activeSection === 'calls' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-6 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-500" />
                  Call Settings
                </h2>

                {/* Low Data Usage */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Use Less Data for Calls</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Reduce data consumed during voice and video calls</p>
                  </div>
                  <button
                    onClick={() => {
                      setLowDataCalls(!lowDataCalls);
                      addToast({ type: 'info', title: `Low Data Mode ${!lowDataCalls ? 'Enabled' : 'Disabled'}` });
                    }}
                    className={cn(
                      'w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center',
                      lowDataCalls ? 'bg-emerald-600 justify-end' : 'bg-zinc-300 justify-start'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: STORAGE & DATA */}
          {activeSection === 'storage' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-6 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-emerald-500" />
                  Storage Usage & Auto-Download
                </h2>

                {/* Storage Breakdown Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>Storage Used (13.8 GB)</span>
                    <span>Free Space (45.2 GB)</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="w-2/5 bg-emerald-500 h-full" title="Photos (5.5 GB)" />
                    <div className="w-1/4 bg-blue-500 h-full" title="Videos (4.1 GB)" />
                    <div className="w-1/6 bg-purple-500 h-full" title="Documents (2.2 GB)" />
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-[#222d34]" />

                {/* Auto-Download Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    When Connected on Wi-Fi
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(autoDownloadWifi).map((key) => {
                      const typedKey = key as keyof typeof autoDownloadWifi;
                      const val = autoDownloadWifi[typedKey];
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            const updated = { ...autoDownloadWifi, [typedKey]: !val };
                            setAutoDownloadWifi(updated);
                          }}
                          className={cn(
                            'py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all flex items-center justify-between',
                            val
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                          )}
                        >
                          <span>{key}</span>
                          {val && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: ACCOUNT */}
          {activeSection === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-4 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  Account & Security
                </h2>
                <button
                  onClick={() => addToast({ type: 'info', title: 'Two-step verification active' })}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-[#202c33] border border-zinc-200 dark:border-[#222d34]"
                >
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Two-step Verification</span>
                  <span className="text-xs text-emerald-500 font-bold">Enabled</span>
                </button>

                <div className="border-t border-zinc-100 dark:border-[#222d34] pt-2" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold text-xs transition-colors border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 8: HELP */}
          {activeSection === 'help' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-4 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-500" />
                  Help Center
                </h2>
                <button
                  onClick={() => addToast({ type: 'info', title: 'Support request ticket opened' })}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-transform active:scale-95 shadow-md"
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}

          {/* SECTION 9: ABOUT */}
          {activeSection === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#111b21] rounded-3xl border border-zinc-200 dark:border-[#222d34] p-6 space-y-4 shadow-xs text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  SC
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  SecureConnect Web
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Version 1.0.0 (Build 2026.09.30)
                </p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Frontend Application Shell & UI Simulation built with React, Vite, and Tailwind CSS.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
