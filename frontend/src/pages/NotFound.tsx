import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Search, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="section-bg min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-3xl p-10 max-w-lg w-full text-center border-app shadow-2xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-app-card border border-app flex items-center justify-center text-app-muted mx-auto mb-6">
          <Compass className="w-8 h-8 animate-pulse text-[#8EB69B]" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-app-card text-app-muted font-mono text-xs uppercase tracking-widest font-semibold mb-3 border border-app">
          404 · Locus Not Found
        </span>

        <h1 className="text-3xl font-extrabold text-app mb-3">Morpheme Not Located</h1>
        <p className="text-sm text-app-muted leading-relaxed mb-8">
          The linguistic segment or page coordinate you requested does not exist in our index. Return to the analyzer or explore the library.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/analyzer" className="btn-primary !py-3 !px-5 text-xs flex items-center justify-center gap-2">
            <Search className="w-4 h-4" /> Go to Analyzer
          </Link>
          <Link to="/" className="btn-secondary !py-3 !px-5 text-xs flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
