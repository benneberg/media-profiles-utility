import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Upload as UploadIcon, FileVideo, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useStore } from "../store";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Upload() {
  const { setCurrentAsset, setMetadata, addAsset } = useStore();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      setUploading(true);
      setProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post("/api/upload", formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setProgress(percentCompleted);
          },
        });

        const asset = response.data;
        setCurrentAsset(asset);
        addAsset(asset);

        // Fetch metadata
        const metadataResponse = await axios.get(`/api/metadata/${asset.filename}`);
        setMetadata(metadataResponse.data);
      } catch (err: any) {
        console.error("Upload failed details:", err);
        const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || "Failed to upload file. Please try again.";
        setError(errorMessage);
      } finally {
        setUploading(false);
      }
    }
  }, [setCurrentAsset, setMetadata, addAsset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".mkv", ".avi", ".webm"],
    },
    multiple: true,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-4 border-black p-12 sm:p-20 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-8 group",
          isDragActive ? "bg-accent" : "bg-white",
          uploading && "pointer-events-none opacity-80"
        )}
      >
        <input {...getInputProps()} />
        
        <div className={cn(
          "w-20 h-20 border-4 border-black flex items-center justify-center transition-all duration-500",
          isDragActive ? "bg-white rotate-12 scale-110" : "bg-accent group-hover:-rotate-6"
        )}>
          {uploading ? (
            <Loader2 className="w-10 h-10 animate-spin text-black" />
          ) : (
            <UploadIcon className="w-10 h-10 text-black" />
          )}
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-3xl font-black text-black uppercase tracking-tighter">
            {uploading ? "Processing..." : "Drop Media Here"}
          </h3>
          <p className="text-sm text-black/60 font-bold uppercase tracking-widest">
            {isDragActive ? "Release to start" : "Drag and drop or click to browse"}
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {['MP4', 'MOV', 'MKV', 'AVI', 'WEBM'].map(ext => (
              <span key={ext} className="px-2 py-1 bg-black text-white text-[10px] font-black tracking-widest">{ext}</span>
            ))}
          </div>
        </div>

        {uploading && (
          <div className="w-full max-w-md mt-8 space-y-4">
            <div className="h-6 w-full bg-white border-4 border-black overflow-hidden relative">
              <div
                className="h-full bg-accent border-r-4 border-black transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center mix-blend-difference">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{progress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-6 bg-red-500 text-white border-4 border-black shadow-brutal flex items-start gap-4">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div className="text-sm font-black uppercase tracking-tight">{error}</div>
        </div>
      )}
    </div>
  );
}
