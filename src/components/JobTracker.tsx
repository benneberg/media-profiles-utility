import React, { useEffect } from "react";
import { useStore } from "../store";
import { Job } from "../types";
import { Loader2, CheckCircle, AlertCircle, Download, Clock, Zap, ExternalLink, ArrowRightLeft, Trash2, Globe, Layers } from "lucide-react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../lib/utils";

export default function JobTracker() {
  const { jobs, updateJob, toggleComparisonJob, comparisonJobIds, abTests } = useStore();

  if (jobs.length === 0) return null;

  const groupedJobs = jobs.reduce((acc, job) => {
    const key = job.testId || "standalone";
    if (!acc[key]) acc[key] = [];
    acc[key].push(job);
    return acc;
  }, {} as Record<string, Job[]>);

  return (
    <div className="w-full space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Processing Pipeline</h2>
            <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Track and compare tasks</p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedJobs).map(([testId, testJobs]) => {
          const testInfo = abTests.find(t => t.id === testId);
          
          return (
            <div key={testId} className="space-y-6">
              {testId !== "standalone" && (
                <div className="flex items-center gap-4 px-2">
                  <div className="w-10 h-10 border-2 border-black bg-white text-black flex items-center justify-center shadow-brutal-sm">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-black uppercase tracking-widest">{testInfo?.name || "A/B Engineering Test"}</h3>
                    <p className="text-[10px] text-black/50 font-black uppercase tracking-widest">Batch of {testJobs.length} variants</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {testJobs.map((job) => (
                  <div
                    key={job.id}
                    className={cn(
                      "bg-white p-6 border-4 transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center gap-6",
                      comparisonJobIds.includes(job.id) ? "border-accent shadow-brutal" : "border-black shadow-brutal-sm"
                    )}
                  >
                    {job.thumbnailUrl && (
                      <div className="w-full lg:w-40 aspect-video border-2 border-black overflow-hidden bg-offwhite shrink-0 relative group">
                        <img src={job.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {job.status === "completed" && (
                          <button 
                            onClick={() => toggleComparisonJob(job.id)}
                            className={cn(
                              "absolute inset-0 flex items-center justify-center bg-accent/90 text-black opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm",
                              comparisonJobIds.includes(job.id) && "opacity-100"
                            )}
                          >
                            <ArrowRightLeft className="w-8 h-8" />
                            <span className="ml-2 text-[10px] font-black uppercase tracking-widest">
                              {comparisonJobIds.includes(job.id) ? "Remove" : "Compare"}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center justify-between sm:justify-start gap-4 mb-2">
                        <h3 className="font-black text-black truncate text-lg uppercase tracking-tighter">{job.preset.name}</h3>
                        <StatusBadge status={job.status} />
                      </div>
                      <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-black/40">
                        <span className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </span>
                        <span className="tracking-widest">ID: {job.id.split("-")[0]}</span>
                      </div>
                      
                      {job.thumbnailStrip && job.thumbnailStrip.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                          {job.thumbnailStrip.map((url, i) => (
                            <img 
                              key={i} 
                              src={url} 
                              alt={`Strip ${i}`} 
                              className="h-10 aspect-video border-2 border-black object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:w-56 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-black">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="h-4 w-full bg-offwhite border-2 border-black overflow-hidden relative">
                        <div
                          className={cn(
                            "h-full transition-all duration-500 border-r-2 border-black",
                            job.status === "failed" ? "bg-red-500" : job.status === "completed" ? "bg-accent" : "bg-black"
                          )}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
                      {job.status === "completed" && (
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                          <button 
                            onClick={() => toggleComparisonJob(job.id)}
                            className={cn(
                              "flex-1 lg:flex-none brutal-btn text-[10px] py-2",
                              comparisonJobIds.includes(job.id) 
                                ? "bg-accent text-black" 
                                : "bg-white text-black"
                            )}
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                            Compare
                          </button>
                          <button 
                            onClick={() => {
                              alert("Syncing to configured cloud storage...");
                            }}
                            className="flex-1 lg:flex-none brutal-btn bg-white text-black text-[10px] py-2"
                            title="Sync to Cloud"
                          >
                            <Globe className="w-4 h-4" />
                            Sync
                          </button>
                          <a
                            href={`/api/download/${job.id}`}
                            download
                            className="flex-1 lg:flex-none brutal-btn bg-black text-white text-[10px] py-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      )}
                      {job.status === "failed" && (
                        <div className="w-full lg:w-auto p-3 bg-red-500 text-white border-2 border-black flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest">
                          <AlertCircle className="w-4 h-4" />
                          Error
                        </div>
                      )}
                      {(job.status === "queued" || job.status === "processing") && (
                        <div className="w-full lg:w-auto p-3 bg-white text-black border-2 border-black flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest">
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
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Job["status"] }) {
  const styles = {
    queued: "bg-offwhite text-black/40 border-black/10",
    processing: "bg-black text-white border-black",
    completed: "bg-accent text-black border-black",
    failed: "bg-red-500 text-white border-black",
  };

  return (
    <span className={cn("px-3 py-1 border-2 text-[9px] font-black uppercase tracking-widest", styles[status])}>
      {status}
    </span>
  );
}
