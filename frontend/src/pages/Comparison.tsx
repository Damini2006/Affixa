import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Search, Loader2, CheckCircle } from 'lucide-react';
import { apiClient } from '../services/api';

export const Comparison = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/compare/word', { word: input.trim() });
      setResult(res.data);
    } catch {
      // Fallback mock comparison if endpoint route is /compare or backend offline
      try {
        const res = await apiClient.post('/compare', { word: input.trim() });
        setResult(res.data);
      } catch {
        setError('Comparison service unreachable. Ensure FastAPI backend is running on port 8000.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-bg min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-[#8EB69B] mb-4 border-[#8EB69B]/20">
            <Layers className="w-3.5 h-3.5" /> Benchmarking & Comparison
          </div>
          <h1 className="text-4xl font-extrabold text-[#DAF1DE] mb-3">Model Comparison Matrix</h1>
          <p className="text-[#8EB69B]/70 max-w-xl mx-auto text-sm">
            Compare our Rule-Based Morphological Engine against Porter Stemmer, Snowball Stemmer, and spaCy Lemmatizer.
          </p>
        </motion.div>

        <form onSubmit={handleCompare} className="max-w-xl mx-auto mb-12 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-[#8EB69B]/60 w-5 h-5" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter word to compare (e.g. unhappiness)"
              className="input-dark w-full !pl-12 !pr-32 !py-4 text-base"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2.5 btn-primary !py-2.5 !px-5 !text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Compare'}
            </button>
          </div>
          {error && <p className="text-pink-400 mt-3 text-xs ml-2">{error}</p>}
        </form>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Rule-based primary card */}
            <div className="glass rounded-3xl p-6 border-[#8EB69B]/30 bg-[#8EB69B]/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#8EB69B]" />
                  <h3 className="font-bold text-[#DAF1DE] text-lg">Affixa Rule-Based Engine (Our Approach)</h3>
                </div>
                <span className="text-xs font-bold text-[#8EB69B] px-3 py-1 rounded-full bg-[#8EB69B]/20 border border-[#8EB69B]/30">
                  Full Morpheme Breakdown
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 py-2 font-mono">
                {result.rule_based?.prefix && (
                  <span className="morph-prefix px-3 py-1.5 rounded-xl text-sm font-bold">Prefix: {result.rule_based.prefix}</span>
                )}
                <span className="morph-root px-4 py-2 rounded-xl text-lg font-extrabold">Root: {result.rule_based?.root || result.rule_based}</span>
                {result.rule_based?.suffix && (
                  <span className="morph-suffix px-3 py-1.5 rounded-xl text-sm font-bold">Suffix: {result.rule_based.suffix}</span>
                )}
              </div>
            </div>

            {/* Other baselines grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
                <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider block mb-2">Porter Stemmer</span>
                <p className="font-mono text-xl font-bold text-[#DAF1DE]">{result.porter || 'N/A'}</p>
                <p className="text-[11px] text-[#8EB69B]/50 mt-2">Heuristic suffix stripping without dictionary check.</p>
              </div>

              <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
                <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider block mb-2">Snowball Stemmer</span>
                <p className="font-mono text-xl font-bold text-[#DAF1DE]">{result.snowball || 'N/A'}</p>
                <p className="text-[11px] text-[#8EB69B]/50 mt-2">Algorithmic stemming (Porter2).</p>
              </div>

              <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
                <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider block mb-2">spaCy Lemmatizer</span>
                <p className="font-mono text-xl font-bold text-[#DAF1DE]">{result.spacy || 'N/A'}</p>
                <p className="text-[11px] text-[#8EB69B]/50 mt-2">Dictionary lemma lookup without prefix/suffix segmentation.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
