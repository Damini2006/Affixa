import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';
import prefixesData from '../../../backend/app/nlp/dictionaries/prefixes.json';
import suffixesData from '../../../backend/app/nlp/dictionaries/suffixes.json';

interface AffixItem {
  affix: string;
  type: string;
  priority?: number;
  example_word?: string;
  description?: string;
}

export const Dictionary = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'prefixes' | 'suffixes'>('all');

  const prefixes = (prefixesData as AffixItem[]).map(p => ({ ...p, category: 'prefix' as const }));
  const suffixes = (suffixesData as AffixItem[]).map(s => ({ ...s, category: 'suffix' as const }));

  const allAffixes = [...prefixes, ...suffixes];

  const filtered = allAffixes.filter(item => {
    const matchesTab = activeTab === 'all' || (activeTab === 'prefixes' ? item.category === 'prefix' : item.category === 'suffix');
    const matchesQuery = item.affix.toLowerCase().includes(search.toLowerCase()) ||
                         (item.example_word && item.example_word.toLowerCase().includes(search.toLowerCase())) ||
                         (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesQuery;
  });

  return (
    <div className="section-bg min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-app-muted mb-4 border-app">
            <BookOpen className="w-3.5 h-3.5 text-[#8EB69B]" /> Linguistic Knowledgebase
          </div>
          <h1 className="text-4xl font-extrabold text-app mb-3">Affix Library & Dictionary</h1>
          <p className="text-app-muted max-w-xl mx-auto text-sm">
            Browse the morphological rule dictionary used by the longest-match engine.
          </p>
        </motion.div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search affixes..."
              className="input-dark !pl-10 !py-2.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-app-card p-1 rounded-xl border border-app">
            {(['all', 'prefixes', 'suffixes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === tab ? 'bg-[#8EB69B] text-[#051F20]' : 'text-app-muted hover:text-app'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <motion.div
              key={`${item.affix}-${idx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.01 }}
              className="glass rounded-2xl p-5 hover:border-app-hover transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`font-mono text-xl font-extrabold ${item.category === 'prefix' ? 'text-amber-500' : 'text-teal-600'}`}>
                  {item.category === 'prefix' ? `${item.affix}-` : `-${item.affix}`}
                </span>
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${
                  item.category === 'prefix' ? 'bg-amber-400/10 text-amber-500 border-amber-400/20' : 'bg-teal-400/10 text-teal-600 border-teal-400/20'
                }`}>
                  {item.category}
                </span>
              </div>

              <p className="text-xs text-app-muted mb-3 leading-relaxed">
                {item.description || `Common English ${item.category} affix.`}
              </p>

              {item.example_word && (
                <div className="text-xs border-t border-app pt-2.5 flex justify-between">
                  <span className="text-app-subtle">Example:</span>
                  <span className="font-mono text-app font-semibold">{item.example_word}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-app-subtle text-sm">
            No matching affixes found in dictionary.
          </div>
        )}
      </div>
    </div>
  );
};
