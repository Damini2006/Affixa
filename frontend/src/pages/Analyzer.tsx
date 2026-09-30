import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, History, CheckCircle2, Clock, ArrowRight, Copy, Check, BookOpen, Lightbulb, GitFork } from 'lucide-react';
import { analyzeWord } from '../services/api';
import type { AnalysisResponse } from '../services/api';
import { DecompositionVisualizer } from '../components/DecompositionVisualizer';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link, useLocation } from 'react-router-dom';

const QUICK_EXAMPLES = ['unhappiness', 'disconnection', 'international', 'rewriting', 'beautiful', 'preprocessing'];

/* Morphological Family generation based on root lemma */
const generateFamilyWords = (rootLemma: string, currentWord: string): string[] => {
  const root = rootLemma.toLowerCase();
  const knownFamilies: Record<string, string[]> = {
    happy: ['happiness', 'unhappy', 'happily', 'unhappiness', 'unhappily'],
    connect: ['connection', 'disconnect', 'reconnect', 'connecting', 'connected', 'disconnection', 'interconnected'],
    nation: ['national', 'international', 'nationality', 'nationalism', 'transnational', 'nationhood'],
    write: ['writer', 'rewriting', 'written', 'unwritten', 'typewriter', 'rewrite'],
    beauty: ['beautiful', 'beautifully', 'beautify', 'beautician', 'beautification'],
    process: ['processing', 'processor', 'preprocess', 'preprocessing', 'reprocess', 'unprocessed'],
    form: ['formal', 'formation', 'conform', 'transform', 'information', 'reformation'],
    act: ['action', 'active', 'activate', 'actor', 'react', 'reaction', 'inactivity'],
    play: ['player', 'playful', 'replay', 'playing', 'playable', 'unplayable'],
    agree: ['agreement', 'disagree', 'disagreement', 'agreeable', 'agreeing'],
  };

  if (knownFamilies[root]) {
    return knownFamilies[root].filter(w => w.toLowerCase() !== currentWord.toLowerCase()).slice(0, 5);
  }

  // Fallback programmatic generation
  const generated = [
    `un${root}`,
    `re${root}`,
    `${root}ing`,
    `${root}ed`,
    `${root}able`,
    `${root}ment`,
    `${root}ness`
  ].filter(w => w.toLowerCase() !== currentWord.toLowerCase()).slice(0, 4);

  return generated;
};

