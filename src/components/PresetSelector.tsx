import React, { useState } from "react";
import { useStore } from "../store";
import { Preset, Job } from "../types";
import { Settings, Play, Check, ChevronDown, ChevronUp, Info, Zap, Smartphone, Monitor, Globe, Plus, Settings2, Loader2 } from "lucide-react";
import axios from "axios";
import { cn } from "../lib/utils";
import PresetEditor from "./PresetEditor";
import { motion, AnimatePresence } from "framer-motion";

const SYSTEM_PRESETS: Preset[] = [
  {
    id: "ds-hd-h264",
    name: "Digital Signage — Full HD H.264",
    description: "Industry standard 1080p output. High compatibility with most hardware players.",
    outputContainer: "mp4",
    video: { codec: "libx264", bitrate: "12000k", fps: 30, width: 1920, height: 1080 },
    audio: { codec: "aac", bitrate: "192k", channels: 2 },
  },
  {
    id: "ds-4k-hevc",
    name: "Digital Signage — 4K HEVC",
    description: "Next-gen 4K resolution using H.265. Best for high-end SoC displays and players.",
    outputContainer: "mp4",
    video: { codec: "libx265", bitrate: "35000k", fps: 60, width: 3840, height: 2160 },
    audio: { codec: "aac", bitrate: "192k", channels: 2 },
  },
  {
    id: "ds-4k-h264",
    name: "Digital Signage — 4K H.264",
    description: "4K output with legacy H.264 compatibility for older 4K-capable hardware.",
    outputContainer: "mp4",
    video: { codec: "libx264", bitrate: "45000k", fps: 30, width: 3840, height: 2160 },
    audio: { codec: "aac", bitrate: "192k", channels: 2 },
  },
  {
    id: "ds-vertical-hd",
    name: "Digital Signage — Vertical HD",
    description: "Portrait 1080x1920 orientation for retail and menu board displays.",
    outputContainer: "mp4",
    video: { codec: "libx264", bitrate: "12000k", fps: 30, width: 1080, height: 1920 },
    audio: { codec: "aac", bitrate: "192k", channels: 2 },
  },
  {
    id: "ds-vertical-4k",
    name: "Digital Signage — Vertical 4K HEVC",
    description: "Ultra-high resolution portrait output for premium large-format displays.",
    outputContainer: "mp4",
    video: { codec: "libx265", bitrate: "35000k", fps: 60, width: 2160, height: 3840 },
    audio: { codec: "aac", bitrate: "192k", channels: 2 },
  },
  {
    id: "ds-square",
    name: "Digital Signage — Social Square",
    description: "1:1 Aspect ratio (1080x1080) for specialized kiosks and social walls.",
    outputContainer: "mp4",
    video: { codec: "libx264", bitrate: "10000k", fps: 30, width: 1080, height: 1080 },
    audio: { codec: "aac", bitrate: "192k", channels: 2 },
  },
  {
    id: "web-optimized",
    name: "Web Optimized — 1080p",
    description: "Balanced bitrate for web delivery with fast-start optimization.",
    outputContainer: "mp4",
    video: { codec: "libx264", bitrate: "5000k", fps: 30, width: 1920, height: 1080 },
    audio: { codec: "aac", bitrate: "128k", channels: 2 },
  },
  {
    id: "web-low",
    name: "Low Bandwidth — 720p",
    description: "Small file size for mobile and slow connections.",
    outputContainer: "mp4",
    video: { codec: "libx264", bitrate: "2000k", fps: 24, width: 1280, height: 720 },
    audio: { codec: "aac", bitrate: "96k", channels: 1 },
  },
];

