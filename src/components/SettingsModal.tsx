import React, { useState, useEffect } from "react";
import { X, Globe, Plus, Trash2, Code, Book, Zap, Copy, Check, Info } from "lucide-react";
import axios from "axios";
import { cn } from "../lib/utils";

interface Webhook {
  url: string;
}

interface ApiDoc {
  name: string;
  version: string;
  description: string;
  endpoints: {
    path: string;
    method: string;
    description: string;
    body?: string;
  }[];
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [webhooks, setWebhooks] = useState<string[]>([]);
  const [newWebhook, setNewWebhook] = useState("");
  const [apiDocs, setApiDocs] = useState<ApiDoc | null>(null);
  const [activeTab, setActiveTab] = useState<"webhooks" | "api" | "cloud">("webhooks");
  const [copied, setCopied] = useState<string | null>(null);
  const [cloudConfig, setCloudConfig] = useState({
    provider: "s3",
    bucket: "",
    region: "us-east-1",
    accessKey: "",
    secretKey: "",
  });

  const saveCloudConfig = () => {
    localStorage.setItem("cloud_config", JSON.stringify(cloudConfig));
    setCopied("cloud_saved");
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [webhooksRes, apiDocsRes] = await Promise.all([
          axios.get("/api/webhooks"),
          axios.get("/api/docs")
        ]);
        if (isMounted) {
          setWebhooks(Array.isArray(webhooksRes.data) ? webhooksRes.data : []);
          setApiDocs(apiDocsRes.data);
        }
      } catch (err) {
        console.error("Settings load failed:", err);
      }

