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
    fetchWebhooks();
    fetchApiDocs();
    const saved = localStorage.getItem("cloud_config");
    if (saved) setCloudConfig(JSON.parse(saved));
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await axios.get("/api/webhooks");
      setWebhooks(response.data);
    } catch (err) {
      console.error("Failed to fetch webhooks:", err);
    }
  };

  const fetchApiDocs = async () => {
    try {
      const response = await axios.get("/api/docs");
      setApiDocs(response.data);
    } catch (err) {
      console.error("Failed to fetch API docs:", err);
    }
  };

  const addWebhook = async () => {
    if (!newWebhook) return;
    try {
      await axios.post("/api/webhooks", { url: newWebhook });
      setNewWebhook("");
      fetchWebhooks();
    } catch (err) {
      console.error("Failed to add webhook:", err);
    }
  };

  const removeWebhook = async (url: string) => {
    try {
      await axios.delete("/api/webhooks", { data: { url } });
      fetchWebhooks();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings</h2>
              <p className="text-xs text-slate-500 font-medium">Automation & API Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-8">
          <button
            onClick={() => setActiveTab("webhooks")}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-2",
              activeTab === "webhooks" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            Webhooks
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-2",
              activeTab === "api" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            API Documentation
          </button>
          <button
            onClick={() => setActiveTab("cloud")}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-2",
              activeTab === "cloud" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            Cloud Storage
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === "webhooks" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Register New Webhook</h3>
                <p className="text-xs text-slate-500">We'll send a POST request to this URL whenever a job completes or fails.</p>
                <div className="flex gap-2 mt-4">
                  <input
                    type="url"
                    placeholder="https://your-api.com/webhook"
                    value={newWebhook}
                    onChange={(e) => setNewWebhook(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    onClick={addWebhook}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Active Webhooks</h3>
                {webhooks.length > 0 ? (
                  <div className="space-y-2">
                    {webhooks.map((url) => (
                      <div key={url} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-mono text-slate-600 truncate">{url}</span>
                        </div>
                        <button
                          onClick={() => removeWebhook(url)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                    <Globe className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">No webhooks registered</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "api" ? (
            <div className="space-y-8">
              {apiDocs && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{apiDocs.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest">v{apiDocs.version}</span>
                    </div>
                    <p className="text-sm text-slate-500">{apiDocs.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Endpoints</h4>
                    <div className="space-y-4">
                      {apiDocs.endpoints.map((ep) => (
                        <div key={ep.path} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                                ep.method === "POST" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                              )}>
                                {ep.method}
                              </span>
                              <code className="text-xs font-mono font-bold text-slate-700">{ep.path}</code>
                            </div>
                            <button
                              onClick={() => copyToClipboard(ep.path)}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {copied === ep.path ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">{ep.description}</p>
                          {ep.body && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Request Body</p>
                              <pre className="p-2 rounded-lg bg-slate-900 text-blue-400 text-[10px] font-mono overflow-x-auto">
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
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Cloud Storage Integration</h3>
                <p className="text-xs text-slate-500">Automatically sync completed variants to your cloud provider.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Provider</label>
                  <select
                    value={cloudConfig.provider}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, provider: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="s3">Amazon S3</option>
                    <option value="gcs">Google Cloud Storage</option>
                    <option value="azure">Azure Blob Storage</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Region</label>
                  <input
                    type="text"
                    value={cloudConfig.region}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, region: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bucket Name</label>
                  <input
                    type="text"
                    value={cloudConfig.bucket}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, bucket: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Key</label>
                  <input
                    type="password"
                    value={cloudConfig.accessKey}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, accessKey: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Key</label>
                  <input
                    type="password"
                    value={cloudConfig.secretKey}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, secretKey: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 italic">
                  <Info className="w-3 h-3" />
                  Credentials are stored locally in your browser.
                </div>
                <button
                  onClick={saveCloudConfig}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                  {copied === "cloud_saved" ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {copied === "cloud_saved" ? "Saved" : "Save Configuration"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
