import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Sun, Moon, Code2, Copy, Play, Loader2,
  Check, User, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Developer API Playground state
  const [apiTab, setApiTab] = useState<'curl' | 'python' | 'js'>('curl');
  const [testWord, setTestWord] = useState('unhappiness');
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [snippetCopied, setSnippetCopied] = useState(false);

  const handleTestApi = async () => {
    setTestingApi(true);
    setTestResult(null);
    try {
      const start = performance.now();
      const res = await apiClient.post('/analyze/word', { word: testWord.trim() });
      const duration = (performance.now() - start).toFixed(1);
      setTestResult({ status: 200, duration: `${duration}ms`, data: res.data });
    } catch (err: any) {
      setTestResult({ status: err.response?.status || 500, error: err.message });
    } finally {
      setTestingApi(false);
    }
  };

  const curlSnippet = `curl -X POST "${API_BASE}/analyze/word" \\
  -H "Content-Type: application/json" \\
  -d '{"word": "${testWord}"}'`;

  const pythonSnippet = `import requests

url = "${API_BASE}/analyze/word"
payload = {"word": "${testWord}"}

response = requests.post(url, json=payload)
data = response.json()
print(data)`;

  const jsSnippet = `const response = await fetch("${API_BASE}/analyze/word", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ word: "${testWord}" })
});
const data = await response.json();
console.log(data);`;

  const getActiveSnippet = () => {
    if (apiTab === 'curl') return curlSnippet;
    if (apiTab === 'python') return pythonSnippet;
    return jsSnippet;
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getActiveSnippet());
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const themes = [
    { value: 'dark' as const, icon: Moon, label: 'Dark', hint: 'Forest-green low-light theme' },
    { value: 'light' as const, icon: Sun, label: 'Light', hint: 'Bright theme for daylight' },
  ];

  return (
    <div className="section-bg min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-app-muted mb-3 border-app">
            <SettingsIcon className="w-3.5 h-3.5 text-[#8EB69B]" /> Preferences
          </div>
          <h1 className="text-3xl font-extrabold text-app">Settings</h1>
          <p className="text-app-muted text-sm mt-1">Appearance, developer API and session controls.</p>
        </div>

        {/* ── APPEARANCE (real: persisted via ThemeContext) ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border-app">
          <div className="flex items-center gap-3 mb-5 border-b border-app pb-4">
            <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center">
              <Sun className="w-5 h-5 text-[#8EB69B]" />
            </div>
            <div>
              <h3 className="font-bold text-app text-lg">Appearance</h3>
              <p className="text-xs text-app-muted">Applied instantly and remembered in this browser</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3" role="group" aria-label="Theme">
            {themes.map(t => {
              const Icon = t.icon;
              const active = theme === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    active
                      ? 'bg-app-card border-[#8EB69B] shadow-md'
                      : 'bg-app-deep border-app hover:border-app-hover'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-[#8EB69B] text-[#051F20]' : 'bg-app-card text-app-muted'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-app flex items-center gap-1.5">
                      {t.label}
                      {active && <Check className="w-3.5 h-3.5 text-[#8EB69B]" />}
                    </p>
                    <p className="text-[11px] text-app-subtle truncate">{t.hint}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── DEVELOPER REST API PLAYGROUND (live, functional) ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass rounded-3xl p-6 border-app shadow-xl">
          <div className="flex items-center justify-between mb-6 border-b border-app pb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center">
                <Code2 className="w-5 h-5 text-[#8EB69B]" />
              </div>
              <div>
                <h3 className="font-bold text-app text-lg">Developer API Playground</h3>
                <p className="text-xs text-app-muted">Integrate the Affixa NLP engine into external pipelines</p>
              </div>
            </div>

            {/* Language tabs */}
            <div className="flex items-center gap-1 bg-app-deep p-1 rounded-xl border border-app text-xs">
              {(['curl', 'python', 'js'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setApiTab(tab)}
                  className={`px-3 py-1 rounded-lg uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                    apiTab === tab ? 'bg-[#8EB69B] text-[#051F20]' : 'text-app-muted hover:text-app'
                  }`}
                >
                  {tab === 'js' ? 'TypeScript / JS' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Test Word Input & Playground Trigger */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="w-full sm:flex-1">
              <input
                type="text"
                value={testWord}
                onChange={e => setTestWord(e.target.value)}
                placeholder="Test word (e.g. international)"
                className="input-dark !py-2.5 text-xs font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleTestApi}
              disabled={testingApi || !testWord.trim()}
              className="btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {testingApi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Execute Live API Call</span>
            </button>
          </div>

          {/* Code Snippet Box */}
          <div className="relative rounded-2xl bg-app-deep border border-app p-4 font-mono text-xs text-app overflow-x-auto mb-4">
            <button
              type="button"
              onClick={handleCopySnippet}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-app-card border border-app text-[11px] text-app-muted hover:text-app transition-colors flex items-center gap-1 cursor-pointer"
            >
              {snippetCopied ? <Check className="w-3 h-3 text-[#8EB69B]" /> : <Copy className="w-3 h-3" />}
              <span>{snippetCopied ? 'Copied' : 'Copy'}</span>
            </button>
            <pre className="text-app-muted leading-relaxed whitespace-pre-wrap">{getActiveSnippet()}</pre>
          </div>

          {/* Live Response Box */}
          {testResult && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-app-card border border-app font-mono text-xs">
              <div className="flex items-center justify-between mb-2 text-[11px] border-b border-app pb-2">
                <span className={`font-bold ${testResult.status === 200 ? 'text-[#8EB69B]' : 'text-pink-400'}`}>
                  HTTP {testResult.status}{testResult.status === 200 ? ' OK' : ''}
                </span>
                {testResult.duration && <span className="text-app-subtle">Latency: {testResult.duration}</span>}
              </div>
              <pre className="text-app leading-relaxed overflow-x-auto">
                {JSON.stringify(testResult.data || testResult.error, null, 2)}
              </pre>
            </motion.div>
          )}
        </motion.div>

        {/* ── SESSION ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="glass rounded-3xl p-6 border-app flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-app text-lg">Session</h3>
            <p className="text-xs text-app-muted">
              Signed in as <span className="text-app font-semibold">{user?.email}</span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-app-card border border-app text-app-muted hover:text-app hover:border-app-hover transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" /> View profile
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