      try {
        const saved = localStorage.getItem("cloud_config");
        if (saved && saved !== "undefined" && saved !== "null") {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setCloudConfig((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch (err) {
        console.error("Local config load failed:", err);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const addWebhook = async () => {
    if (!newWebhook) return;
    try {
      await axios.post("/api/webhooks", { url: newWebhook });
      setNewWebhook("");
      const response = await axios.get("/api/webhooks");
      setWebhooks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to add webhook:", err);
    }
  };

  const removeWebhook = async (url: string) => {
    try {
      await axios.delete("/api/webhooks", { data: { url } });
      const response = await axios.get("/api/webhooks");
      setWebhooks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to remove webhook:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl border-4 border-black shadow-brutal-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b-4 border-black flex items-center justify-between bg-accent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black uppercase tracking-tighter">System Settings</h2>
              <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Automation & API Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b-4 border-black bg-white">
          <button
            onClick={() => setActiveTab("webhooks")}
            className={cn(
              "flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all border-r-4 border-black",
              activeTab === "webhooks" ? "bg-black text-white" : "bg-white text-black/40 hover:text-black"
            )}
          >
            Webhooks
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={cn(
              "flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all border-r-4 border-black",
              activeTab === "api" ? "bg-black text-white" : "bg-white text-black/40 hover:text-black"
            )}
          >
            API Docs
          </button>
          <button
            onClick={() => setActiveTab("cloud")}
            className={cn(
              "flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "cloud" ? "bg-black text-white" : "bg-white text-black/40 hover:text-black"
            )}
          >
            Cloud
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-offwhite custom-scrollbar">
          {activeTab === "webhooks" ? (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-black uppercase tracking-tighter">Register New Webhook</h3>
                <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-relaxed">We'll send a POST request to this URL whenever a job completes or fails.</p>
                <div className="flex gap-4 mt-6">
                  <input
                    type="url"
                    placeholder="https://your-api.com/webhook"
                    value={newWebhook}
                    onChange={(e) => setNewWebhook(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-black bg-white text-sm font-black uppercase tracking-widest focus:outline-none focus:bg-accent transition-all"
                  />
                  <button
                    onClick={addWebhook}
                    className="w-14 h-14 bg-black text-white border-2 border-black flex items-center justify-center hover:bg-accent hover:text-black transition-all shadow-brutal-sm hover:shadow-none active:translate-x-1 active:translate-y-1"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black text-black uppercase tracking-tighter">Active Webhooks</h3>
                {webhooks.length > 0 ? (
                  <div className="space-y-4">
                    {webhooks.map((url) => (
                      <div key={url} className="flex items-center justify-between p-4 bg-white border-2 border-black shadow-brutal-sm group">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <Globe className="w-5 h-5 text-black/20" />
                          <span className="text-[10px] font-black text-black uppercase tracking-widest truncate">{url}</span>
                        </div>
                        <button
                          onClick={() => removeWebhook(url)}
                          className="p-2 text-black/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-black/10 border-4 border-dashed border-black bg-white">
                    <Globe className="w-16 h-16 mb-4 opacity-10" />
                    <p className="text-xs font-black uppercase tracking-widest">No webhooks registered</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "api" ? (
            <div className="space-y-10">
              {apiDocs && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-black text-black uppercase tracking-tighter">{apiDocs.name}</h3>
                      <span className="px-2 py-1 bg-accent border-2 border-black text-[10px] font-black uppercase tracking-widest">v{apiDocs.version}</span>
                    </div>
                    <p className="text-xs font-black text-black/50 uppercase tracking-widest leading-relaxed">{apiDocs.description}</p>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-black/40 uppercase tracking-widest">Endpoints</h4>
                    <div className="space-y-6">
                      {apiDocs.endpoints?.map((ep) => (
                        <div key={ep.path} className="p-6 bg-white border-4 border-black shadow-brutal-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className={cn(
                                "px-2 py-1 border-2 border-black text-[10px] font-black uppercase tracking-widest",
                                ep.method === "POST" ? "bg-accent text-black" : "bg-black text-white"
                              )}>
                                {ep.method}
                              </span>
                              <code className="text-xs font-black text-black uppercase tracking-widest">{ep.path}</code>
                            </div>
                            <button
                              onClick={() => copyToClipboard(ep.path)}
                              className="text-black/20 hover:text-black transition-colors"
                            >
                              {copied === ep.path ? <Check className="w-5 h-5 text-accent" /> : <Copy className="w-5 h-5" />}
                            </button>
                          </div>
                          <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-relaxed">{ep.description}</p>
                          {ep.body && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Request Body</p>
                              <pre className="p-4 bg-black text-accent text-[10px] font-black uppercase tracking-widest overflow-x-auto border-2 border-black">
                                {ep.body}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-black uppercase tracking-tighter">Cloud Storage Integration</h3>
                <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-relaxed">Automatically sync completed variants to your cloud provider.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Provider</label>
                  <select
                    value={cloudConfig.provider}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, provider: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black bg-white text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-accent transition-all"
                  >
                    <option value="s3">Amazon S3</option>
                    <option value="gcs">Google Cloud Storage</option>
                    <option value="azure">Azure Blob Storage</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Region</label>
                  <input
                    type="text"
                    value={cloudConfig.region}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, region: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black bg-white text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-accent transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Bucket Name</label>
                  <input
                    type="text"
                    value={cloudConfig.bucket}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, bucket: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black bg-white text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Access Key</label>
                  <input
                    type="password"
                    value={cloudConfig.accessKey}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, accessKey: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black bg-white text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Secret Key</label>
                  <input
                    type="password"
                    value={cloudConfig.secretKey}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, secretKey: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black bg-white text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-accent transition-all"
                  />
                </div>
              </div>

              <div className="pt-8 border-t-2 border-black flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] font-black text-black/40 uppercase tracking-widest italic">
                  <Info className="w-4 h-4" />
                  Credentials are stored locally.
                </div>
                <button
                  onClick={saveCloudConfig}
                  className="px-8 py-3 bg-black text-white border-2 border-black font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all shadow-brutal-sm hover:shadow-none active:translate-x-1 active:translate-y-1 flex items-center gap-3"
                >
                  {copied === "cloud_saved" ? <Check className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  {copied === "cloud_saved" ? "Saved" : "Save Config"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-white border-t-4 border-black flex justify-end">
          <button
            onClick={onClose}
            className="brutal-btn bg-black text-white px-10 py-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
