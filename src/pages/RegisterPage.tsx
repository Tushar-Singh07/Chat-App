import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  MessageSquare,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { theme, toggleTheme } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !email || !password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const result = await register({
      name,
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      password,
    });
    setSubmitting(false);

    if (result.success) {
      if (result.requiresVerification) {
        addToast({
          type: 'success',
          title: 'Account Created Successfully!',
          description: `We've sent a 6-digit verification code to ${email}.`,
        });
        navigate('/verify-email', { state: { email: email.trim().toLowerCase(), fromRegister: true } });
      } else {
        addToast({
          type: 'success',
          title: 'Welcome to WhatsApp Web!',
          description: 'Your account was created successfully.',
        });
        navigate('/');
      }
    } else {
      setFormError(result.message || 'Registration failed');
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
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <MessageSquare className="w-8 h-8 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-slate-50 tracking-tight">Create Account</h1>
          <p className="text-zinc-600 dark:text-slate-400 text-sm mt-1">Join WhatsApp Web to start chatting</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border border-zinc-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-zinc-300/40 dark:shadow-black/50 transition-colors duration-200">
          {formError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-slate-950/60 border border-zinc-300 dark:border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-slate-950/60 border border-zinc-300 dark:border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-zinc-500 dark:text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-slate-950/60 border border-zinc-300 dark:border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-11 py-2.5 bg-zinc-50 dark:bg-slate-950/60 border border-zinc-300 dark:border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 outline-none transition text-sm"
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-slate-950/60 border border-zinc-300 dark:border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-zinc-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium transition underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600/60 dark:text-emerald-500/60" />
          <span>Your information is protected by industry standard security</span>
        </div>
      </div>
    </div>
  );
};
