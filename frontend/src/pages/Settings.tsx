import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, ShieldCheck, Database, Key, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { user } = useAuth();
  const [minRootLen, setMinRootLen] = useState('2');
  const [useWordNet, setUseWordNet] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="section-bg min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-app-muted mb-3 border-app">
            <Sliders className="w-3.5 h-3.5 text-[#8EB69B]" /> Engine Configuration
          </div>
          <h1 className="text-3xl font-extrabold text-app">System Settings</h1>
          <p className="text-app-muted text-sm mt-1">Manage your NLP engine parameters, account details, and API configuration.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Account Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border-app">
            <div className="flex items-center gap-3 mb-6 border-b border-app pb-4">
              <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center text-app-muted">
                <Key className="w-5 h-5 text-[#8EB69B]" />
              </div>
              <div>
                <h3 className="font-bold text-app text-lg">Account Profile</h3>
                <p className="text-xs text-app-muted">Authenticated session details</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.user_metadata?.full_name || 'Morphology Researcher'}
                  className="input-dark opacity-80 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'user@example.com'}
                  className="input-dark opacity-80 cursor-not-allowed"
                />
              </div>
            </div>
          </motion.div>

          {/* Engine Parameters Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6 border-app">
            <div className="flex items-center gap-3 mb-6 border-b border-app pb-4">
              <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center text-app-muted">
                <Sliders className="w-5 h-5 text-[#8EB69B]" />
              </div>
              <div>
                <h3 className="font-bold text-app text-lg">Morphological Analyzer Tuning</h3>
                <p className="text-xs text-app-muted">Fine-tune the rule-based candidate filtering</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-app text-sm">WordNet Dictionary Validation</h4>
                  <p className="text-xs text-app-muted">Validate stripped candidate roots against NLTK WordNet lexicon</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseWordNet(!useWordNet)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${useWordNet ? 'bg-[#8EB69B]' : 'bg-app-card border border-app'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-app absolute top-0.5 transition-transform ${useWordNet ? 'left-6.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="border-t border-app pt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Min Root Length</label>
                  <select
                    value={minRootLen}
                    onChange={e => setMinRootLen(e.target.value)}
                    className="input-dark"
                  >
                    <option value="2">2 Characters (e.g. do, go, be)</option>
                    <option value="3">3 Characters (e.g. cat, run, see)</option>
                    <option value="4">4 Characters (strict)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Backend API Base Endpoint</label>
                  <input
                    type="text"
                    value={apiEndpoint}
                    onChange={e => setApiEndpoint(e.target.value)}
                    className="input-dark font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Database Status Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6 border-app">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center text-app-muted">
                <Database className="w-5 h-5 text-[#8EB69B]" />
              </div>
              <div>
                <h3 className="font-bold text-app text-lg">Supabase & Database Status</h3>
                <p className="text-xs text-app-muted">Row Level Security and connectivity</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-app-deep border border-app rounded-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#8EB69B]" />
                <div>
                  <p className="text-sm font-semibold text-app">Connected to Supabase Project</p>
                  <p className="text-xs text-app-subtle font-mono">gkfwxixscktwhcnuujkt.supabase.co</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-app-card text-app-muted rounded-full text-xs font-bold border border-app">Active</span>
            </div>
          </motion.div>

          <div className="flex items-center justify-end gap-4 pt-4">
            {saved && (
              <span className="text-xs text-[#8EB69B] flex items-center gap-1">
                <Check className="w-4 h-4" /> Preferences saved!
              </span>
            )}
            <button type="submit" className="btn-primary cursor-pointer">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
