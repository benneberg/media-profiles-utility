import React from "react";
import { useStore } from "../store";
import { X, ArrowRightLeft, CheckCircle2, Info, HardDrive, Clock, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatBytes } from "../lib/utils";

export default function ComparisonView() {
  const { jobs, comparisonJobIds, clearComparison, toggleComparisonJob } = useStore();
  
  const selectedJobs = jobs.filter(j => comparisonJobIds.includes(j.id));
  
  if (comparisonJobIds.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearComparison}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Variant Comparison</h2>
                <p className="text-sm text-slate-500 font-medium">Comparing {selectedJobs.length} processing results</p>
              </div>
            </div>
            <button 
              onClick={clearComparison}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
            >
              <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
            </button>
          </div>

          {/* Comparison Grid */}
          <div className="flex-1 overflow-x-auto p-8">
            <div className={cn(
              "grid gap-8 min-w-max h-full",
              selectedJobs.length === 1 ? "grid-cols-1" : 
              selectedJobs.length === 2 ? "grid-cols-2" : "grid-cols-3"
            )}>
              {selectedJobs.map((job) => (
                <div key={job.id} className="w-[400px] flex flex-col gap-6">
                  {/* Thumbnail Preview */}
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner relative group">
                    {job.thumbnailUrl ? (
                      <img 
                        src={job.thumbnailUrl} 
                        alt={job.preset.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <Info className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/20">
                      {job.preset.name}
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  {job.thumbnailStrip && job.thumbnailStrip.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visual Timeline</p>
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {job.thumbnailStrip.map((url, i) => (
                          <img 
                            key={i} 
                            src={url} 
                            alt={`Strip ${i}`} 
                            className="h-16 aspect-video rounded-lg object-cover border border-slate-200 shadow-sm shrink-0 hover:scale-105 transition-transform cursor-zoom-in"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Table */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <h3 className="font-bold text-slate-900">Technical Specs</h3>
                      <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        Compliant
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <CompareDetail icon={<Layers className="w-4 h-4" />} label="Codec" value={job.preset.video.codec.replace('lib', '').toUpperCase()} />
                      <CompareDetail icon={<HardDrive className="w-4 h-4" />} label="Bitrate" value={job.preset.video.bitrate} />
                      <CompareDetail icon={<ArrowRightLeft className="w-4 h-4" />} label="Resolution" value={`${job.preset.video.width}x${job.preset.video.height}`} />
                      <CompareDetail icon={<Clock className="w-4 h-4" />} label="Frame Rate" value={`${job.preset.video.fps} fps`} />
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preset Description</p>
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        "{job.preset.description}"
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a 
                      href={`/api/download/${job.id}`}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-center text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
                    >
                      Download Variant
                    </a>
                    <button 
                      onClick={() => toggleComparisonJob(job.id)}
                      className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">A/B Engineering Comparison Engine</span>
            <button
              onClick={clearComparison}
              className="px-6 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              Close Comparison
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function CompareDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
