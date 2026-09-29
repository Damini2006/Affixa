import { motion } from 'framer-motion';
import type { AnalysisResponse } from '../services/api';
import { ChevronRight } from 'lucide-react';

interface VisualizerProps {
  analysis: AnalysisResponse | null;
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export const DecompositionVisualizer: React.FC<VisualizerProps> = ({ analysis }) => {
  if (!analysis) return null;

  const { prefix, root, suffix } = analysis;

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-4 py-8"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
    >
      {prefix && (
        <motion.div variants={item} className="flex flex-col items-center">
          <div className="px-6 py-4 text-2xl font-bold border rounded-xl morph-prefix glow-prefix">
            {prefix.toUpperCase()}
          </div>
          <span className="text-xs uppercase mt-2 font-medium tracking-widest text-slate-500">Prefix</span>
        </motion.div>
      )}

      {prefix && root && (
        <motion.div variants={item} className="text-slate-600">
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      )}

      {root && (
        <motion.div variants={item} className="flex flex-col items-center">
          <div className="px-8 py-4 text-3xl font-extrabold border rounded-xl morph-root glow-root">
            {root.toUpperCase()}
          </div>
          <span className="text-xs uppercase mt-2 font-medium tracking-widest text-slate-500">Root</span>
        </motion.div>
      )}

      {root && suffix && (
        <motion.div variants={item} className="text-slate-600">
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      )}

      {suffix && (
        <motion.div variants={item} className="flex flex-col items-center">
          <div className="px-6 py-4 text-2xl font-bold border rounded-xl morph-suffix glow-suffix">
            {suffix.toUpperCase()}
          </div>
          <span className="text-xs uppercase mt-2 font-medium tracking-widest text-slate-500">Suffix</span>
        </motion.div>
      )}
    </motion.div>
  );
};
