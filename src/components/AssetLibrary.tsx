import React from "react";
import { useStore } from "../store";
import { FileVideo, Trash2, Check, ExternalLink } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Asset Library</h3>
        <span className="text-[10px] font-bold text-slate-400">{assets.length} Assets</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {assets.map((asset) => (
          <div
            key={asset.assetId}
            className={cn(
              "group relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
              currentAsset?.assetId === asset.assetId
                ? "border-blue-500 bg-blue-50/50 shadow-sm"
                : "border-slate-100 bg-white hover:border-slate-200"
            )}
            onClick={() => handleSelectAsset(asset)}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
              {asset.thumbnailUrl ? (
                <img src={asset.thumbnailUrl} alt={asset.originalName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <FileVideo className="w-6 h-6" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{asset.originalName}</p>
              <p className="text-[10px] text-slate-500">{(asset.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>

            {currentAsset?.assetId === asset.assetId ? (
              <div className="p-1.5 rounded-full bg-blue-500 text-white">
                <Check className="w-3 h-3" />
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAsset(asset.assetId);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
