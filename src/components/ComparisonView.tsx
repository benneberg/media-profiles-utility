import React from "react";
import { useStore } from "../store";
import { X, ArrowRightLeft, CheckCircle2, Info, HardDrive, Clock, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white border-4 border-black shadow-brutal-lg w-full max-w-7xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b-4 border-black flex items-center justify-between bg-accent">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-black uppercase tracking-tighter">Variant Comparison</h2>
                <p className="text-xs font-black text-black/40 uppercase tracking-widest">Comparing {selectedJobs.length} processing results</p>
              </div>
            </div>
            <button 
              onClick={clearComparison}
              className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Comparison Grid */}
          <div className="flex-1 overflow-x-auto p-8 bg-offwhite">
            <div className={cn(
              "grid gap-10 min-w-max h-full",
              selectedJobs.length === 1 ? "grid-cols-1" : 
              selectedJobs.length === 2 ? "grid-cols-2" : "grid-cols-3"
            )}>
              {selectedJobs.map((job) => (
                <div key={job.id} className="w-[400px] flex flex-col gap-8">
                  {/* Thumbnail Preview */}
                  <div className="aspect-video border-4 border-black overflow-hidden bg-black shadow-brutal-sm relative group">
                    {job.thumbnailUrl ? (
                      <img 
                        src={job.thumbnailUrl} 
                        alt={job.preset.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Info className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-accent border-2 border-black text-black text-[10px] font-black uppercase tracking-widest">
                      {job.preset.name}
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  {job.thumbnailStrip && job.thumbnailStrip.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Visual Timeline</p>
                      <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar">
                        {job.thumbnailStrip.map((url, i) => (
                          <img 
                            key={i} 
                            src={url} 
                            alt={`Strip ${i}`} 
                            className="h-20 aspect-video border-2 border-black object-cover shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-zoom-in"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Table */}
                  <div className="bg-white border-4 border-black p-6 space-y-8 shadow-brutal-sm">
                    <div className="flex items-center justify-between border-b-2 border-black pb-4">
                      <h3 className="font-black text-black uppercase tracking-tighter">Technical Specs</h3>
                      <div className="flex items-center gap-2 text-black bg-accent px-2 py-1 border-2 border-black text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4" />
                        Compliant
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                      <CompareDetail icon={<Layers className="w-5 h-5" />} label="Codec" value={job.preset.video.codec.replace('lib', '').toUpperCase()} />
                      <CompareDetail icon={<HardDrive className="w-5 h-5" />} label="Bitrate" value={job.preset.video.bitrate} />
                      <CompareDetail icon={<ArrowRightLeft className="w-5 h-5" />} label="Resolution" value={`${job.preset.video.width}x${job.preset.video.height}`} />
                      <CompareDetail icon={<Clock className="w-5 h-5" />} label="Frame Rate" value={`${job.preset.video.fps} fps`} />
                    </div>

                    <div className="pt-6 border-t-2 border-black">
                      <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-3">Preset Description</p>
                      <p className="text-xs text-black font-bold uppercase tracking-tight leading-relaxed">
                        {job.preset.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <a 
                      href={`/api/download/${job.id}`}
                      className="flex-1 brutal-btn bg-black text-white py-4"
                    >
                      Download Variant
                    </a>
                    <button 
                      onClick={() => toggleComparisonJob(job.id)}
                      className="w-14 h-14 border-4 border-black bg-white text-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-brutal-sm hover:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t-4 border-black bg-white flex items-center justify-between">
            <span className="text-[10px] text-black/40 font-black uppercase tracking-widest">A/B Engineering Comparison Engine</span>
            <button
              onClick={clearComparison}
              className="brutal-btn bg-white text-black px-8 py-2"
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
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-black/40">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-black text-black uppercase tracking-tighter">{value}</p>
    </div>
  );
}
