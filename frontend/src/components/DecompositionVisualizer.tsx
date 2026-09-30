import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResponse } from '../services/api';
import { ChevronRight, GitCommit, Layers, Sparkles, ArrowDown } from 'lucide-react';

interface VisualizerProps {
  analysis: AnalysisResponse | null;
}

const item = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

/* Etymology and Morphological Class lookup */
const AFFIX_METADATA: Record<string, { origin: string; type: string; meaning: string }> = {
  un:    { origin: 'Old English', type: 'Derivational Prefix', meaning: 'negation / reversal' },
  dis:   { origin: 'Latin',       type: 'Derivational Prefix', meaning: 'apart / away / not' },
  inter: { origin: 'Latin',       type: 'Derivational Prefix', meaning: 'between / among' },
  re:    { origin: 'Latin',       type: 'Derivational Prefix', meaning: 'again / back' },
  pre:   { origin: 'Latin',       type: 'Derivational Prefix', meaning: 'before / in advance' },
  counter: { origin: 'Latin',     type: 'Derivational Prefix', meaning: 'opposite / opposing' },
  mis:   { origin: 'Old English', type: 'Derivational Prefix', meaning: 'bad / wrongly' },
  in:    { origin: 'Latin',       type: 'Derivational Prefix', meaning: 'not / into' },
  im:    { origin: 'Latin',       type: 'Derivational Prefix', meaning: 'not / opposite' },
  non:   { origin: 'Latin',       type: 'Derivational Prefix', meaning: 'not / absence' },
  
  ness:  { origin: 'Old English', type: 'Derivational Suffix (Noun)', meaning: 'state or quality' },
  tion:  { origin: 'Latin',       type: 'Derivational Suffix (Noun)', meaning: 'action or process' },
  al:    { origin: 'Latin',       type: 'Derivational Suffix (Adj)',  meaning: 'relating to' },
  ing:   { origin: 'Old English', type: 'Inflectional Suffix (Verb)', meaning: 'continuous aspect' },
  ed:    { origin: 'Old English', type: 'Inflectional Suffix (Verb)', meaning: 'past tense' },
  ful:   { origin: 'Old English', type: 'Derivational Suffix (Adj)',  meaning: 'full of' },
  less:  { origin: 'Old English', type: 'Derivational Suffix (Adj)',  meaning: 'without' },
  ly:    { origin: 'Old English', type: 'Derivational Suffix (Adv)',  meaning: 'in the manner of' },
  ize:   { origin: 'Greek',       type: 'Derivational Suffix (Verb)', meaning: 'to make or cause' },
  able:  { origin: 'Latin',       type: 'Derivational Suffix (Adj)',  meaning: 'capable of being' },
  ment:  { origin: 'Latin',       type: 'Derivational Suffix (Noun)', meaning: 'result or state' },
};