export const Analyzer = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const { user } = useAuth();
  const location = useLocation();

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const { data, error: sbError } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (!sbError && data) {
        setHistory(data);
      }
    } catch {
      // Supabase fallback
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Handle auto-analyze from state (e.g. from CommandPalette)
  useEffect(() => {
    const auto = (location.state as any)?.autoAnalyze;
    if (auto && typeof auto === 'string') {
      setInput(auto);
      runAnalysis(auto);
    }
  }, [location.state]);

  const runAnalysis = async (wordToAnalyze: string) => {
    if (!wordToAnalyze.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await analyzeWord(wordToAnalyze.trim());
      setResult(res);

      if (user) {
        await supabase.from('analyses').insert({
          user_id: user.id,
          input_text: wordToAnalyze.trim(),
          results_json: res,
          method: res.method,
        });
        fetchHistory();
      }
    } catch {
      setError('Failed to analyze word. Please make sure the FastAPI backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(input);
  };

  const handleQuickChip = (word: string) => {
    setInput(word);
    runAnalysis(word);
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAiSummary = (res: AnalysisResponse) => {
    const parts = [];
    if (res.prefix) parts.push(`detected prefix "${res.prefix}"`);
    parts.push(`validated root "${res.root}" via WordNet`);
    if (res.suffix) parts.push(`suffix "${res.suffix}"`);
    const ruleNote = res.rule && res.rule !== 'none' ? ` after applying ${res.rule}` : '';
    return `Deconstructed into ${parts.join(', ')}${ruleNote} with ${(res.confidence * 100).toFixed(0)}% algorithmic confidence.`;
  };

  const familyWords = result?.root ? generateFamilyWords(result.root, result.word) : [];

  return (
    <div className="section-bg min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-app-muted mb-4 border-app">
            <Sparkles className="w-3.5 h-3.5 text-[#8EB69B]" /> Rule-Based Morphological Analyzer
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-app mb-4">Morphological Analyzer</h1>
          <p className="text-sm md:text-base text-app-muted max-w-2xl mx-auto">
            Extract pure morpheme boundaries with explainable spelling restoration and WordNet validation.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          onSubmit={handleAnalyze}
          className="max-w-2xl mx-auto mb-4 relative"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-5 text-app-subtle w-5 h-5" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a word (e.g. unhappiness, international)"
              className="input-dark w-full !pl-14 !pr-32 !py-4 text-base md:text-lg"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2.5 btn-primary !py-2.5 !px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
            </button>
          </div>
          {error && <p className="text-pink-400 mt-3 text-xs ml-2">{error}</p>}
        </motion.form>

        {/* Quick Example Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-2xl mx-auto text-xs">
          <span className="text-app-subtle text-[11px] font-medium mr-1">Try examples:</span>
          {QUICK_EXAMPLES.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => handleQuickChip(word)}
              className="px-2.5 py-1 rounded-lg bg-app-card border border-app text-app-muted hover:text-app hover:border-app-hover transition-colors font-mono cursor-pointer"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Result Breakdown Card */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-3xl p-6 sm:p-8 border-app mb-10 shadow-xl"
          >
            <DecompositionVisualizer analysis={result} />

            {/* AI-Style Smart Insight Banner */}
            <div className="mt-8 p-4 rounded-2xl bg-app-deep border border-app flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-app-card border border-app flex items-center justify-center text-app-muted shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-[#8EB69B]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-app uppercase tracking-wider">AI Morphological Insight</span>
                  <span className="text-[10px] font-mono text-app-muted px-2 py-0.5 rounded bg-app-card border border-app">WordNet Lexicon</span>
                </div>
                <p className="text-xs text-app-muted leading-relaxed font-sans">
                  {getAiSummary(result)}
                </p>
              </div>
            </div>

            {/* Morphological Word Family Explorer */}
            {familyWords.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-app-card border border-app">
                <div className="flex items-center gap-2 text-xs font-bold text-app mb-2">
                  <GitFork className="w-3.5 h-3.5 text-[#8EB69B]" />
                  <span>Morphological Word Family for Root: <strong className="text-[#8EB69B] font-mono">{result.root}</strong></span>
                </div>
                <p className="text-[11px] text-app-subtle mb-3">Click any related family member to deconstruct its derivation path:</p>
                <div className="flex flex-wrap gap-2">
                  {familyWords.map(fw => (
                    <button
                      key={fw}
                      type="button"
                      onClick={() => handleQuickChip(fw)}
                      className="px-3 py-1 rounded-xl bg-app-deep border border-app text-xs font-mono text-app-muted hover:text-app hover:border-app-hover transition-colors cursor-pointer"
                    >
                      {fw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="p-3.5 rounded-2xl bg-app-deep border border-app">
                <span className="block text-[11px] text-app-subtle mb-1 font-semibold">Confidence Score</span>
                <span className="text-xl font-extrabold text-app">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-app-deep border border-app">
                <span className="block text-[11px] text-app-subtle mb-1 font-semibold">Resolution Method</span>
                <span className="text-sm font-semibold text-app capitalize">{result.method}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-app-deep border border-app">
                <span className="block text-[11px] text-app-subtle mb-1 font-semibold">Spelling Rule</span>
                <span className="text-sm font-semibold text-app capitalize">{result.rule || 'None'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-app-deep border border-app">
                <span className="block text-[11px] text-app-subtle mb-1 font-semibold">Lexicon Validation</span>
                <span className="text-sm font-semibold text-app">
                  {result.is_valid ? '✓ Valid Lemma' : '⚠ Unverified'}
                </span>
              </div>
            </div>

            {/* Contextual Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-app">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-xl bg-app-card border border-app text-xs text-app-muted hover:text-app hover:border-app-hover transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#8EB69B]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <Link
                  to="/dictionary"
                  className="px-3 py-1.5 rounded-xl bg-app-card border border-app text-xs text-app-muted hover:text-app hover:border-app-hover transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Affix Library</span>
                </Link>
              </div>

              <Link
                to="/comparison"
                className="text-xs text-app-muted hover:text-app flex items-center gap-1 font-medium transition-colors"
              >
                <span>Compare with Porter & Snowball Stemmers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* User History Table (Isolated per user via Supabase RLS) */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 border-app"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-app">
              <h3 className="text-sm font-bold text-app flex items-center gap-2">
                <History className="w-4 h-4 text-[#8EB69B]" /> Recent Analyses
              </h3>
              <span className="text-[11px] text-app-subtle font-mono">Row-Level Security Active</span>
            </div>

            <div className="divide-y divide-app">
              {history.map((item) => {
                const res = item.results_json;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInput(item.input_text);
                      setResult(res);
                    }}
                    className="py-2.5 flex items-center justify-between text-xs hover:bg-app-card px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4 font-mono">
                      <span className="font-bold text-app">{item.input_text}</span>
                      <div className="text-[11px] flex items-center gap-1.5">
                        {res?.prefix && <span className="text-amber-500 font-semibold">[{res.prefix}]</span>}
                        <span className="text-app font-bold">{res?.root}</span>
                        {res?.suffix && <span className="text-teal-600 font-semibold">[{res.suffix}]</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-app-muted">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8EB69B]" />
                        {(res?.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-app-subtle">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
