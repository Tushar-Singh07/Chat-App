import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  CircleDashed,
  Phone,
  User,
  Settings,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { cn } from '../utils/cn';
import type { ActiveTab } from '../types';

export const SidebarNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, theme, toggleTheme, conversations } = useApp();

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const getActiveTab = (): ActiveTab => {
    const path = location.pathname;
    if (path.startsWith('/status')) return 'status';
    if (path.startsWith('/calls')) return 'calls';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/settings')) return 'settings';
    return 'chats';
  };

  const activeTab = getActiveTab();

  const navItems = [
    {
      id: 'chats' as ActiveTab,
      path: '/',
      label: 'Chats',
      icon: MessageSquare,
      badge: totalUnread > 0 ? totalUnread : null,
    },
    {
      id: 'status' as ActiveTab,
      path: '/status',
      label: 'Status',
      icon: CircleDashed,
    },
    {
      id: 'calls' as ActiveTab,
      path: '/calls',
      label: 'Calls',
      icon: Phone,
    },
  ];

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="w-16 md:w-18 bg-zinc-100 dark:bg-[#111b21] border-r border-zinc-200 dark:border-[#222d34] flex flex-col items-center justify-between py-4 select-none z-30 flex-shrink-0">
      {/* Top: App Brand + Main Navigation */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Brand Icon */}
        <button
          onClick={() => handleNav('/')}
          className="p-2.5 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-transform"
          title="WhatsApp Web"
        >
          <ShieldCheck className="w-6 h-6" />
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={cn(
                  'relative p-3 rounded-2xl transition-all duration-200 group flex items-center justify-center w-12 h-12',
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-600 dark:bg-[#202c33] dark:text-[#00a884] font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-[#202c33]/60 hover:text-zinc-800 dark:hover:text-zinc-200'
                )}
                title={item.label}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Theme Toggle, Settings & Profile */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-[#202c33]/60 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Settings */}
        <button
          onClick={() => handleNav('/settings')}
          className={cn(
            'p-3 rounded-2xl transition-all',
            activeTab === 'settings'
              ? 'bg-emerald-600/15 text-emerald-600 dark:bg-[#202c33] dark:text-[#00a884]'
              : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-[#202c33]/60'
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => handleNav('/profile')}
          className={cn(
            'p-1 rounded-full transition-all border-2',
            activeTab === 'profile'
              ? 'border-emerald-500'
              : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
          )}
          title="Profile"
        >
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.name}
            size="sm"
            presence={currentUser.presence}
            showPresence
          />
        </button>
      </div>
    </aside>
  );
};
