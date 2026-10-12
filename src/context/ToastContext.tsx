import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  addToast: (
    titleOrObj: string | Omit<ToastMessage, 'id'>,
    type?: ToastType,
    description?: string
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (
      titleOrObj: string | Omit<ToastMessage, 'id'>,
      type: ToastType = 'info',
      description?: string
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      let toastItem: ToastMessage;

      if (typeof titleOrObj === 'string') {
        toastItem = { id, title: titleOrObj, type, description };
      } else {
        toastItem = { id, ...titleOrObj };
      }

      setToasts((prev) => [...prev, toastItem]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200',
              toast.type === 'success' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 dark:bg-emerald-950/80',
              toast.type === 'info' && 'bg-sky-500/10 border-sky-500/30 text-sky-950 dark:text-sky-200 dark:bg-sky-950/80',
              toast.type === 'warning' && 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200 dark:bg-amber-950/80',
              toast.type === 'error' && 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200 dark:bg-rose-950/80'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              {toast.description && <p className="text-xs opacity-80 mt-0.5">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
