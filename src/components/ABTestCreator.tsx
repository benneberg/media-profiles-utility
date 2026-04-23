import React, { useState } from "react";
import { useStore } from "../store";
import { X, Play, Layers, CheckCircle2, Video, Settings2, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import axios from "axios";

import { v4 as uuidv4 } from "uuid";

export default function ABTestCreator({ onClose }: { onClose: () => void }) {
  const { assets, customPresets, addJob, addABTest } = useStore();
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([]);
  const [testName, setTestName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Common presets + custom presets
  const allPresets = [
    { id: "signage-4k", name: "Signage 4K (H.265)", description: "Ultra HD for modern players" },
    { id: "signage-fhd", name: "Signage FHD (H.264)", description: "Standard Full HD compatibility" },
    { id: "web-optimized", name: "Web Optimized", description: "Fast start, medium bitrate" },
    ...customPresets
  ];

  const toggleAsset = (id: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const togglePreset = (id: string) => {
    setSelectedPresetIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleStartTest = async () => {
    if (selectedAssetIds.length === 0 || selectedPresetIds.length === 0) return;
    
    setIsProcessing(true);
    const testId = uuidv4();
    
    try {
      addABTest({
        id: testId,
        name: testName || `A/B Test ${new Date().toLocaleTimeString()}`,
        assetIds: selectedAssetIds,
        presetIds: selectedPresetIds,
        createdAt: new Date().toISOString()
      });

      for (const assetId of selectedAssetIds) {
        const asset = assets.find(a => a.assetId === assetId);
        if (!asset) continue;

        for (const presetId of selectedPresetIds) {
          // Find preset object
          let preset: any;
          if (presetId === "signage-4k") {
            preset = { name: "Signage 4K", outputContainer: "mp4", video: { codec: "libx265", bitrate: "15000k", fps: 60, width: 3840, height: 2160 } };
          } else if (presetId === "signage-fhd") {
            preset = { name: "Signage FHD", outputContainer: "mp4", video: { codec: "libx264", bitrate: "8000k", fps: 30, width: 1920, height: 1080 } };
          } else if (presetId === "web-optimized") {
            preset = { name: "Web Optimized", outputContainer: "mp4", video: { codec: "libx264", bitrate: "4000k", fps: 30, width: 1280, height: 720 } };
          } else {
            preset = customPresets.find(p => p.id === presetId);
          }

          if (!preset) continue;

          const response = await axios.post("/api/jobs", {
            assetId: asset.assetId,
            filename: asset.filename,
            preset,
            priority: "high",
            testId // Pass testId to associate jobs
          });
          
          addJob(response.data);
        }
      }
      onClose();
    } catch (error) {
      console.error("Failed to start A/B test:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white border-4 border-black shadow-brutal-lg w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b-4 border-black flex items-center justify-between bg-accent">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black uppercase tracking-tighter">New A/B Engineering Test</h2>
              <input 
                type="text" 
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name..."
                className="text-sm font-black text-black/60 bg-transparent border-none p-0 focus:ring-0 placeholder:text-black/30 w-full uppercase tracking-widest"
              />
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12 bg-offwhite">
          {/* Step 1: Select Assets */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs">01</span>
                Select Assets
              </h3>
              <span className="text-[10px] font-black text-black uppercase tracking-widest bg-accent px-2 py-1 border-2 border-black">{selectedAssetIds.length} SELECTED</span>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {assets.map((asset) => (
                <button
                  key={asset.assetId}
                  onClick={() => toggleAsset(asset.assetId)}
                  className={cn(
                    "w-full p-4 border-2 text-left transition-all flex items-center gap-4 group",
                    selectedAssetIds.includes(asset.assetId)
                      ? "bg-accent border-black shadow-brutal-sm translate-x-0.5 translate-y-0.5"
                      : "bg-white border-black hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
                  )}
                >
                  <div className="w-14 h-14 border-2 border-black bg-offwhite overflow-hidden shrink-0">
                    <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-black truncate uppercase tracking-tight">{asset.originalName}</p>
                    <p className="text-[10px] text-black/50 font-black uppercase tracking-widest">{(asset.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 border-2 flex items-center justify-center transition-all",
                    selectedAssetIds.includes(asset.assetId)
                      ? "bg-black border-black text-white"
                      : "border-black/20 text-transparent group-hover:border-black"
                  )}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </button>
              ))}
              {assets.length === 0 && (
                <div className="text-center py-16 bg-white border-4 border-black border-dashed">
                  <Video className="w-12 h-12 text-black/20 mx-auto mb-4" />
                  <p className="text-xs font-black text-black/40 uppercase tracking-widest">No assets available</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Select Profiles */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs">02</span>
                Select Profiles
              </h3>
              <span className="text-[10px] font-black text-black uppercase tracking-widest bg-accent px-2 py-1 border-2 border-black">{selectedPresetIds.length} SELECTED</span>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {allPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => togglePreset(preset.id)}
                  className={cn(
                    "w-full p-4 border-2 text-left transition-all flex items-center gap-4 group",
                    selectedPresetIds.includes(preset.id)
                      ? "bg-accent border-black shadow-brutal-sm translate-x-0.5 translate-y-0.5"
                      : "bg-white border-black hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 border-2 flex items-center justify-center shrink-0 transition-colors",
                    selectedPresetIds.includes(preset.id) ? "bg-white border-black text-black" : "bg-offwhite border-black/10 text-black/20"
                  )}>
                    <Settings2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-black truncate uppercase tracking-tight">{preset.name}</p>
                    <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-tight">{preset.description}</p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 border-2 flex items-center justify-center transition-all",
                    selectedPresetIds.includes(preset.id)
                      ? "bg-black border-black text-white"
                      : "border-black/20 text-transparent group-hover:border-black"
                  )}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t-4 border-black bg-white flex items-center justify-between">
          <div className="text-xs font-black text-black uppercase tracking-widest">
            Queue: <span className="text-accent bg-black px-2 py-1 ml-2">{selectedAssetIds.length * selectedPresetIds.length} JOBS</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="text-xs font-black text-black/40 hover:text-black uppercase tracking-widest transition-colors">
              Cancel
            </button>
            <button
              onClick={handleStartTest}
              disabled={selectedAssetIds.length === 0 || selectedPresetIds.length === 0 || isProcessing}
              className={cn(
                "px-10 py-4 border-4 border-black font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-300",
                selectedAssetIds.length > 0 && selectedPresetIds.length > 0 && !isProcessing
                  ? "bg-accent text-black shadow-brutal hover:shadow-none active:translate-x-1 active:translate-y-1"
                  : "bg-offwhite text-black/20 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Play className="w-6 h-6 fill-current" />
              )}
              {isProcessing ? "Queueing..." : "Start A/B Test"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
