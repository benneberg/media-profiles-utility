import React, { useState } from "react";
import { useStore } from "../store";
import { 
  FileVideo, Info, Clock, HardDrive, Hash, Layers, Music, Subtitles, 
  FileJson, FileText, Download, AlertTriangle, CheckCircle2, Copy, Terminal
} from "lucide-react";
import { formatBytes, cn } from "../lib/utils";
import { Preset } from "../types";

export default function MetadataViewer() {
  const { metadata, currentAsset, addCustomPreset, setIsPresetEditorOpen } = useStore();
  const [isRawView, setIsRawView] = useState(false);

  if (!metadata || !currentAsset || !metadata.streams || !metadata.format) return null;

  const videoStream = metadata.streams.find((s) => s.codec_type === "video");
  const audioStreams = metadata.streams.filter((s) => s.codec_type === "audio");
  const subtitleStreams = metadata.streams.filter((s) => s.codec_type === "subtitle");

  const formatDuration = (seconds?: string) => {
    if (!seconds) return "N/A";
    const s = parseFloat(seconds);
    if (isNaN(s)) return "N/A";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h > 0 ? h + "h " : ""}${m}m ${sec}s`;
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metadata, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${currentAsset.originalName}_metadata.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportToCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,Section,Key,Value\n";
    csvContent += `Format,Filename,${metadata.format.filename}\n`;
    csvContent += `Format,Duration,${metadata.format.duration}\n`;
    csvContent += `Format,Size,${metadata.format.size}\n`;
    
    metadata.streams.forEach((s, i) => {
      Object.entries(s).forEach(([key, val]) => {
        csvContent += `Stream ${i} (${s.codec_type}),${key},${String(val).replace(/,/g, ";")}\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentAsset.originalName}_metadata.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCloneSettings = () => {
    if (!videoStream || !videoStream.r_frame_rate) return;
    
    let fps = 30;
    try {
      const parts = videoStream.r_frame_rate.split("/");
      fps = parts.length === 2 ? parseInt(parts[0]) / parseInt(parts[1]) : parseFloat(videoStream.r_frame_rate);
      if (isNaN(fps)) fps = 30;
    } catch (e) {
      console.error("Failed to parse frame rate for cloning:", e);
    }

    const newPreset: Preset = {
      id: `clone-${Date.now()}`,
      name: `Clone: ${currentAsset.originalName}`,
      description: `Custom preset extracted from ${currentAsset.originalName}`,
      outputContainer: "mp4",
      video: {
        codec: videoStream.codec_name === "h264" ? "libx264" : videoStream.codec_name === "hevc" ? "libx265" : "libx264",
        bitrate: videoStream.bit_rate ? `${Math.round(parseInt(videoStream.bit_rate) / 1000)}k` : "8000k",
        fps: Math.round(fps),
        width: videoStream.width,
        height: videoStream.height,
      },
      audio: audioStreams[0] ? {
        codec: "aac",
        bitrate: audioStreams[0].bit_rate ? `${Math.round(parseInt(audioStreams[0].bit_rate) / 1000)}k` : "192k",
        channels: audioStreams[0].channels || 2,
      } : undefined,
    };

    addCustomPreset(newPreset);
    setIsPresetEditorOpen(true);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
            <FileVideo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{currentAsset.originalName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Operator Intelligence</span>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500 font-medium">Source: {metadata.format.format_name.split(',')[0].toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsRawView(!isRawView)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
              isRawView 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
            {isRawView ? "Structured View" : "Raw JSON"}
          </button>
          
          <div className="h-6 w-[1px] bg-slate-200 mx-1" />

          <button onClick={exportToJson} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Export JSON">
            <FileJson className="w-5 h-5" />
          </button>
          <button onClick={exportToCsv} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Export CSV">
            <FileText className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleCloneSettings}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100 ml-2"
          >
            <Copy className="w-3.5 h-3.5" />
            Clone Settings
          </button>
        </div>
      </div>

      {isRawView ? (
        <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest">ffprobe_output.json</span>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(JSON.stringify(metadata, null, 2))}
              className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <pre className="text-xs font-mono text-blue-400 overflow-x-auto max-h-[600px] custom-scrollbar">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          {/* Layer 1: Operational Summary (Decision Layer) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={cn(
              "lg:col-span-2 p-8 rounded-3xl border flex flex-col md:flex-row gap-8 items-center md:items-start transition-all",
              metadata.validation?.status === "pass" 
                ? "bg-emerald-50 border-emerald-100" 
                : metadata.validation?.status === "error"
                ? "bg-red-50 border-red-100"
                : "bg-amber-50 border-amber-100"
            )}>
              <div className={cn(
                "w-24 h-24 rounded-full shrink-0 flex items-center justify-center border-4",
                metadata.validation?.status === "pass" ? "bg-emerald-100 border-emerald-200 text-emerald-600" : 
                metadata.validation?.status === "error" ? "bg-red-100 border-red-200 text-red-600" :
                "bg-amber-100 border-amber-200 text-amber-600"
              )}>
                {metadata.validation?.status === "pass" ? <CheckCircle2 className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
              </div>
              
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h3 className={cn(
                    "text-2xl font-black tracking-tight",
                    metadata.validation?.status === "pass" ? "text-emerald-900" : 
                    metadata.validation?.status === "error" ? "text-red-900" :
                    "text-amber-900"
                  )}>
                    {metadata.validation?.status === "pass" ? "Ready for Digital Signage" : 
                     metadata.validation?.status === "error" ? "Critical Issues Detected" :
                     "Minor Issues Detected"}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mt-2">
                    <span className="px-2 py-1 rounded bg-white/50 text-xs font-bold border border-current/10">
                      {videoStream?.width}x{videoStream?.height}
                    </span>
                    <span className="px-2 py-1 rounded bg-white/50 text-xs font-bold border border-current/10">
                      {videoStream?.r_frame_rate.split('/')[0]}fps
                    </span>
                    <span className="px-2 py-1 rounded bg-white/50 text-xs font-bold border border-current/10">
                      {videoStream?.codec_name.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded bg-white/50 text-xs font-bold border border-current/10">
                      {formatDuration(metadata.format.duration)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-current/10">
                  <SummaryItem label="Compatibility" value={metadata.validation?.score + "%"} color={metadata.validation?.status === "pass" ? "emerald" : "amber"} />
                  <SummaryItem label="Network Load" value={metadata.analysis?.bitrate_category.toUpperCase() || "N/A"} color="blue" />
                  <SummaryItem label="Orientation" value={metadata.analysis?.orientation.toUpperCase() || "N/A"} color="slate" />
                  <SummaryItem label="Audio" value={metadata.analysis?.audio_present ? "Present" : "None ✅"} color={metadata.analysis?.audio_present ? "slate" : "emerald"} />
                </div>
              </div>
            </div>

            {/* Validation Rules List */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compliance Rules</h4>
              <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                {metadata.validation?.rules.map((rule) => (
                  <div key={rule.id} className="flex gap-3 items-start group">
                    <div className={cn(
                      "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                      rule.severity === "error" ? "bg-red-500" : rule.severity === "warning" ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rule.message}</p>
                      <p className="text-[10px] text-slate-500 italic mt-0.5 group-hover:text-blue-600 transition-colors">Fix: {rule.recommendation}</p>
                    </div>
                  </div>
                ))}
                {(!metadata.validation?.rules || metadata.validation.rules.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                    <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs font-medium">All rules passed</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Layer 2: Technical Summary (Grouped by Intent) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Clock />} label="Duration" value={formatDuration(metadata.format.duration)} />
            <StatCard icon={<HardDrive />} label="File Size" value={formatBytes(parseInt(metadata.format.size))} />
            <StatCard icon={<Hash />} label="Format" value={metadata.format.format_name.toUpperCase()} />
            <StatCard icon={<Layers />} label="Streams" value={`${metadata.format.nb_streams} total`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videoStream && (
              <Section title="Video Engineering" icon={<Layers className="w-5 h-5" />}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                  <Detail label="Codec" value={videoStream.codec_name.toUpperCase()} />
                  <Detail label="Resolution" value={`${videoStream.width} × ${videoStream.height}`} />
                  <Detail label="Aspect Ratio" value={videoStream.display_aspect_ratio || "N/A"} />
                  <Detail label="Frame Rate" value={`${videoStream.r_frame_rate} fps`} />
                  <Detail label="Bitrate" value={videoStream.bit_rate ? `${Math.round(parseInt(videoStream.bit_rate) / 1000)} kbps` : "N/A"} />
                  <Detail label="Pixel Format" value={videoStream.pix_fmt} />
                  <Detail label="Profile" value={videoStream.profile || "N/A"} />
                  <Detail label="Level" value={videoStream.level ? String(videoStream.level) : "N/A"} />
                  <Detail label="Color Space" value={videoStream.color_space || "N/A"} />
                </div>
              </Section>
            )}

            <div className="space-y-6">
              {audioStreams.length > 0 ? (
                <Section title="Audio Engineering" icon={<Music className="w-5 h-5" />}>
                  <div className="space-y-8">
                    {audioStreams.map((stream, i) => (
                      <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                        <Detail label="Codec" value={stream.codec_name.toUpperCase()} />
                        <Detail label="Channels" value={`${stream.channels} (${stream.channel_layout})`} />
                        <Detail label="Sample Rate" value={`${stream.sample_rate} Hz`} />
                        <Detail label="Bitrate" value={stream.bit_rate ? `${Math.round(parseInt(stream.bit_rate) / 1000)} kbps` : "N/A"} />
                        <Detail label="Language" value={stream.tags?.language || "N/A"} />
                      </div>
                    ))}
                  </div>
                </Section>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
                  <Music className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Audio Detected</p>
                  <p className="text-xs text-slate-400 mt-1">Silent asset — Ideal for signage</p>
                </div>
              )}

              {/* Advanced Insights Layer */}
              {metadata.advanced && (
                <Section title="Advanced Insights" icon={<Info className="w-5 h-5" />}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                    <Detail label="GOP Interval" value={`${metadata.advanced.gop?.keyframe_interval} frames`} />
                    <Detail label="Seekability" value={metadata.advanced.gop?.seekability.toUpperCase() || "N/A"} />
                    <Detail label="Network Risk" value={metadata.advanced.network?.risk.toUpperCase() || "N/A"} />
                    <Detail label="Est. Bandwidth" value={`${metadata.advanced.network?.estimated_bandwidth_mbps.toFixed(1)} Mbps`} />
                    <Detail label="CPU Load Est." value={metadata.advanced.playback?.cpu_load_estimate.toUpperCase() || "N/A"} />
                    <Detail label="Buffer Risk" value={metadata.advanced.playback?.buffer_risk.toUpperCase() || "N/A"} />
                  </div>
                </Section>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    blue: "text-blue-700",
    slate: "text-slate-700",
    red: "text-red-700",
  };

  return (
    <div>
      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={cn("text-sm font-black", colorClasses[color] || "text-slate-900")}>{value}</p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="p-3 rounded-xl bg-slate-50 text-slate-400">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-slate-400">{icon}</div>
          <h3 className="font-bold text-slate-900 tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
