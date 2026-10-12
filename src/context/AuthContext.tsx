import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';
import type { LoginPayload, RegisterPayload } from '../services/authService';
import { getToken, setToken } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>;
  sendVerificationCode: (email: string) => Promise<{ success: boolean; message?: string; code?: string }>;
  verifyCodeLogin: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    const token = getToken();

    if (!token) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data?.user) {
        const u = res.data.user as any;
        const normalizedUser: User = {
          id: u.id || u._id,
          name: u.name,
          email: u.email || '',
          avatar: u.profilePicture || u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: u.about || u.bio || 'Hey there! I am using WhatsApp.',
          phone: u.phone || '+91 98765 43210',
          presence: u.isOnline ? 'online' : 'offline',
        };
        setCurrentUser(normalizedUser);
        setIsAuthenticated(true);
      } else {
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      setToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: LoginPayload) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.login(payload);
      if (res.success && res.data?.user) {
        const u = res.data.user as any;
        const normalizedUser: User = {
          id: u.id || u._id,
          name: u.name,
          email: u.email || '',
          avatar: u.profilePicture || u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: u.about || u.bio || 'Hey there! I am using WhatsApp.',
          phone: u.phone || '+91 98765 43210',
          presence: 'online',
        };
        setCurrentUser(normalizedUser);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      } else {
        const msg = res.message || 'Login failed';
        setError(msg);
        setLoading(false);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during login';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const sendVerificationCode = async (email: string) => {
    setError(null);
    try {
      const res = await authService.sendVerificationCode(email);
      if (res.success) {
        return { success: true, message: res.message, code: res.data?.code || (res as any).code };
      } else {
        const msg = res.message || 'Failed to send verification code';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'Error sending verification code';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const verifyCodeLogin = async (email: string, code: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.verifyCodeLogin(email, code);
      if (res.success && res.data?.user) {
        const u = res.data.user as any;
        const normalizedUser: User = {
          id: u.id || u._id,
          name: u.name,
          email: u.email || '',
          avatar: u.profilePicture || u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: u.about || u.bio || 'Hey there! I am using WhatsApp.',
          phone: u.phone || '+91 98765 43210',
          presence: 'online',
        };
        setCurrentUser(normalizedUser);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      } else {
        const msg = res.message || 'Verification failed';
        setError(msg);
        setLoading(false);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'Error verifying code';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const register = async (payload: RegisterPayload) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.register(payload);
      if (res.success && res.data?.user) {
        const u = res.data.user as any;
        const normalizedUser: User = {
          id: u.id || u._id,
          name: u.name,
          email: u.email || '',
          avatar: u.profilePicture || u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: u.about || u.bio || 'Hey there! I am using WhatsApp.',
          phone: u.phone || '+91 98765 43210',
          presence: 'online',
        };
        setCurrentUser(normalizedUser);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      } else {
        const msg = res.message || 'Registration failed';
        setError(msg);
        setLoading(false);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during registration';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        error,
        login,
        sendVerificationCode,
        verifyCodeLogin,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
