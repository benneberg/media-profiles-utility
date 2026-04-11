import React, { useState } from "react";
import { useStore } from "../store";
import { Preset, Job } from "../types";
import { Settings, Play, Check, ChevronDown, ChevronUp, Info, Zap, Smartphone, Monitor, Globe, Plus, Settings2, Loader2 } from "lucide-react";
import axios from "axios";
import { cn } from "../lib/utils";
import PresetEditor from "./PresetEditor";

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
  const { currentAsset, metadata, selectedPreset, setSelectedPreset, addJob, customPresets } = useStore();
  const [isStarting, setIsStarting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transcoding Presets</h2>
            <p className="text-sm text-gray-500">Select a target format for your asset</p>
          </div>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Custom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setSelectedPreset(preset)}
            className={cn(
              "text-left p-5 rounded-xl border-2 transition-all duration-200 flex flex-col gap-3 group relative overflow-hidden",
              selectedPreset?.id === preset.id
                ? "border-purple-500 bg-purple-50/50"
                : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
            )}
          >
            <div className="flex items-start justify-between w-full">
              <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:text-purple-500 transition-colors">
                {preset.id.includes("ds") ? <Monitor className="w-5 h-5" /> : preset.id.includes("web") ? <Globe className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
              </div>
              {selectedPreset?.id === preset.id && (
                <div className="p-1 rounded-full bg-purple-500 text-white">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{preset.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{preset.description}</p>
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
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest">Preset Fit Analysis</h4>
                <p className="text-xs text-slate-400">Comparing source metadata to target profile</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Profile</p>
              <p className="text-sm font-bold text-purple-400">{selectedPreset.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getPresetDeltas(selectedPreset).map((delta, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{delta.field}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 truncate max-w-[80px]">{delta.source}</span>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    delta.status === "match" ? "bg-emerald-500/20 text-emerald-400" :
                    delta.status === "increase" ? "bg-blue-500/20 text-blue-400" :
                    delta.status === "decrease" ? "bg-amber-500/20 text-amber-400" :
                    "bg-purple-500/20 text-purple-400"
                  )}>
                    {delta.status}
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[80px]">{delta.target}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Info className="w-4 h-4 text-purple-400" />
                <span>Ready to generate variant with these parameters</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Job Priority</span>
                {(["low", "standard", "high"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      priority === p 
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" 
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartJob}
              disabled={isStarting}
              className={cn(
                "w-full md:w-auto px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200",
                isStarting
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-900/20 active:scale-95"
              )}
            >
              {isStarting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              {isStarting ? "Initializing..." : "Start Transcoding"}
            </button>
          </div>
        </div>
      )}

      {showEditor && <PresetEditor onClose={() => setShowEditor(false)} />}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
      {label}
    </span>
  );
}
