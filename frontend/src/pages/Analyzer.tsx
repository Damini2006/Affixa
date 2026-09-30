import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, History, CheckCircle2, Clock, ArrowRight, Copy, Check, BookOpen, Lightbulb } from 'lucide-react';
import { analyzeWord } from '../services/api';
import type { AnalysisResponse } from '../services/api';
import { DecompositionVisualizer } from '../components/DecompositionVisualizer';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const QUICK_EXAMPLES = ['unhappiness', 'disconnection', 'international', 'rewriting', 'beautiful', 'preprocessing'];

export const Analyzer = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const { user } = useAuth();

  // Load user history from Supabase (Row Level Security ensures only user's own data is fetched)
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

  const runAnalysis = async (wordToAnalyze: string) => {
    if (!wordToAnalyze.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await analyzeWord(wordToAnalyze.trim());
      setResult(res);

      // Save to user history in Supabase if logged in
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

  // Generate intelligent AI-style summary
  const getAiSummary = (res: AnalysisResponse) => {
    const parts = [];
    if (res.prefix) parts.push(`detected prefix "${res.prefix}"`);
    parts.push(`validated root "${res.root}" via WordNet`);
    if (res.suffix) parts.push(`suffix "${res.suffix}"`);
    const ruleNote = res.rule && res.rule !== 'none' ? ` after applying ${res.rule}` : '';
    return `Deconstructed into ${parts.join(', ')}${ruleNote} with ${(res.confidence * 100).toFixed(0)}% algorithmic confidence.`;
  };

  return (
    <div className="section-bg min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-[#8EB69B] mb-4 border-[#8EB69B]/20">
            <Sparkles className="w-3.5 h-3.5" /> Rule-Based Morphological Analyzer
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#DAF1DE] mb-4">Morphological Analyzer</h1>
          <p className="text-sm md:text-base text-[#8EB69B]/70 max-w-2xl mx-auto">
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
            <Search className="absolute left-5 text-[#8EB69B]/60 w-5 h-5" />
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
              className="absolute right-2.5 btn-primary !py-2.5 !px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
            </button>
          </div>
          {error && <p className="text-pink-400 mt-3 text-xs ml-2">{error}</p>}
        </motion.form>

        {/* Quick Example Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-2xl mx-auto text-xs">
          <span className="text-[#8EB69B]/60 text-[11px] font-medium mr-1">Try examples:</span>
          {QUICK_EXAMPLES.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => handleQuickChip(word)}
              className="px-2.5 py-1 rounded-lg bg-[#0B2B26] border border-[#8EB69B]/20 text-[#8EB69B] hover:text-[#DAF1DE] hover:border-[#8EB69B]/40 transition-colors font-mono"
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
            className="glass rounded-3xl p-8 border-[#8EB69B]/20 mb-10 shadow-xl"
          >
            <DecompositionVisualizer analysis={result} />

            {/* AI-Style Smart Insight Banner */}
            <div className="mt-8 p-4 rounded-2xl bg-[#0B2B26]/80 border border-[#8EB69B]/20 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#8EB69B]/15 border border-[#8EB69B]/30 flex items-center justify-center text-[#8EB69B] shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-[#DAF1DE] uppercase tracking-wider">AI Morphological Insight</span>
                  <span className="text-[10px] font-mono text-[#8EB69B] px-2 py-0.5 rounded bg-[#8EB69B]/10">WordNet Lexicon</span>
                </div>
                <p className="text-xs text-[#8EB69B]/90 leading-relaxed font-sans">
                  {getAiSummary(result)}
                </p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="p-3.5 rounded-2xl bg-[#0B2B26] border border-[#8EB69B]/15">
                <span className="block text-[11px] text-[#8EB69B]/70 mb-1 font-semibold">Confidence Score</span>
                <span className="text-xl font-extrabold text-[#DAF1DE]">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0B2B26] border border-[#8EB69B]/15">
                <span className="block text-[11px] text-[#8EB69B]/70 mb-1 font-semibold">Resolution Method</span>
                <span className="text-sm font-semibold text-[#DAF1DE] capitalize">{result.method}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0B2B26] border border-[#8EB69B]/15">
                <span className="block text-[11px] text-[#8EB69B]/70 mb-1 font-semibold">Spelling Rule</span>
                <span className="text-sm font-semibold text-[#DAF1DE] capitalize">{result.rule || 'None'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0B2B26] border border-[#8EB69B]/15">
                <span className="block text-[11px] text-[#8EB69B]/70 mb-1 font-semibold">Lexicon Validation</span>
                <span className="text-sm font-semibold text-[#DAF1DE]">
                  {result.is_valid ? '✓ Valid Lemma' : '⚠ Unverified'}
                </span>
              </div>
            </div>

            {/* Contextual Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-[#8EB69B]/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-xl bg-[#0B2B26] border border-[#8EB69B]/20 text-xs text-[#8EB69B] hover:text-[#DAF1DE] hover:border-[#8EB69B]/40 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#8EB69B]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <Link
                  to="/dictionary"
                  className="px-3 py-1.5 rounded-xl bg-[#0B2B26] border border-[#8EB69B]/20 text-xs text-[#8EB69B] hover:text-[#DAF1DE] hover:border-[#8EB69B]/40 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Affix Library</span>
                </Link>
              </div>

              <Link
                to="/comparison"
                className="text-xs text-[#8EB69B] hover:text-[#DAF1DE] flex items-center gap-1 font-medium transition-colors"
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
            className="glass rounded-3xl p-6 border-[#8EB69B]/15"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#8EB69B]/10">
              <h3 className="text-sm font-bold text-[#DAF1DE] flex items-center gap-2">
                <History className="w-4 h-4 text-[#8EB69B]" /> Recent Analyses
              </h3>
              <span className="text-[11px] text-[#8EB69B]/60 font-mono">Row-Level Security Active</span>
            </div>

            <div className="divide-y divide-[#8EB69B]/10">
              {history.map((item) => {
                const res = item.results_json;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInput(item.input_text);
                      setResult(res);
                    }}
                    className="py-2.5 flex items-center justify-between text-xs hover:bg-[#8EB69B]/5 px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4 font-mono">
                      <span className="font-bold text-[#DAF1DE]">{item.input_text}</span>
                      <div className="text-[11px] flex items-center gap-1.5">
                        {res?.prefix && <span className="text-amber-400">[{res.prefix}]</span>}
                        <span className="text-[#8EB69B] font-bold">{res?.root}</span>
                        {res?.suffix && <span className="text-teal-300">[{res.suffix}]</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#8EB69B]/70">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8EB69B]" />
                        {(res?.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#8EB69B]/50">
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
