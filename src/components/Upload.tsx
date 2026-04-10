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
  const { setCurrentAsset, setMetadata } = useStore();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

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

      // Fetch metadata
      const metadataResponse = await axios.get(`/api/metadata/${asset.filename}`);
      setMetadata(metadataResponse.data);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.error || "Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [setCurrentAsset, setMetadata]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".mkv", ".avi", ".webm"],
    },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-4",
          isDragActive ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300 bg-white",
          uploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="p-4 rounded-full bg-blue-50 text-blue-600">
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <UploadIcon className="w-8 h-8" />
          )}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {uploading ? "Uploading..." : "Upload Video"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop your video file here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supports MP4, MOV, MKV, AVI, WEBM
          </p>
        </div>

        {uploading && (
          <div className="w-full max-w-xs mt-4">
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">{progress}% uploaded</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}
    </div>
  );
}
