import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, CircleDashed, Phone, User, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversations } = useApp();

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const path = location.pathname;

  // Hide mobile bottom nav if deep inside a conversation on mobile
  const isChatDetail = path.startsWith('/chat/');
  if (isChatDetail) return null;

  const navItems = [
    { path: '/', label: 'Chats', icon: MessageSquare, badge: totalUnread > 0 ? totalUnread : null },
    { path: '/status', label: 'Status', icon: CircleDashed },
    { path: '/calls', label: 'Calls', icon: Phone },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#111b21] border-t border-zinc-200 dark:border-[#222d34] flex items-center justify-around z-40 px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === '/'
            ? path === '/' || path.startsWith('/chat/')
            : path.startsWith(item.path);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all',
              isActive
                ? 'text-emerald-600 dark:text-[#00a884] font-semibold'
                : 'text-zinc-500 dark:text-zinc-400'
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== null && item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
