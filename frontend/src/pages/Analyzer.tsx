import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { analyzeWord } from '../services/api';
import type { AnalysisResponse } from '../services/api';
import { DecompositionVisualizer } from '../components/DecompositionVisualizer';
import { motion } from 'framer-motion';

export const Analyzer = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await analyzeWord(input.trim());
      setResult(res);
    } catch {
      setError('Failed to analyze. Make sure the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-bg min-h-screen">
      <div className="max-w-4xl mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-sky-300 mb-6 border-sky-400/20">
            <Sparkles className="w-3.5 h-3.5" /> Rule-Based Morphological Analyzer
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">Morphological Analyzer</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Break words into their meaningful morphological components. Understand prefixes, roots, and suffixes.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          onSubmit={handleAnalyze}
          className="max-w-2xl mx-auto mb-16 relative"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-5 text-slate-500 w-5 h-5" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a word (e.g., unhappiness)"
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

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-3xl p-8 border-sky-400/10"
          >
            <DecompositionVisualizer analysis={result} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 border-t border-sky-400/[0.06] pt-8">
              <div className="p-4 rounded-2xl bg-sky-400/5 border border-sky-400/10">
                <span className="block text-sm text-slate-500 mb-1">Confidence</span>
                <span className="text-2xl font-bold text-white">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-sky-400/5 border border-sky-400/10">
                <span className="block text-sm text-slate-500 mb-1">Method</span>
                <span className="text-lg font-medium text-slate-200 capitalize">{result.method}</span>
              </div>
              <div className="p-4 rounded-2xl bg-sky-400/5 border border-sky-400/10">
                <span className="block text-sm text-slate-500 mb-1">Spelling Rule</span>
                <span className="text-lg font-medium text-slate-200 capitalize">{result.rule}</span>
              </div>
              <div className="p-4 rounded-2xl bg-sky-400/5 border border-sky-400/10">
                <span className="block text-sm text-slate-500 mb-1">Validation</span>
                <span className="text-lg font-medium text-slate-200">
                  {result.is_valid ? '✓ Validated' : '⚠ Unknown'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
