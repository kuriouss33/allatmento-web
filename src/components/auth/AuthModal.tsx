'use client';

import React, { useState } from 'react';
import { X, Shield, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { login, register, resendVerification, firebaseUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);

    if (mode === 'register' && !consent) {
      setError(t.authConsentRequired);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else {
        await register(email, password);
        setInfoMsg(t.authRegSuccess);
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || t.error;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = t.authInvalidCred;
      } else if (err.code === 'auth/email-already-in-use') {
        msg = t.authEmailInUse;
      } else if (err.code === 'auth/weak-password') {
        msg = t.authWeakPassword;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await resendVerification();
      setInfoMsg(t.authResendSuccess);
    } catch (err: any) {
      setError(err.message || t.authResendFail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe pl-safe pr-safe bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
              {mode === 'login' ? t.authModalTitleLogin : t.authModalTitleReg}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? t.authLoginSub : t.authRegSub}
            </p>
          </div>
        </div>

        {/* Unverified Email Warning */}
        {firebaseUser && !firebaseUser.emailVerified && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{t.emailVerificationWarning}</span>
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-left font-bold underline hover:text-amber-800 dark:hover:text-amber-200 disabled:opacity-50"
            >
              {t.resendVerificationBtn}
            </button>
          </div>
        )}

        {/* Error / Info messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pelda@mentoegyesulet.hu"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
          </div>

          {mode === 'register' && (
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>{t.authConsentText}</span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span>{loading ? t.processing : (mode === 'login' ? t.loginSubmit : t.registerSubmit)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-600 dark:text-slate-400">
          {mode === 'login' ? (
            <p>
              {t.noAccountYet}{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t.registerLink}
              </button>
            </p>
          ) : (
            <p>
              {t.hasAccountAlready}{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t.loginLink}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