export const DecompositionVisualizer: React.FC<VisualizerProps> = ({ analysis }) => {
  const [viewMode, setViewMode] = useState<'blocks' | 'tree'>('blocks');

  if (!analysis) return null;

  const { prefix, root, suffix, word } = analysis;
  const prefixClean = prefix?.replace(/^-|-$/g, '').toLowerCase() || '';
  const suffixClean = suffix?.replace(/^-|-$/g, '').toLowerCase() || '';

  const prefixMeta = prefixClean ? AFFIX_METADATA[prefixClean] : null;
  const suffixMeta = suffixClean ? AFFIX_METADATA[suffixClean] : null;

  return (
    <div className="w-full">
      {/* View Switcher */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-app">
        <div className="flex items-center gap-2 text-xs font-semibold text-app-muted">
          <Sparkles className="w-4 h-4 text-[#8EB69B]" />
          <span>Morphological Representation</span>
        </div>

        <div className="flex items-center gap-1 bg-app-card p-1 rounded-xl border border-app text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode('blocks')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'blocks' ? 'bg-[#8EB69B] text-[#051F20] font-bold' : 'text-app-muted hover:text-app'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Morpheme Blocks</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'tree' ? 'bg-[#8EB69B] text-[#051F20] font-bold' : 'text-app-muted hover:text-app'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Derivation Tree</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'blocks' ? (
          /* ── BLOCK VIEW ── */
          <motion.div
            key="blocks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap items-center justify-center gap-4 py-6"
          >
            {prefix && (
              <motion.div variants={item} className="flex flex-col items-center">
                <div className="px-6 py-3.5 text-xl md:text-2xl font-bold border rounded-2xl morph-prefix font-mono shadow-md">
                  {prefix.toUpperCase()}
                </div>
                <span className="text-[11px] uppercase mt-2 font-bold tracking-widest text-amber-500">
                  {prefixMeta?.type ? 'Prefix' : 'Prefix'}
                </span>
                {prefixMeta && (
                  <span className="text-[10px] text-app-subtle mt-0.5">
                    {prefixMeta.origin} ({prefixMeta.meaning})
                  </span>
                )}
              </motion.div>
            )}

            {prefix && root && (
              <div className="text-app-subtle hidden sm:block">
                <ChevronRight className="w-5 h-5" />
              </div>
            )}

            {root && (
              <motion.div variants={item} className="flex flex-col items-center">
                <div className="px-8 py-3.5 text-2xl md:text-3xl font-extrabold border rounded-2xl morph-root font-mono shadow-md">
                  {root.toUpperCase()}
                </div>
                <span className="text-[11px] uppercase mt-2 font-bold tracking-widest text-[#8EB69B]">
                  Base Lemma (Root)
                </span>
                <span className="text-[10px] text-app-subtle mt-0.5">WordNet Verified</span>
              </motion.div>
            )}

            {root && suffix && (
              <div className="text-app-subtle hidden sm:block">
                <ChevronRight className="w-5 h-5" />
              </div>
            )}

            {suffix && (
              <motion.div variants={item} className="flex flex-col items-center">
                <div className="px-6 py-3.5 text-xl md:text-2xl font-bold border rounded-2xl morph-suffix font-mono shadow-md">
                  {suffix.toUpperCase()}
                </div>
                <span className="text-[11px] uppercase mt-2 font-bold tracking-widest text-teal-600">
                  {suffixMeta?.type ? 'Suffix' : 'Suffix'}
                </span>
                {suffixMeta && (
                  <span className="text-[10px] text-app-subtle mt-0.5">
                    {suffixMeta.origin} ({suffixMeta.meaning})
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* ── HIERARCHICAL DERIVATION TREE VIEW ── */
          <motion.div
            key="tree"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center py-6 max-w-md mx-auto"
          >
            {/* Step 1: Base Root */}
            <div className="flex flex-col items-center">
              <div className="px-5 py-2 rounded-xl bg-app-card border border-app text-sm font-mono font-bold text-app shadow-sm">
                🌱 Root: <span className="text-[#8EB69B]">{root}</span>
              </div>
              <span className="text-[10px] text-app-subtle mt-1">Lexical Primitive Base</span>
            </div>

            <ArrowDown className="w-4 h-4 text-app-muted my-2" />

            {/* Step 2: Suffix or Prefix application */}
            {prefix && (
              <>
                <div className="flex flex-col items-center">
                  <div className="px-4 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-xs font-mono text-amber-500 font-semibold">
                    + Prefix [{prefix}] ({prefixMeta?.meaning || 'derivation'})
                  </div>
                  <div className="px-5 py-2 mt-2 rounded-xl bg-app-card border border-app text-sm font-mono font-bold text-app">
                    → {prefix}{root}
                  </div>
                </div>
                <ArrowDown className="w-4 h-4 text-app-muted my-2" />
              </>
            )}

            {suffix && (
              <>
                <div className="flex flex-col items-center">
                  <div className="px-4 py-1.5 rounded-lg bg-teal-400/10 border border-teal-400/20 text-xs font-mono text-teal-600 font-semibold">
                    + Suffix [{suffix}] ({suffixMeta?.meaning || 'derivation'})
                  </div>
                </div>
                <ArrowDown className="w-4 h-4 text-app-muted my-2" />
              </>
            )}

            {/* Step 3: Final surface token */}
            <div className="flex flex-col items-center">
              <div className="px-6 py-2.5 rounded-2xl bg-[#8EB69B]/15 border border-[#8EB69B]/30 text-base font-mono font-extrabold text-app shadow-md">
                ✨ Final Surface Form: <span className="underline decoration-[#8EB69B]">{word}</span>
              </div>
              <span className="text-[10px] text-app-muted mt-1 font-mono">
                {analysis.rule && analysis.rule !== 'none' ? `Rule Applied: ${analysis.rule}` : 'Morphology fully resolved'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
