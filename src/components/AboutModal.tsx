import React from "react";
import { X, Info, Shield, Zap, Cpu, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AboutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
            className="relative bg-white border-4 border-black shadow-brutal-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b-4 border-black flex items-center justify-between bg-accent">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                  <Info className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-black uppercase tracking-tighter">About MMM</h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-offwhite">
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-black uppercase tracking-tighter leading-none">Professional Media Compliance</h3>
                <p className="text-black font-bold uppercase tracking-tight leading-relaxed">
                  MMM MediaMetaManagement is a professional media compliance and transformation platform for digital signage and AV workflows. 
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FeatureItem 
                  icon={<Cpu className="w-6 h-6" />}
                  title="FFmpeg Core"
                  description="Powered by the industry-standard FFmpeg engine for precise control."
                />
                <FeatureItem 
                  icon={<Shield className="w-6 h-6" />}
                  title="Secure Processing"
                  description="All files are processed on a secure, isolated server environment."
                />
                <FeatureItem 
                  icon={<Zap className="w-6 h-6" />}
                  title="Real-time Progress"
                  description="Track your transcoding jobs frame-by-frame with live updates."
                />
                <FeatureItem 
                  icon={<CheckCircle2 className="w-6 h-6" />}
                  title="Verified Outputs"
                  description="Every output is automatically validated for delivery integrity."
                />
              </div>

              <div className="p-8 bg-white border-4 border-black shadow-brutal-sm">
                <h4 className="font-black text-black uppercase tracking-widest mb-4">Technical Specifications</h4>
                <ul className="space-y-3 text-xs font-black text-black/60 uppercase tracking-widest">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent border border-black" />
                    Supports H.264, H.265 (HEVC), VP9
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent border border-black" />
                    Audio normalization & multi-channel
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent border border-black" />
                    Automatic thumbnail generation
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent border border-black" />
                    Custom preset management
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-black uppercase tracking-widest">Terms & Privacy</h4>
                <p className="text-[10px] text-black/40 font-black uppercase tracking-widest leading-relaxed">
                  By using MMM MediaMetaManagement, you agree to our terms of service. We prioritize your privacy: 
                  uploaded files are processed locally or on secure temporary storage and are automatically 
                  purged after processing is complete.
                </p>
              </div>
            </div>

            <div className="px-8 py-6 border-t-4 border-black bg-white flex items-center justify-between">
              <span className="text-[10px] text-black/40 font-black uppercase tracking-widest">Version 1.2.0</span>
              <button
                onClick={onClose}
                className="brutal-btn bg-black text-white px-10 py-2"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-6">
      <div className="shrink-0 w-12 h-12 border-2 border-black bg-accent text-black flex items-center justify-center shadow-brutal-sm">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-black text-sm uppercase tracking-tighter">{title}</h4>
        <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  );
}
