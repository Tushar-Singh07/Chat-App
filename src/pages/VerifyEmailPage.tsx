import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  MessageSquare,
  Mail,
  KeyRound,
  Send,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const { sendVerificationCode, verifyCodeLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email from navigation state if available
  const fromRegister = (location.state as any)?.fromRegister;
  const initialEmail = (location.state as any)?.email || '';
  const [email, setEmail] = useState<string>(initialEmail);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [codeSent, setCodeSent] = useState<boolean>(Boolean(fromRegister && initialEmail));
  const [sentToEmail, setSentToEmail] = useState<string>(initialEmail);

  const [sendingCode, setSendingCode] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(fromRegister && initialEmail ? 60 : 0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle requesting verification code
  const handleSendCode = async () => {
    setFormError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    setSendingCode(true);
    const result = await sendVerificationCode(trimmedEmail);
    setSendingCode(false);

    if (result.success) {
      setCodeSent(true);
      setSentToEmail(trimmedEmail);
      setResendCooldown(60);

      if ((result as any).code) {
        setVerificationCode((result as any).code);
      }

      addToast({
        type: 'success',
        title: (result as any).code ? 'Verification Code Ready' : 'Verification Code Sent!',
        description: result.message || `Check your inbox at ${trimmedEmail} for your 6-digit code.`,
      });
    } else {
      setFormError(result.message || 'Failed to send verification code. Please check your email.');
    }
  };

  // Handle submitting the 6-digit code
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const cleanCode = verificationCode.trim();

    if (!trimmedEmail) {
      setFormError('Please enter your email address');
      return;
    }

    if (!cleanCode || cleanCode.length < 4) {
      setFormError('Please enter the 6-digit verification code sent to your email');
      return;
    }

    setSubmitting(true);
    const result = await verifyCodeLogin(trimmedEmail, cleanCode);
    setSubmitting(false);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Login Successful!',
        description: 'Email verified. Welcome to WhatsApp Web.',
      });
      navigate('/');
    } else {
      setFormError(result.message || 'Invalid or expired verification code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <MessageSquare className="w-8 h-8 fill-emerald-500/20 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Email Verification</h1>
          <p className="text-slate-400 text-sm mt-1">
            We will only send your verification code directly to your email
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {formError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {codeSent && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Verification Code Sent!</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  The code was sent strictly to <strong className="text-emerald-300">{sentToEmail}</strong>. Please check your inbox or spam folder.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="space-y-5">
            {/* Step 1: Email Address & Request Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                1. Your Email Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-11 pr-3 py-3 bg-slate-950/60 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 placeholder-slate-500 outline-none transition text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || !email || resendCooldown > 0}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40 rounded-xl font-medium text-xs transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  {sendingCode ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{resendCooldown}s</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{codeSent ? 'Resend Code' : 'Send Code'}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {codeSent
                  ? `Verification code sent to ${sentToEmail}. Open your email to copy the 6-digit code.`
                  : 'Click "Send Code" to dispatch the one-time code to this email inbox.'}
              </p>
            </div>

            {/* Step 2: 6-Digit Verification Code */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  2. Enter 6-Digit Code
                </label>
                <span className="text-[11px] text-slate-400">Valid for 10 minutes</span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition text-center tracking-[0.4em] font-mono text-xl"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !verificationCode || verificationCode.length < 4}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code & Complete Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Navigation helpers */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Password Login</span>
            </Link>

            <Link
              to="/register"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition underline"
            >
              Create New Account
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500/60" />
          <span>End-to-End Encrypted & Secure Authentication</span>
        </div>
      </div>
    </div>
  );
};
