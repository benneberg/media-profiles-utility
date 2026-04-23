import React from "react";
import { useStore } from "../store";
import { FileVideo, Trash2, Check, ExternalLink, Plus } from "lucide-react";
import { cn } from "../lib/utils";
import axios from "axios";

export default function AssetLibrary() {
  const { assets, currentAsset, setCurrentAsset, setMetadata, removeAsset } = useStore();

  const handleSelectAsset = async (asset: any) => {
    setCurrentAsset(asset);
    try {
      const response = await axios.get(`/api/metadata/${asset.filename}`);
      setMetadata(response.data);
    } catch (err) {
      console.error("Failed to fetch metadata:", err);
    }
  };

  if (assets.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-black uppercase tracking-widest">Asset Library</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">{assets.length} Assets</span>
          <button 
            onClick={() => setCurrentAsset(null)}
            className="w-6 h-6 border-2 border-black bg-accent text-black flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-brutal-sm"
            title="Upload New"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {assets.map((asset) => (
          <div
            key={asset.assetId}
            className={cn(
              "group relative flex items-center gap-4 p-3 border-2 transition-all cursor-pointer",
              currentAsset?.assetId === asset.assetId
                ? "border-black bg-accent shadow-brutal-sm translate-x-0.5 translate-y-0.5"
                : "border-black bg-white hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
            )}
            onClick={() => handleSelectAsset(asset)}
          >
            <div className="w-14 h-14 border-2 border-black overflow-hidden bg-offwhite shrink-0">
              {asset.thumbnailUrl ? (
                <img src={asset.thumbnailUrl} alt={asset.originalName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black/20">
                  <FileVideo className="w-6 h-6" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-black truncate uppercase tracking-tight">{asset.originalName}</p>
              <p className="text-[10px] text-black/50 font-black uppercase tracking-widest">{(asset.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>

            {currentAsset?.assetId === asset.assetId ? (
              <div className="w-6 h-6 bg-black text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAsset(asset.assetId);
                }}
                className="w-8 h-8 border-2 border-transparent hover:border-black hover:bg-red-500 hover:text-white text-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
