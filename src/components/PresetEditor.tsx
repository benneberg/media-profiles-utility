import React, { useState } from "react";
import { useStore } from "../store";
import { Preset } from "../types";
import { X, Save, Plus, Settings2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "../lib/utils";

export default function PresetEditor({ onClose }: { onClose: () => void }) {
  const { addCustomPreset, setSelectedPreset, editingPreset } = useStore();
  const [name, setName] = useState(editingPreset?.name || "");
  const [description, setDescription] = useState(editingPreset?.description || "");
  const [container, setContainer] = useState(editingPreset?.outputContainer || "mp4");
  
  const [videoCodec, setVideoCodec] = useState(editingPreset?.video.codec || "libx264");
  const [videoBitrate, setVideoBitrate] = useState(editingPreset?.video.bitrate || "5000k");
  const [fps, setFps] = useState(editingPreset?.video.fps || 30);
  const [width, setWidth] = useState(editingPreset?.video.width || 1920);
  const [height, setHeight] = useState(editingPreset?.video.height || 1080);

  const [audioCodec, setAudioCodec] = useState(editingPreset?.audio?.codec || "aac");
  const [audioBitrate, setAudioBitrate] = useState(editingPreset?.audio?.bitrate || "192k");
  const [channels, setChannels] = useState(editingPreset?.audio?.channels || 2);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-4 border-black shadow-brutal-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b-4 border-black flex items-center justify-between bg-accent">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
              <Settings2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-black uppercase tracking-tighter">Custom Preset Editor</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-offwhite">
          {/* General */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-black/40 uppercase tracking-widest">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Preset Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Custom Signage"
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Output Container</label>
                <select
                  value={container}
                  onChange={(e) => setContainer(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                >
                  <option value="mp4">MP4</option>
                  <option value="mkv">MKV</option>
                  <option value="mov">MOV</option>
                  <option value="webm">WEBM</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-black uppercase tracking-widest">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this preset..."
                className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight h-24 resize-none"
              />
            </div>
          </div>

          {/* Video */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-black/40 uppercase tracking-widest">Video Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Codec</label>
                <select
                  value={videoCodec}
                  onChange={(e) => setVideoCodec(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                >
                  <option value="libx264">H.264 (libx264)</option>
                  <option value="libx265">H.265 (libx265)</option>
                  <option value="libvpx-vp9">VP9 (libvpx-vp9)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Bitrate</label>
                <input
                  type="text"
                  value={videoBitrate}
                  onChange={(e) => setVideoBitrate(e.target.value)}
                  placeholder="e.g. 5000k"
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Frame Rate</label>
                <input
                  type="number"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                />
              </div>
            </div>
          </div>

          {/* Audio */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-black/40 uppercase tracking-widest">Audio Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Codec</label>
                <select
                  value={audioCodec}
                  onChange={(e) => setAudioCodec(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                >
                  <option value="aac">AAC</option>
                  <option value="libmp3lame">MP3 (libmp3lame)</option>
                  <option value="libopus">Opus (libopus)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Bitrate</label>
                <input
                  type="text"
                  value={audioBitrate}
                  onChange={(e) => setAudioBitrate(e.target.value)}
                  placeholder="e.g. 192k"
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest">Channels</label>
                <select
                  value={channels}
                  onChange={(e) => setChannels(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-accent outline-none transition-all font-bold uppercase tracking-tight"
                >
                  <option value={1}>Mono (1)</option>
                  <option value={2}>Stereo (2)</option>
                  <option value={6}>5.1 Surround (6)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t-4 border-black bg-white flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-xs font-black text-black uppercase tracking-widest hover:bg-offwhite transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="brutal-btn bg-accent text-black"
          >
            <Save className="w-5 h-5" />
            <span className="ml-2">Save Preset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
