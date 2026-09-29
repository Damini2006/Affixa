import { motion } from 'framer-motion';
import { BarChart3, Activity, PieChart as PieIcon, Cpu, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const AFFIX_FREQ_DATA = [
  { name: 'un-', count: 142, type: 'prefix' },
  { name: '-ing', count: 189, type: 'suffix' },
  { name: 'dis-', count: 94, type: 'prefix' },
  { name: '-tion', count: 126, type: 'suffix' },
  { name: 're-', count: 110, type: 'prefix' },
  { name: '-ed', count: 165, type: 'suffix' },
  { name: '-ful', count: 78, type: 'suffix' },
  { name: 'pre-', count: 64, type: 'prefix' },
];

const RULE_DIST_DATA = [
  { name: 'y → i restoration', value: 34, color: '#e2b857' },
  { name: 'Silent-e restoration', value: 42, color: '#8EB69B' },
  { name: 'Consonant degemination', value: 18, color: '#7ec8c8' },
  { name: 'Direct affix strip', value: 120, color: '#235347' },
];

export const Analytics = () => {
  return (
    <div className="section-bg min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-[#8EB69B] mb-4 border-[#8EB69B]/20">
            <BarChart3 className="w-3.5 h-3.5" /> Real-time System Metrics
          </div>
          <h1 className="text-4xl font-extrabold text-[#DAF1DE] mb-3">Morphology Analytics Dashboard</h1>
          <p className="text-[#8EB69B]/70 max-w-xl mx-auto text-sm">
            Statistical breakdown of morpheme occurrences, spelling rule frequencies, and engine performance metrics.
          </p>
        </motion.div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider">Total Words Analyzed</span>
              <Activity className="w-4 h-4 text-[#8EB69B]" />
            </div>
            <p className="text-3xl font-extrabold text-[#DAF1DE]">1,482</p>
            <p className="text-[11px] text-[#8EB69B] mt-1">+12% this week</p>
          </div>

          <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider">Avg Confidence</span>
              <Cpu className="w-4 h-4 text-[#8EB69B]" />
            </div>
            <p className="text-3xl font-extrabold text-[#DAF1DE]">94.2%</p>
            <p className="text-[11px] text-[#8EB69B] mt-1">WordNet validated</p>
          </div>

          <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider">Prefix Matches</span>
              <PieIcon className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-amber-400">410</p>
            <p className="text-[11px] text-[#8EB69B]/60 mt-1">Active prefixes</p>
          </div>

          <div className="glass rounded-2xl p-5 border-[#8EB69B]/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8EB69B]/60 font-semibold uppercase tracking-wider">Suffix Matches</span>
              <RefreshCw className="w-4 h-4 text-teal-300" />
            </div>
            <p className="text-3xl font-extrabold text-teal-300">722</p>
            <p className="text-[11px] text-[#8EB69B]/60 mt-1">Active suffixes</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6 border-[#8EB69B]/15">
            <h3 className="font-bold text-[#DAF1DE] text-lg mb-1">Top Morpheme Frequency</h3>
            <p className="text-xs text-[#8EB69B]/70 mb-6">Most frequently detected affixes in processed corpora</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AFFIX_FREQ_DATA}>
                  <XAxis dataKey="name" stroke="#8EB69B" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8EB69B" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B2B26', borderColor: '#8EB69B', borderRadius: '12px', color: '#DAF1DE' }}
                  />
                  <Bar dataKey="count" fill="#8EB69B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6 border-[#8EB69B]/15">
            <h3 className="font-bold text-[#DAF1DE] text-lg mb-1">Spelling Rule Frequencies</h3>
            <p className="text-xs text-[#8EB69B]/70 mb-6">Distribution of morphophonological rules triggered</p>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RULE_DIST_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {RULE_DIST_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B2B26', borderColor: '#8EB69B', borderRadius: '12px', color: '#DAF1DE' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-[#8EB69B]/10 pt-4 text-xs">
              {RULE_DIST_DATA.map(r => (
                <div key={r.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="text-[#8EB69B]/80 truncate">{r.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
