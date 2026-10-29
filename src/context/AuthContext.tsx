import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type { LoginPayload, RegisterPayload } from '../services/authService';
import { getToken, setToken } from '../services/api';

export const sanitizeAvatar = (url?: string) => {
  if (!url || url.includes('images.unsplash.com/photo-1534528741775-53994a69daeb')) {
    return '';
  }
  return url;
};

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean; email?: string }>;
  validateCredentials: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>;
  sendVerificationCode: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyCodeLogin: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean; email?: string }>;
  updateProfile: (data: { name?: string; about?: string; profilePicture?: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
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
          avatar: sanitizeAvatar(u.profilePicture || u.avatar),
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
          avatar: sanitizeAvatar(u.profilePicture || u.avatar),
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
        return {
          success: false,
          message: msg,
          requiresVerification: res.requiresVerification,
          email: res.email,
        };
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during login';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const validateCredentials = async (payload: LoginPayload) => {
    setError(null);
    try {
      const res = await authService.validateCredentials(payload);
      if (res.success) {
        return { success: true };
      } else {
        const msg = res.message || 'Invalid email or password';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to validate credentials';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const sendVerificationCode = async (email: string) => {
    setError(null);
    try {
      const res = await authService.sendVerificationCode(email);
      if (res.success) {
        return {
          success: true,
          message: res.message,
        };
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
          avatar: sanitizeAvatar(u.profilePicture || u.avatar),
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
      setLoading(false);
      if (res.success) {
        return {
          success: true,
          message: res.message || 'Account created successfully',
          requiresVerification: res.requiresVerification,
          email: payload.email,
        };
      } else {
        const msg = res.message || 'Registration failed';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during registration';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (data: { name?: string; about?: string; profilePicture?: string; phone?: string }) => {
    try {
      const res = await userService.updateProfile(data);
      if (res.success && res.data?.user) {
        const u = res.data.user as any;
        const normalizedUser: User = {
          id: u.id || u._id,
          name: u.name,
          email: u.email || '',
          avatar: sanitizeAvatar(u.profilePicture || u.avatar),
          bio: u.about || u.bio || 'Hey there! I am using WhatsApp.',
          phone: u.phone || '+91 98765 43210',
          presence: 'online',
        };
        setCurrentUser(normalizedUser);
        return { success: true };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error updating profile' };
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
        validateCredentials,
        sendVerificationCode,
        verifyCodeLogin,
        register,
        updateProfile,
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