export default function PresetSelector() {
  const { currentAsset, metadata, selectedPreset, setSelectedPreset, addJob, customPresets, setIsPresetEditorOpen } = useStore();
  const [isStarting, setIsStarting] = useState(false);
  const [priority, setPriority] = useState<"low" | "standard" | "high">("standard");

  const handleStartJob = async () => {
    if (!currentAsset || !selectedPreset) return;

    setIsStarting(true);
    try {
      const response = await axios.post("/api/jobs", {
        assetId: currentAsset.assetId,
        filename: currentAsset.filename,
        preset: selectedPreset,
        priority,
      });

      const { id } = response.data;
      const newJob: Job = {
        id,
        status: "queued",
        progress: 0,
        priority,
        preset: selectedPreset,
        outputFilename: "", // Server will provide this
        createdAt: new Date().toISOString(),
      };
      addJob(newJob);
    } catch (err) {
      console.error("Failed to start job:", err);
    } finally {
      setIsStarting(false);
    }
  };

  if (!currentAsset || !metadata) return null;

  const allPresets = [...SYSTEM_PRESETS, ...customPresets];

  // Preset Fit Analysis Logic
  const getPresetDeltas = (preset: Preset) => {
    const videoStream = metadata.streams.find(s => s.codec_type === "video");
    if (!videoStream) return [];

    const deltas: { field: string; source: string | number; target: string | number; status: "match" | "increase" | "decrease" | "change" }[] = [];

    // Resolution
    const sourceRes = `${videoStream.width}x${videoStream.height}`;
    const targetRes = `${preset.video.width}x${preset.video.height}`;
    deltas.push({
      field: "Resolution",
      source: sourceRes,
      target: targetRes,
      status: sourceRes === targetRes ? "match" : "change"
    });

    // FPS
    const parts = videoStream.r_frame_rate.split("/");
    const sourceFps = Math.round(parts.length === 2 ? parseInt(parts[0]) / parseInt(parts[1]) : parseFloat(videoStream.r_frame_rate));
    const targetFps = preset.video.fps || 30;
    deltas.push({
      field: "Frame Rate",
      source: `${sourceFps}fps`,
      target: `${targetFps}fps`,
      status: sourceFps === targetFps ? "match" : sourceFps < targetFps ? "increase" : "decrease"
    });

    // Codec
    const sourceCodec = videoStream.codec_name.toUpperCase();
    const targetCodec = preset.video.codec?.replace("lib", "").toUpperCase() || "N/A";
    deltas.push({
      field: "Codec",
      source: sourceCodec,
      target: targetCodec,
      status: sourceCodec === targetCodec ? "match" : "change"
    });

    return deltas;
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Transcoding Presets</h2>
            <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Select target profile</p>
          </div>
        </div>
        <button
          onClick={() => setIsPresetEditorOpen(true)}
          className="brutal-btn bg-white text-black"
        >
          <Plus className="w-4 h-4" />
          <span className="ml-2">Create Custom</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {allPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setSelectedPreset(preset)}
            className={cn(
              "text-left p-6 border-4 transition-all duration-300 flex flex-col gap-4 group relative overflow-hidden",
              selectedPreset?.id === preset.id
                ? "border-black bg-accent shadow-brutal active:shadow-none translate-x-1 translate-y-1"
                : "border-black bg-white hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1"
            )}
          >
            <div className="flex items-start justify-between w-full">
              <div className={cn(
                "w-10 h-10 border-2 border-black flex items-center justify-center transition-colors",
                selectedPreset?.id === preset.id ? "bg-white text-black" : "bg-offwhite text-black/40 group-hover:text-black"
              )}>
                {preset.id.includes("ds") ? <Monitor className="w-5 h-5" /> : preset.id.includes("web") ? <Globe className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
              </div>
              {selectedPreset?.id === preset.id && (
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-black text-black text-lg uppercase tracking-tighter leading-tight">{preset.name}</h3>
              <p className="text-xs font-bold text-black/60 mt-2 uppercase tracking-tight line-clamp-2">{preset.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge label={preset.video.codec?.replace("lib", "") || ""} />
              <Badge label={`${preset.video.width}x${preset.video.height}`} />
              <Badge label={`${preset.video.bitrate}`} />
              <Badge label={`${preset.video.fps}fps`} />
            </div>
          </button>
        ))}
      </div>

      {selectedPreset && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-black text-white border-4 border-black shadow-brutal-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent text-black flex items-center justify-center border-2 border-white">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-widest text-accent">Preset Fit Analysis</h4>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Source vs Target Profile</p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Target Profile</p>
              <p className="text-sm font-black text-accent uppercase tracking-tighter">{selectedPreset.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {getPresetDeltas(selectedPreset).map((delta, i) => (
              <div key={i} className="p-4 bg-white/5 border-2 border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">{delta.field}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest truncate max-w-[70px]">{delta.source}</span>
                  <div className={cn(
                    "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-2",
                    delta.status === "match" ? "bg-accent/20 text-accent border-accent/20" :
                    delta.status === "increase" ? "bg-blue-500/20 text-blue-400 border-blue-500/20" :
                    delta.status === "decrease" ? "bg-amber-500/20 text-amber-400 border-amber-500/20" :
                    "bg-purple-500/20 text-purple-400 border-purple-500/20"
                  )}>
                    {delta.status}
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[70px]">{delta.target}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t-2 border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-6 w-full lg:w-auto">
              <div className="flex items-center gap-3 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                <Info className="w-4 h-4 text-accent" />
                <span>Ready to generate variant</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mr-2">Priority</span>
                <div className="flex border-2 border-white/10 p-1">
                  {(["low", "standard", "high"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        "px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all",
                        priority === p 
                          ? "bg-accent text-black" 
                          : "text-white/40 hover:text-white"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartJob}
              disabled={isStarting}
              className={cn(
                "w-full lg:w-auto px-10 py-4 font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 border-4 border-black",
                isStarting
                  ? "bg-white/10 text-white/20 cursor-not-allowed"
                  : "bg-accent text-black hover:bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none active:translate-x-1 active:translate-y-1"
              )}
            >
              {isStarting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Play className="w-6 h-6 fill-current" />
              )}
              {isStarting ? "Initializing..." : "Start Transcoding"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase tracking-widest">
      {label}
    </span>
  );
}
