import React from "react";
import { X, Info, Shield, Zap, Cpu, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Info className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">About VideoMeta Pro</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900">Professional Media Compliance</h3>
                <p className="text-slate-600 leading-relaxed">
                  VideoMeta Pro is a media compliance and transformation platform for digital signage and AV workflows. 
                  It analyzes video assets, validates them against playback profiles, and generates compliant variants.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureItem 
                  icon={<Cpu className="w-5 h-5" />}
                  title="FFmpeg Core"
                  description="Powered by the industry-standard FFmpeg engine for precise control over every frame."
                />
                <FeatureItem 
                  icon={<Shield className="w-5 h-5" />}
                  title="Secure Processing"
                  description="All files are processed on a secure, isolated server environment with automatic cleanup."
                />
                <FeatureItem 
                  icon={<Zap className="w-5 h-5" />}
                  title="Real-time Progress"
                  description="Track your transcoding jobs frame-by-frame with live progress updates."
                />
                <FeatureItem 
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  title="Verified Outputs"
                  description="Every output is automatically validated and checksummed for delivery integrity."
                />
              </div>

              <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Technical Specifications</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Supports H.264, H.265 (HEVC), VP9, and more
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Audio normalization and multi-channel support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Automatic thumbnail generation for all assets
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Custom preset management with persistence
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900">Terms & Privacy</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  By using VideoMeta Pro, you agree to our terms of service. We prioritize your privacy: 
                  uploaded files are processed locally or on secure temporary storage and are automatically 
                  purged after processing is complete.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Version 1.2.0</span>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
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
    <div className="flex gap-4">
      <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  );
}
