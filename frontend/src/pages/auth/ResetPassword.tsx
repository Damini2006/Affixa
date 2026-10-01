import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, Check, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

/**
 * Password recovery landing page. Supabase emails a link that redirects here.
 * Newer links use PKCE (`?code=…`); older ones use `#access_token=…&type=recovery`.
 * supabase-js auto-handles the hash flow, but the PKCE code must be exchanged
 * explicitly, otherwise a valid link shows "expired".
 */
export const ResetPassword = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [exchanging, setExchanging] = useState(false);

  // Exchange `?code=` (PKCE recovery link) for a session on first mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code || session) return;
    setExchanging(true);
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError('This reset link is invalid or expired. Request a fresh one below.');
      // Clean the code from the URL so a refresh doesn't re-exchange.
      window.history.replaceState({}, '', window.location.pathname);
      setExchanging(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      setDone(true);
      setTimeout(() => navigate('/analyzer', { replace: true }), 1800);
    }
  };

  if (loading || exchanging) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#8EB69B] animate-spin" aria-label="Loading" />
      </div>
    );
  }

  // Recovery link missing, expired, or already used.
  if (!session) {
    return (
      <div className="section-bg min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl border-app p-8 max-w-md w-full text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-app-card border border-app flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-xl font-extrabold text-app mb-2">Reset link expired</h1>
          <p className="text-sm text-app-muted mb-2">
            This password reset link is invalid, was already used, or has expired.
            Request a fresh link and we&rsquo;ll email you a new one.
          </p>
          {error && <p className="text-xs text-pink-400 mb-4">{error}</p>}
          <div className="flex gap-3 justify-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl btn-primary text-sm"
            >
              Get a fresh link
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-app-card border border-app text-app-muted text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="section-bg min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl border-app p-8 max-w-md w-full text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#8EB69B] text-[#051F20] flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-app mb-2">Password updated</h1>
          <p className="text-sm text-app-muted">
            Taking you to your dashboard&hellip;
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-bg min-h-[70vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-3xl border-app p-8 max-w-md w-full"
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-app-subtle mb-2">
          Account recovery
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-[#8EB69B]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-app">Set a new password</h1>
            <p className="text-xs text-app-muted">Signed in as {session.user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="new-password" className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle" />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="input-dark !pl-10 !pr-11 text-sm"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-subtle hover:text-app transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle" />
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat the new password"
                className="input-dark !pl-10 text-sm"
                required
                minLength={8}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary justify-center !py-3 text-sm disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update password'}
          </button>

          <p className="text-[11px] text-app-subtle text-center">
            Minimum 8 characters. You&rsquo;ll stay signed in on this device.
          </p>
        </form>
      </motion.div>
    </div>
  );
};
