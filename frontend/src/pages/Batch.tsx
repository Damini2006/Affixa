import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, Download, Layers, CheckCircle2 } from 'lucide-react';
import { analyzeText } from '../services/api';
import type { AnalysisResponse } from '../services/api';

export const Batch = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResponse[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults([]);
      setError('');
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      const res = await analyzeText(text);
      setResults(res);
    } catch {
      setError('Failed to process batch file. Ensure backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;
    const header = 'Word,Prefix,Root,Suffix,Rule,Confidence,Valid\n';
    const rows = results.map(r => `"${r.word}","${r.prefix}","${r.root}","${r.suffix}","${r.rule}",${(r.confidence * 100).toFixed(0)}%,${r.is_valid}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affixa_batch_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="section-bg min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-[#8EB69B] mb-4 border-[#8EB69B]/20">
            <Layers className="w-3.5 h-3.5" /> High-Throughput Processing
          </div>
          <h1 className="text-4xl font-extrabold text-[#DAF1DE] mb-3">Batch File Processing</h1>
          <p className="text-[#8EB69B]/70 max-w-xl mx-auto text-sm">
            Upload text documents or CSV lists to decompose thousands of words concurrently.
          </p>
        </motion.div>

        {/* Upload Dropzone */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-10 text-center border-dashed border-[#8EB69B]/30 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#8EB69B]/10 border border-[#8EB69B]/20 flex items-center justify-center text-[#8EB69B] mx-auto mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#DAF1DE] mb-1">Select a TXT or CSV file</h3>
          <p className="text-xs text-[#8EB69B]/70 mb-6">File should contain words separated by spaces or newlines</p>

          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="batch-upload"
          />
          <label
            htmlFor="batch-upload"
            className="btn-secondary cursor-pointer inline-flex"
          >
            Choose File
          </label>

          {file && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex flex-col items-center gap-3">
              <span className="text-sm font-mono text-[#DAF1DE] bg-[#0B2B26] px-4 py-1.5 rounded-xl border border-[#8EB69B]/20">
                📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                onClick={handleProcess}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Corpus...</> : 'Process Corpus'}
              </button>
            </motion.div>
          )}

          {error && <p className="text-pink-400 mt-4 text-xs">{error}</p>}
        </motion.div>

        {/* Results Table */}
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border-[#8EB69B]/20">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#8EB69B]/10">
              <div>
                <h3 className="text-lg font-bold text-[#DAF1DE] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#8EB69B]" />
                  Batch Analysis Complete ({results.length} words)
                </h3>
              </div>
              <button onClick={handleExportCSV} className="btn-secondary !py-2 !px-4 !text-xs">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#8EB69B]/10 text-[#8EB69B]/60 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">Word</th>
                    <th className="pb-3">Prefix</th>
                    <th className="pb-3">Root</th>
                    <th className="pb-3">Suffix</th>
                    <th className="pb-3">Rule</th>
                    <th className="pb-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8EB69B]/10 font-mono text-xs">
                  {results.slice(0, 50).map((r, i) => (
                    <tr key={i} className="hover:bg-[#8EB69B]/5 transition-colors">
                      <td className="py-3 pl-2 font-bold text-[#DAF1DE]">{r.word}</td>
                      <td className="py-3 text-amber-400">{r.prefix || '-'}</td>
                      <td className="py-3 text-[#8EB69B] font-extrabold">{r.root}</td>
                      <td className="py-3 text-teal-300">{r.suffix || '-'}</td>
                      <td className="py-3 text-[#8EB69B]/70 capitalize">{r.rule}</td>
                      <td className="py-3 font-semibold text-[#DAF1DE]">{(r.confidence * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.length > 50 && (
                <p className="text-center text-xs text-[#8EB69B]/60 mt-4">
                  Showing first 50 of {results.length} analyzed words. Export CSV to download complete dataset.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
