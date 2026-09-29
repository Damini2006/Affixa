import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, History, CheckCircle2, Clock } from 'lucide-react';
import { analyzeWord } from '../services/api';
import type { AnalysisResponse } from '../services/api';
import { DecompositionVisualizer } from '../components/DecompositionVisualizer';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Analyzer = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');
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
      // Supabase connection or table uninitialized fallback
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await analyzeWord(input.trim());
      setResult(res);

      // Save to user history in Supabase if logged in
      if (user) {
        await supabase.from('analyses').insert({
          user_id: user.id,
          input_text: input.trim(),
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

  return (
    <div className="section-bg min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-[#8EB69B] mb-4 border-[#8EB69B]/20">
            <Sparkles className="w-3.5 h-3.5" /> Rule-Based Morphological Analyzer
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#DAF1DE] mb-4">Morphological Analyzer</h1>
          <p className="text-lg text-[#8EB69B]/70 max-w-2xl mx-auto">
            Break words into their meaningful morphological components. Understand prefixes, roots, and suffixes.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          onSubmit={handleAnalyze}
          className="max-w-2xl mx-auto mb-12 relative"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-5 text-[#8EB69B]/60 w-5 h-5" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a word (e.g. unhappiness)"
              className="input-dark w-full !pl-14 !pr-32 !py-5 text-lg"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-3 btn-primary !py-3 !px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
            </button>
          </div>
          {error && <p className="text-pink-400 mt-3 text-sm ml-2">{error}</p>}
        </motion.form>

        {/* Result Breakdown Card */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-3xl p-8 border-[#8EB69B]/20 mb-12"
          >
            <DecompositionVisualizer analysis={result} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 border-t border-[#8EB69B]/10 pt-8">
              <div className="p-4 rounded-2xl bg-[#0B2B26] border border-[#8EB69B]/15">
                <span className="block text-xs text-[#8EB69B]/70 mb-1">Confidence Score</span>
                <span className="text-2xl font-extrabold text-[#DAF1DE]">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0B2B26] border border-[#8EB69B]/15">
                <span className="block text-xs text-[#8EB69B]/70 mb-1">Method</span>
                <span className="text-base font-semibold text-[#DAF1DE] capitalize">{result.method}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0B2B26] border border-[#8EB69B]/15">
                <span className="block text-xs text-[#8EB69B]/70 mb-1">Spelling Rule</span>
                <span className="text-base font-semibold text-[#DAF1DE] capitalize">{result.rule}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0B2B26] border border-[#8EB69B]/15">
                <span className="block text-xs text-[#8EB69B]/70 mb-1">Lexicon Validation</span>
                <span className="text-base font-semibold text-[#DAF1DE]">
                  {result.is_valid ? '✓ WordNet Confirmed' : '⚠ Unknown Root'}
                </span>
              </div>
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
              <h3 className="text-base font-bold text-[#DAF1DE] flex items-center gap-2">
                <History className="w-4 h-4 text-[#8EB69B]" /> Your Recent Analysis History
              </h3>
              <span className="text-xs text-[#8EB69B]/60 font-mono">Row-Level Security Active</span>
            </div>

            <div className="divide-y divide-[#8EB69B]/10">
              {history.map((item) => {
                const res = item.results_json;
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between text-sm hover:bg-[#8EB69B]/5 px-3 rounded-xl transition-colors">
                    <div className="flex items-center gap-4 font-mono">
                      <span className="font-bold text-[#DAF1DE]">{item.input_text}</span>
                      <div className="text-xs flex items-center gap-2">
                        {res?.prefix && <span className="text-amber-400">[{res.prefix}]</span>}
                        <span className="text-[#8EB69B] font-extrabold">{res?.root}</span>
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
