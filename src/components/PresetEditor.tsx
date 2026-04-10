import React, { useState } from "react";
import { useStore } from "../store";
import { Preset } from "../types";
import { X, Save, Plus, Settings2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "../lib/utils";

export default function PresetEditor({ onClose }: { onClose: () => void }) {
  const { addCustomPreset, setSelectedPreset } = useStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [container, setContainer] = useState("mp4");
  
  const [videoCodec, setVideoCodec] = useState("libx264");
  const [videoBitrate, setVideoBitrate] = useState("5000k");
  const [fps, setFps] = useState(30);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);

  const [audioCodec, setAudioCodec] = useState("aac");
  const [audioBitrate, setAudioBitrate] = useState("192k");
  const [channels, setChannels] = useState(2);

  const handleSave = () => {
    const newPreset: Preset = {
      id: uuidv4(),
      name: name || "Custom Preset",
      description: description || "User defined transcoding settings",
      outputContainer: container,
      video: {
        codec: videoCodec,
        bitrate: videoBitrate,
        fps,
        width,
        height,
      },
      audio: {
        codec: audioCodec,
        bitrate: audioBitrate,
        channels,
      },
    };

    addCustomPreset(newPreset);
    setSelectedPreset(newPreset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Settings2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Custom Preset Editor</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* General */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Preset Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Custom Signage"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Output Container</label>
                <select
                  value={container}
                  onChange={(e) => setContainer(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="mp4">MP4</option>
                  <option value="mkv">MKV</option>
                  <option value="mov">MOV</option>
                  <option value="webm">WEBM</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this preset..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-20 resize-none"
              />
            </div>
          </div>

          {/* Video */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Video Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Codec</label>
                <select
                  value={videoCodec}
                  onChange={(e) => setVideoCodec(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="libx264">H.264 (libx264)</option>
                  <option value="libx265">H.265 (libx265)</option>
                  <option value="libvpx-vp9">VP9 (libvpx-vp9)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Bitrate</label>
                <input
                  type="text"
                  value={videoBitrate}
                  onChange={(e) => setVideoBitrate(e.target.value)}
                  placeholder="e.g. 5000k"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Frame Rate</label>
                <input
                  type="number"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Audio */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audio Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Codec</label>
                <select
                  value={audioCodec}
                  onChange={(e) => setAudioCodec(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="aac">AAC</option>
                  <option value="libmp3lame">MP3 (libmp3lame)</option>
                  <option value="libopus">Opus (libopus)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Bitrate</label>
                <input
                  type="text"
                  value={audioBitrate}
                  onChange={(e) => setAudioBitrate(e.target.value)}
                  placeholder="e.g. 192k"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Channels</label>
                <select
                  value={channels}
                  onChange={(e) => setChannels(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value={1}>Mono (1)</option>
                  <option value={2}>Stereo (2)</option>
                  <option value={6}>5.1 Surround (6)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Preset
          </button>
        </div>
      </div>
    </div>
  );
}
