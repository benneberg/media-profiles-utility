import React, { useState } from "react";
import { useStore } from "../store";
import { 
  FileVideo, Info, Clock, HardDrive, Hash, Layers, Music, Subtitles, 
  FileJson, FileText, Download, AlertTriangle, CheckCircle2, Copy, Terminal, Plus
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

  const handleSaveAsPreset = () => {
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
      id: `preset-${Date.now()}`,
      name: `${currentAsset.originalName} Profile`,
      description: `Technical profile extracted from ${currentAsset.originalName}`,
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

    setIsPresetEditorOpen(true, newPreset);
  };

  return (
    <div className="w-full space-y-10 sm:space-y-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 bg-black border-2 border-black flex items-center justify-center text-white shadow-brutal-sm">
            <FileVideo className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tighter truncate uppercase">{currentAsset.originalName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black text-accent uppercase tracking-widest">Operator Intelligence</span>
              <div className="h-1 w-1 rounded-full bg-black" />
              <span className="text-[10px] text-black/50 font-black uppercase tracking-widest truncate">Source: {metadata.format.format_name.split(',')[0].toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button onClick={exportToJson} className="p-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all shadow-brutal-sm active:shadow-none active:translate-x-0.5 active:translate-y-0.5" title="Export JSON">
            <FileJson className="w-5 h-5" />
          </button>
          <button onClick={exportToCsv} className="p-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all shadow-brutal-sm active:shadow-none active:translate-x-0.5 active:translate-y-0.5" title="Export CSV">
            <FileText className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleSaveAsPreset}
            className="brutal-btn bg-accent text-black"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Save as Preset</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-2 border-black bg-black p-1 w-fit">
        <button
          onClick={() => setIsRawView(false)}
          className={cn(
            "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
            !isRawView ? "bg-white text-black" : "text-white hover:text-accent"
          )}
        >
          Structured
        </button>
        <button
          onClick={() => setIsRawView(true)}
          className={cn(
            "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
            isRawView ? "bg-white text-black" : "text-white hover:text-accent"
          )}
        >
          Raw JSON
        </button>
      </div>

      {isRawView ? (
        <div className="bg-black border-4 border-black shadow-brutal-lg p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b-2 border-white/10 pb-6">
            <div className="flex items-center gap-3 text-white/50">
              <Terminal className="w-5 h-5" />
              <span className="text-xs font-mono font-black uppercase tracking-widest">ffprobe_output.json</span>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(JSON.stringify(metadata, null, 2))}
              className="text-xs text-white/50 hover:text-accent transition-colors flex items-center gap-2 font-black uppercase tracking-widest"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <pre className="text-xs font-mono text-accent overflow-x-auto max-h-[600px] custom-scrollbar selection:bg-white selection:text-black">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          {/* Layer 1: Operational Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className={cn(
              "lg:col-span-2 p-10 border-4 border-black shadow-brutal flex flex-col md:flex-row gap-10 items-center md:items-start transition-all",
              metadata.validation?.status === "pass" ? "bg-white" : "bg-white"
            )}>
              <div className={cn(
                "w-32 h-32 border-4 border-black shrink-0 flex items-center justify-center shadow-brutal-sm",
                metadata.validation?.status === "pass" ? "bg-accent" : 
                metadata.validation?.status === "error" ? "bg-red-500" :
                "bg-amber-400"
              )}>
                {metadata.validation?.status === "pass" ? <CheckCircle2 className="w-16 h-16 text-black" /> : <AlertTriangle className="w-16 h-16 text-black" />}
              </div>
              
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <h3 className="text-4xl font-black tracking-tighter text-black uppercase leading-none">
                    {metadata.validation?.status === "pass" ? "Ready for Signage" : 
                     metadata.validation?.status === "error" ? "Critical Issues" :
                     "Minor Issues"}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-4">
                    <span className="px-3 py-1 bg-black text-white text-[10px] font-black tracking-widest">
                      {videoStream?.width}x{videoStream?.height}
                    </span>
                    <span className="px-3 py-1 bg-black text-white text-[10px] font-black tracking-widest">
                      {videoStream?.r_frame_rate.split('/')[0]}fps
                    </span>
                    <span className="px-3 py-1 bg-black text-white text-[10px] font-black tracking-widest">
                      {videoStream?.codec_name.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-black text-white text-[10px] font-black tracking-widest">
                      {formatDuration(metadata.format.duration)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t-2 border-black/10">
                  <SummaryItem label="Compatibility" value={metadata.validation?.score + "%"} color="accent" />
                  <SummaryItem label="Network Load" value={metadata.analysis?.bitrate_category.toUpperCase() || "N/A"} color="black" />
                  <SummaryItem label="Orientation" value={metadata.analysis?.orientation.toUpperCase() || "N/A"} color="black" />
                  <div className="flex flex-col justify-center">
                    <button 
                      onClick={handleSaveAsPreset}
                      className="brutal-btn bg-black text-white text-[10px] py-1.5"
                    >
                      <Plus className="w-3 h-3" />
                      Clone
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Rules List */}
            <div className="bg-white border-4 border-black p-8 shadow-brutal flex flex-col gap-6">
              <h4 className="text-xs font-black text-black uppercase tracking-widest border-b-2 border-black pb-4">Compliance Rules</h4>
              <div className="space-y-6 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                {metadata.validation?.rules.map((rule) => (
                  <div key={rule.id} className="flex gap-4 items-start group">
                    <div className={cn(
                      "mt-1 w-3 h-3 border-2 border-black shrink-0",
                      rule.severity === "error" ? "bg-red-500" : rule.severity === "warning" ? "bg-amber-400" : "bg-accent"
                    )} />
                    <div>
                      <p className="text-xs font-black text-black leading-tight uppercase tracking-tight">{rule.message}</p>
                      <p className="text-[10px] text-black/50 font-bold mt-1 uppercase tracking-widest">Fix: {rule.recommendation}</p>
                    </div>
                  </div>
                ))}
                {(!metadata.validation?.rules || metadata.validation.rules.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 text-black/20">
                    <CheckCircle2 className="w-12 h-12 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">All rules passed</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Layer 2: Technical Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Clock className="w-6 h-6" />} label="Duration" value={formatDuration(metadata.format.duration)} />
            <StatCard icon={<HardDrive className="w-6 h-6" />} label="File Size" value={formatBytes(parseInt(metadata.format.size))} />
            <StatCard icon={<Hash className="w-6 h-6" />} label="Format" value={metadata.format.format_name.toUpperCase().split(',')[0]} />
            <StatCard icon={<Layers className="w-6 h-6" />} label="Streams" value={`${metadata.format.nb_streams}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {videoStream && (
              <Section title="Video Engineering" icon={<Layers className="w-6 h-6" />}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-10">
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

            <div className="space-y-10">
              {audioStreams.length > 0 ? (
                <Section title="Audio Engineering" icon={<Music className="w-6 h-6" />}>
                  <div className="space-y-10">
                    {audioStreams.map((stream, i) => (
                      <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-10 border-b-2 border-black/5 last:border-0 pb-8 last:pb-0">
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
                <div className="bg-white border-4 border-black border-dashed p-12 flex flex-col items-center justify-center text-center">
                  <Music className="w-12 h-12 text-black/20 mb-4" />
                  <p className="text-sm font-black text-black uppercase tracking-widest">No Audio Detected</p>
                  <p className="text-[10px] text-black/40 mt-2 font-bold uppercase tracking-widest">Silent asset — Ideal for signage</p>
                </div>
              )}

              {/* Advanced Insights Layer */}
              {metadata.advanced && (
                <Section title="Advanced Insights" icon={<Info className="w-6 h-6" />}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-10">
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
    accent: "text-accent",
    black: "text-black",
    red: "text-red-600",
  };

  return (
    <div>
      <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">{label}</p>
      <p className={cn("text-xl font-black tracking-tighter", colorClasses[color] || "text-black")}>{value}</p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white p-6 border-4 border-black shadow-brutal flex items-center gap-6 group hover:-translate-y-1 transition-all">
      <div className="w-14 h-14 bg-offwhite border-2 border-black flex items-center justify-center text-black group-hover:bg-accent transition-colors shadow-brutal-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-black tracking-tighter uppercase">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border-4 border-black shadow-brutal overflow-hidden">
      <div className="px-8 py-6 border-b-4 border-black bg-black flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-accent">{icon}</div>
          <h3 className="font-black text-white uppercase tracking-widest text-sm">{title}</h3>
        </div>
      </div>
      <div className="p-10">{children}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-sm font-black text-black uppercase tracking-tight">{value}</p>
    </div>
  );
}
