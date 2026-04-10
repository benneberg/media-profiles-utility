import React from "react";
import { X, BookOpen, Terminal, Code, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function DocumentationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Documentation</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              <DocSection title="Getting Started" icon={<Terminal className="w-5 h-5" />}>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  VideoMeta Pro is designed to be intuitive. Simply upload a video file to begin. 
                  The system will automatically extract technical metadata and generate a preview thumbnail.
                </p>
                <div className="space-y-3">
                  <Step number={1} text="Drag and drop your video file into the upload area." />
                  <Step number={2} text="Review the extracted metadata and compliance status." />
                  <Step number={3} text="Select a transcoding preset or create your own." />
                  <Step number={4} text="Track the progress and download your processed file." />
                </div>
              </DocSection>

              <DocSection title="Transcoding Presets" icon={<Code className="w-5 h-5" />}>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Presets define how your video is processed. You can use system-provided presets or create custom ones.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm mb-2">System Presets</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Standardized formats for Digital Signage (Full HD, 4K, Vertical) and Web Delivery.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm mb-2">Custom Presets</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Define your own codecs, bitrates, and resolutions for specific project requirements.
                    </p>
                  </div>
                </div>
              </DocSection>

              <DocSection title="Technical Details" icon={<FileText className="w-5 h-5" />}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="shrink-0 p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 text-sm">FFmpeg Engine</h4>
                      <p className="text-xs text-blue-700 leading-relaxed mt-1">
                        The core engine uses FFmpeg for all media processing tasks, ensuring high-fidelity output and broad format support.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div className="shrink-0 p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 text-sm">Metadata Probing</h4>
                      <p className="text-xs text-emerald-700 leading-relaxed mt-1">
                        Technical details are extracted using ffprobe, providing deep insights into streams, codecs, and container tags.
                      </p>
                    </div>
                  </div>
                </div>
              </DocSection>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DocSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <div className="pl-11">{children}</div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
        {number}
      </div>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}
