import React, { useEffect } from "react";
import { useStore } from "../store";
import { Job } from "../types";
import { Loader2, CheckCircle, AlertCircle, Download, Clock, Zap, ExternalLink, ArrowRightLeft, Trash2, Globe } from "lucide-react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../lib/utils";

export default function JobTracker() {
  const { jobs, updateJob, toggleComparisonJob, comparisonJobIds } = useStore();

  useEffect(() => {
    const activeJobs = jobs.filter((j) => j.status === "queued" || j.status === "processing");
    if (activeJobs.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of activeJobs) {
        try {
          const response = await axios.get(`/api/jobs/${job.id}`);
          const updatedJob = response.data;
          updateJob(job.id, updatedJob);
        } catch (err) {
          console.error(`Failed to fetch status for job ${job.id}:`, err);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs, updateJob]);

  if (jobs.length === 0) return null;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Processing Jobs</h2>
            <p className="text-sm text-gray-500">Track and compare your transcoding tasks</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={cn(
              "bg-white p-6 rounded-xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center gap-6",
              comparisonJobIds.includes(job.id) ? "border-blue-500 ring-1 ring-blue-500 shadow-lg shadow-blue-50" : "border-gray-100 shadow-sm"
            )}
          >
            {job.thumbnailUrl && (
              <div className="w-full md:w-32 aspect-video rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100 relative group">
                <img src={job.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {job.status === "completed" && (
                  <button 
                    onClick={() => toggleComparisonJob(job.id)}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center bg-blue-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm",
                      comparisonJobIds.includes(job.id) && "opacity-100"
                    )}
                  >
                    <ArrowRightLeft className="w-6 h-6" />
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-widest">
                      {comparisonJobIds.includes(job.id) ? "Remove" : "Compare"}
                    </span>
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{job.preset.name}</h3>
                <StatusBadge status={job.status} />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">ID: {job.id.split("-")[0]}</span>
              </div>
              
              {job.thumbnailStrip && job.thumbnailStrip.length > 0 && (
                <div className="flex gap-1 mt-3 overflow-x-auto pb-1 custom-scrollbar">
                  {job.thumbnailStrip.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      alt={`Strip ${i}`} 
                      className="h-8 aspect-video rounded object-cover border border-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-48 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    job.status === "failed" ? "bg-red-500" : job.status === "completed" ? "bg-emerald-500" : "bg-blue-600"
                  )}
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {job.status === "completed" && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleComparisonJob(job.id)}
                    className={cn(
                      "p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold",
                      comparisonJobIds.includes(job.id) 
                        ? "bg-blue-600 text-white border-blue-600" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Compare
                  </button>
                  <button 
                    onClick={() => {
                      alert("Syncing to configured cloud storage...");
                      // In a real app, this would call an API endpoint
                    }}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-2 text-xs font-bold border border-blue-100"
                    title="Sync to Cloud"
                  >
                    <Globe className="w-4 h-4" />
                    Sync
                  </button>
                  <a
                    href={`/api/download/${job.id}`}
                    download
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-2 text-xs font-bold border border-emerald-100"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              )}
              {job.status === "failed" && (
                <div className="p-2 rounded-lg bg-red-50 text-red-600 flex items-center gap-2 text-xs font-bold border border-red-100">
                  <AlertCircle className="w-4 h-4" />
                  Error
                </div>
              )}
              {(job.status === "queued" || job.status === "processing") && (
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex items-center gap-2 text-xs font-bold border border-blue-100">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {job.status === "processing" ? "Processing..." : "Queued"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Job["status"] }) {
  const styles = {
    queued: "bg-gray-100 text-gray-600",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", styles[status])}>
      {status}
    </span>
  );
}
