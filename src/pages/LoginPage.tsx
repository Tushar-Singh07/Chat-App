import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck, KeyRound, Send, CheckCircle2, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, sendVerificationCode, verifyCodeLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'password' | 'code'>('password');

  // Pre-fill with requested user credentials
  const [email, setEmail] = useState('tusharsinghrajput06@gmail.com');
  const [password, setPassword] = useState('123456789');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [devCodePreview, setDevCodePreview] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle Password Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const result = await login({ email, password });
    setSubmitting(false);

    if (result.success) {
      addToast({ type: 'success', title: 'Welcome back, Tushar Singh Rajput!' });
      navigate('/');
    } else {
      setFormError(result.message || 'Invalid email or password');
    }
  };

  // Instant 1-Click Login for Tushar
  const handleInstantTusharLogin = async () => {
    setFormError(null);
    setSubmitting(true);
    const result = await login({ email: 'tusharsinghrajput06@gmail.com', password: '123456789' });
    setSubmitting(false);

    if (result.success) {
      addToast({ type: 'success', title: 'Logged in as Tushar Singh Rajput!' });
      navigate('/');
    } else {
      setFormError(result.message || 'Login failed. Please check credentials.');
    }
  };

  // Handle Sending Verification Code
  const handleSendCode = async () => {
    setFormError(null);

    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    setSendingCode(true);
    const result = await sendVerificationCode(email);
    setSendingCode(false);

    if (result.success) {
      setCodeSent(true);
      if (result.code) {
        setDevCodePreview(result.code);
        setVerificationCode(result.code); // Auto-fill code for instant convenience
      }
      addToast({
        type: 'success',
        title: 'Verification Code Sent!',
        description: `Check your email inbox (${email}) for the 6-digit code.`,
      });
    } else {
      setFormError(result.message || 'Failed to send verification code.');
    }
  };

  // Handle Verification Code Submit
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email) {
      setFormError('Please enter your email address');
      return;
    }

    if (!verificationCode || verificationCode.length < 4) {
      setFormError('Please enter the 6-digit verification code sent to your email');
      return;
    }

    setSubmitting(true);
    const result = await verifyCodeLogin(email, verificationCode);
    setSubmitting(false);

    if (result.success) {
      addToast({ type: 'success', title: 'Email Verified & Signed In!' });
      navigate('/');
    } else {
      setFormError(result.message || 'Invalid or expired verification code');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <MessageSquare className="w-8 h-8 fill-emerald-500/20 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">WhatsApp Web</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to start messaging with friends</p>
        </div>

        {/* 1-Click Instant Login Button for Tushar Singh Rajput */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleInstantTusharLogin}
            disabled={submitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-2xl transition shadow-xl shadow-emerald-600/30 active:scale-[0.99] flex items-center justify-center gap-2 border border-emerald-400/30"
          >
            <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            <span>Instant Login as Tushar (tusharsinghrajput06)</span>
          </button>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setFormError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'password'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('code');
              setFormError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'code'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Email Verification Code</span>
          </button>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {formError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {formError}
            </div>
          )}

          {/* ==================================================== */}
          {/* OPTION 1: STANDARD PASSWORD LOGIN                    */}
          {/* ==================================================== */}
          {authMode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 placeholder-slate-500 outline-none transition text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 placeholder-slate-500 outline-none transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          ) : (
            /* ==================================================== */
            /* OPTION 2: EMAIL VERIFICATION CODE (OTP) LOGIN        */
            /* ==================================================== */
            <form onSubmit={handleCodeSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 placeholder-slate-500 outline-none transition text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || !email}
                    className="px-3.5 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl font-medium text-xs transition whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {sendingCode ? (
                      <div className="w-4 h-4 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{codeSent ? 'Resend Code' : 'Send Code'}</span>
                  </button>
                </div>
              </div>

              {/* Verification Code Sent Banner */}
              {devCodePreview && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Verification Code: <span className="font-mono text-emerald-300 text-base tracking-widest">{devCodePreview}</span></p>
                      <p className="text-[11px] text-slate-300">Code is auto-filled below.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCodeSubmit(e as any)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition shadow shrink-0 active:scale-95"
                  >
                    ⚡ Instant Sign In
                  </button>
                </div>
              )}

              {/* Verification Code Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 placeholder-slate-500 outline-none transition text-sm tracking-widest font-mono text-lg"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Click <strong>Send Code</strong> above to receive a verification code on your email address.
                </p>
              </div>

              {/* Submit Verification Code Button */}
              <button
                type="submit"
                disabled={submitting || !verificationCode}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500/60" />
          <span>End-to-End Encrypted & Secure Auth</span>
        </div>
      </div>
    </div>
  );
};
