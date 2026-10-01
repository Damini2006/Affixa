import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, ShieldCheck, Fingerprint, Pencil, Check,
  Copy, LogOut, Loader2, Settings, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const currentName = (user?.user_metadata?.full_name as string | undefined)?.trim() || '';
  const displayName = currentName || user?.email?.split('@')[0] || 'Researcher';

  const [name, setName] = useState(currentName);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [idCopied, setIdCopied] = useState(false);

  if (!user) return null;

  const initials = displayName.slice(0, 2).toUpperCase();
  const hasMfa = (user.factors?.length ?? 0) > 0;
  const provider = user.app_metadata?.provider || 'email';
  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : '—';

  const handleStartEdit = () => {
    setName(currentName);
    setFeedback(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setName(currentName);
    setFeedback(null);
    setEditing(false);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed === currentName) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setFeedback(null);
    const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
    setSaving(false);
    if (error) {
      setFeedback({ kind: 'error', text: error.message });
    } else {
      setEditing(false);
      setFeedback({ kind: 'ok', text: 'Profile updated' });
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const details = [
    { icon: Mail, label: 'Email address', value: user.email || '—', mono: false },
    { icon: Fingerprint, label: 'User ID', value: user.id, mono: true },
    { icon: User, label: 'Sign-in provider', value: provider === 'email' ? 'Email & password' : provider, mono: false },
    { icon: ShieldCheck, label: 'Two-factor auth', value: hasMfa ? 'Enabled' : 'Not enabled', mono: false },
    { icon: Calendar, label: 'Member since', value: memberSince, mono: false },
    { icon: Calendar, label: 'Last sign-in', value: lastSignIn, mono: false },
  ];

  return (
    <div className="section-bg min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-app-muted mb-3 border-app">
            <User className="w-3.5 h-3.5 text-[#8EB69B]" /> Account
          </div>
          <h1 className="text-3xl font-extrabold text-app">Profile</h1>
          <p className="text-app-muted text-sm mt-1">
            Your identity in the workspace and the security details of this account.
          </p>
        </div>

        {/* ── IDENTITY ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 border-app"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#8EB69B] text-[#051F20] flex items-center justify-center font-black text-2xl shrink-0 shadow-lg">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold">
                    Display name
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Dr. Neelam Rishika"
                      maxLength={60}
                      className="input-dark flex-1 !py-2.5"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary !py-2.5 !px-4 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-app-card border border-app text-app-muted hover:text-app transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-extrabold text-app truncate">
                      {displayName}
                      {!currentName && (
                        <span className="ml-2 align-middle text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-app-card border border-app text-app-subtle font-semibold">
                          no name set
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-app-muted flex items-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-app-card border border-app text-app-muted hover:text-app hover:border-app-hover transition-colors cursor-pointer shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit name
                  </button>
                </div>
              )}

              {feedback && (
                <p
                  role="status"
                  className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${
                    feedback.kind === 'ok' ? 'text-[#8EB69B]' : 'text-pink-400'
                  }`}
                >
                  {feedback.kind === 'ok'
                    ? <Check className="w-3.5 h-3.5" />
                    : <AlertCircle className="w-3.5 h-3.5" />}
                  {feedback.text}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── ACCOUNT DETAILS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass rounded-3xl p-6 border-app"
        >
          <div className="flex items-center gap-3 mb-5 border-b border-app pb-4">
            <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#8EB69B]" />
            </div>
            <div>
              <h3 className="font-bold text-app text-lg">Account details</h3>
              <p className="text-xs text-app-muted">Security and session facts, read-only</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {details.map(d => {
              const Icon = d.icon;
              return (
                <div
                  key={d.label}
                  className="flex items-start gap-3 p-3.5 bg-app-deep border border-app rounded-2xl"
                >
                  <Icon className="w-4 h-4 text-app-subtle mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-app-subtle font-semibold">{d.label}</p>
                    <p className={`text-sm text-app font-semibold truncate ${d.mono ? 'font-mono text-xs' : ''}`}>
                      {d.value}
                    </p>
                  </div>
                  {d.label === 'User ID' && (
                    <button
                      onClick={handleCopyId}
                      className="p-1.5 rounded-lg text-app-muted hover:text-app hover:bg-app-card transition-colors cursor-pointer shrink-0"
                      title="Copy user ID"
                      aria-label="Copy user ID"
                    >
                      {idCopied ? <Check className="w-3.5 h-3.5 text-[#8EB69B]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── SESSION ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="glass rounded-3xl p-6 border-app flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-bold text-app text-lg">Session</h3>
            <p className="text-xs text-app-muted">
              Signed in as <span className="text-app font-semibold">{user.email}</span>. Signing out returns you to the landing page.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-app-card border border-app text-app-muted hover:text-app hover:border-app-hover transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" /> Appearance
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
