import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  MessageSquare,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sun,
  Moon,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fromRegister = (location.state as any)?.fromRegister;
  const initialEmail = (location.state as any)?.email || '';

  const [email, setEmail] = useState<string>(initialEmail);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle direct Email & Password Login for existing users
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setFormError('Please enter both your email and password');
      return;
    }

    setSubmitting(true);
    const result = await login({ email: trimmedEmail, password });
    setSubmitting(false);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Welcome Back!',
        description: 'Successfully signed in to WhatsApp Web.',
      });
      navigate('/');
    } else if (result.requiresVerification) {
      addToast({
        type: 'info',
        title: 'Email Verification Required',
        description: 'Please verify the 6-digit code sent to your email to activate your account.',
      });
      navigate('/verify-email', { state: { email: trimmedEmail, fromRegister: true } });
    } else {
      setFormError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-100 dark:bg-slate-950 text-zinc-900 dark:text-slate-100 p-4 sm:p-6 relative overflow-hidden transition-colors duration-200">
      {/* Top Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-zinc-700 dark:text-slate-200 backdrop-blur-md border border-zinc-200/80 dark:border-slate-700/50 shadow-md transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer active:scale-95"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          <span className="hidden sm:inline capitalize">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
        </button>
      </div>

      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <MessageSquare className="w-8 h-8 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-slate-50 tracking-tight">Sign In</h1>
          <p className="text-zinc-600 dark:text-slate-400 text-sm mt-1">Enter your email and password to access your chats</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border border-zinc-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-zinc-300/40 dark:shadow-black/50 transition-colors duration-200">
          {/* Success banner if redirected from Register */}
          {fromRegister && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Account created! Sign in with your email & password or verify your code.</span>
            </div>
          )}

          {formError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-slate-950/60 border border-zinc-300 dark:border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-zinc-50 dark:bg-slate-950/60 border border-zinc-300 dark:border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 outline-none transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-slate-400 hover:text-zinc-600 dark:hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Verification code helper link for new users */}
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/verify-email', { state: { email } })}
              className="w-full py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-950/50 dark:hover:bg-slate-800 border border-zinc-200 dark:border-slate-800 hover:border-zinc-300 dark:hover:border-slate-700 text-zinc-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Newly registered? Enter your verification code</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-zinc-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium transition underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-zinc-500 dark:text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600/60 dark:text-emerald-500/60" />
          <span>End-to-End Encrypted & Secure Authentication</span>
        </div>
      </div>
    </div>
  );
};
