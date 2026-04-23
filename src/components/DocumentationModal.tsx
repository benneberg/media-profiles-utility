import React from "react";
import { X, BookOpen, Terminal, Code, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white border-4 border-black shadow-brutal-lg w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b-4 border-black flex items-center justify-between bg-accent">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-black uppercase tracking-tighter">Documentation</h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 bg-offwhite">
              <DocSection title="Getting Started" icon={<Terminal className="w-6 h-6" />}>
                <p className="text-black font-bold uppercase tracking-tight leading-relaxed mb-6">
                  MMM MediaMetaManagement is designed to be intuitive. Simply upload a video file to begin. 
                </p>
                <div className="space-y-4">
                  <Step number={1} text="Drag and drop your video file into the upload area." />
                  <Step number={2} text="Review the extracted metadata and compliance status." />
                  <Step number={3} text="Select a transcoding preset or create your own." />
                  <Step number={4} text="Track the progress and download your processed file." />
                </div>
              </DocSection>

              <DocSection title="Transcoding Presets" icon={<Code className="w-6 h-6" />}>
                <p className="text-black/60 font-black uppercase tracking-widest text-xs mb-6 leading-relaxed">
                  Presets define how your video is processed. You can use system-provided presets or create custom ones.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white border-4 border-black shadow-brutal-sm">
                    <h4 className="font-black text-black text-sm uppercase tracking-tighter mb-2">System Presets</h4>
                    <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-relaxed">
                      Standardized formats for Digital Signage (Full HD, 4K, Vertical) and Web Delivery.
                    </p>
                  </div>
                  <div className="p-6 bg-white border-4 border-black shadow-brutal-sm">
                    <h4 className="font-black text-black text-sm uppercase tracking-tighter mb-2">Custom Presets</h4>
                    <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-relaxed">
                      Define your own codecs, bitrates, and resolutions for specific project requirements.
                    </p>
                  </div>
                </div>
              </DocSection>

              <DocSection title="Technical Details" icon={<FileText className="w-6 h-6" />}>
                <div className="space-y-6">
                  <div className="flex items-start gap-6 p-6 bg-white border-4 border-black shadow-brutal-sm">
                    <div className="shrink-0 w-12 h-12 bg-accent border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-black text-sm uppercase tracking-tighter">FFmpeg Engine</h4>
                      <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-relaxed mt-1">
                        The core engine uses FFmpeg for all media processing tasks, ensuring high-fidelity output.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 p-6 bg-white border-4 border-black shadow-brutal-sm">
                    <div className="shrink-0 w-12 h-12 bg-accent border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                      <Code className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-black text-sm uppercase tracking-tighter">Metadata Probing</h4>
                      <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-relaxed mt-1">
                        Technical details are extracted using ffprobe, providing deep insights into streams.
                      </p>
                    </div>
                  </div>
                </div>
              </DocSection>
            </div>

            <div className="px-8 py-6 border-t-4 border-black bg-white flex items-center justify-end">
              <button
                onClick={onClose}
                className="brutal-btn bg-black text-white px-10 py-2"
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
          {icon}
        </div>
        <h3 className="text-xl font-black text-black uppercase tracking-tighter">{title}</h3>
      </div>
      <div className="pl-16">{children}</div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="shrink-0 w-8 h-8 bg-black text-white text-xs font-black flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-colors border-2 border-black">
        {number}
      </div>
      <p className="text-xs font-black text-black uppercase tracking-widest">{text}</p>
    </div>
  );
}
