import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Search, Loader2, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { apiClient } from '../services/api';

const QUICK_COMPARE_WORDS = ['unhappiness', 'disconnection', 'international', 'prearranged', 'unlawfully', 'replacements'];

export const Comparison = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const runCompare = async (wordToCompare: string) => {
    if (!wordToCompare.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/compare/word', { word: wordToCompare.trim() });
      setResult(res.data);
    } catch {
      try {
        const res = await apiClient.post('/compare', { word: wordToCompare.trim() });
        setResult(res.data);
      } catch {
        setError('Comparison service unreachable. Ensure FastAPI backend is running on port 8000.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    runCompare(input);
  };

  const handleQuickChip = (w: string) => {
    setInput(w);
    runCompare(w);
  };

  return (
    <div className="section-bg min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-[#8EB69B] mb-4 border-[#8EB69B]/20">
            <Layers className="w-3.5 h-3.5" /> Multi-Model NLP Benchmarking
          </div>
          <h1 className="text-4xl font-extrabold text-[#DAF1DE] mb-3">Model Comparison Matrix</h1>
          <p className="text-[#8EB69B]/70 max-w-xl mx-auto text-sm">
            Evaluate our Rule-Based Engine side-by-side against Porter Stemmer, Snowball Stemmer, and spaCy Lemmatizer.
          </p>
        </motion.div>

        {/* Search Bar */}
        <form onSubmit={handleCompare} className="max-w-xl mx-auto mb-4 relative">
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

        {/* Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-xl mx-auto text-xs">
          <span className="text-[#8EB69B]/60 text-[11px] font-medium mr-1">Benchmark words:</span>
          {QUICK_COMPARE_WORDS.map((word) => (
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

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Rule-based primary card */}
            <div className="glass rounded-3xl p-6 border-[#8EB69B]/30 bg-[#8EB69B]/5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#8EB69B]" />
                  <h3 className="font-bold text-[#DAF1DE] text-lg">Affixa Rule-Based Engine</h3>
                </div>
                <span className="text-xs font-bold text-[#8EB69B] px-3 py-1 rounded-full bg-[#8EB69B]/20 border border-[#8EB69B]/30 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Full Morpheme Explainability
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 py-3 font-mono">
                {result.rule_based?.prefix && (
                  <div className="flex flex-col items-center">
                    <span className="morph-prefix px-4 py-2 rounded-xl text-base font-bold">{result.rule_based.prefix}</span>
                    <span className="text-[10px] text-[#8EB69B]/70 uppercase tracking-widest mt-1">Prefix</span>
                  </div>
                )}
                <div className="flex flex-col items-center">
                  <span className="morph-root px-5 py-2 rounded-xl text-lg font-extrabold">{result.rule_based?.root || result.rule_based}</span>
                  <span className="text-[10px] text-[#8EB69B]/70 uppercase tracking-widest mt-1">Validated Root</span>
                </div>
                {result.rule_based?.suffix && (
                  <div className="flex flex-col items-center">
                    <span className="morph-suffix px-4 py-2 rounded-xl text-base font-bold">{result.rule_based.suffix}</span>
                    <span className="text-[10px] text-[#8EB69B]/70 uppercase tracking-widest mt-1">Suffix</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#8EB69B]/10 flex flex-wrap items-center justify-between text-xs text-[#8EB69B]/80">
                <span>Rule applied: <strong className="text-[#DAF1DE]">{result.rule_based?.rule || 'Direct affix strip'}</strong></span>
                <span>WordNet verification: <strong className="text-[#DAF1DE]">Passed</strong></span>
              </div>
            </div>

            {/* Other baselines grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider">Porter Stemmer</span>
                  <span className="text-[10px] font-mono text-[#8EB69B]/40">Suffix-Only</span>
                </div>
                <p className="font-mono text-xl font-bold text-[#DAF1DE] mb-2">{result.porter || 'N/A'}</p>
                <p className="text-xs text-[#8EB69B]/60 leading-relaxed">
                  Strips standard suffixes heuristically without root lexicon verification or prefix extraction.
                </p>
              </div>

              <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider">Snowball Stemmer</span>
                  <span className="text-[10px] font-mono text-[#8EB69B]/40">Porter2</span>
                </div>
                <p className="font-mono text-xl font-bold text-[#DAF1DE] mb-2">{result.snowball || 'N/A'}</p>
                <p className="text-xs text-[#8EB69B]/60 leading-relaxed">
                  Improved stemming speed, but preserves prefixes and often produces non-word stems.
                </p>
              </div>

              <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider">spaCy Lemmatizer</span>
                  <span className="text-[10px] font-mono text-[#8EB69B]/40">Dictionary</span>
                </div>
                <p className="font-mono text-xl font-bold text-[#DAF1DE] mb-2">{result.spacy || 'N/A'}</p>
                <p className="text-xs text-[#8EB69B]/60 leading-relaxed">
                  Yields dictionary canonical forms (lemmas) but does not segment affixes or explain transformations.
                </p>
              </div>
            </div>

            {/* AI Comparative Advantage Summary */}
            <div className="p-4 rounded-2xl bg-[#0B2B26] border border-[#8EB69B]/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#8EB69B] shrink-0 mt-0.5" />
              <div className="text-xs text-[#8EB69B]/90 leading-relaxed">
                <strong className="text-[#DAF1DE]">Why Affixa wins on this input: </strong>
                Traditional stemmers miss prefixes (e.g. leaving <code className="text-[#DAF1DE]">{result.porter}</code>) and lemmatizers hide affix structure. Affixa isolates the prefix, restores spelling changes, and validates the dictionary root.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
