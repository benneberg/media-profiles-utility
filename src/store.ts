import { create } from "zustand";
import { Asset, Metadata, Job, Preset } from "./types";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  currentAsset: Asset | null;
  assets: Asset[];
  metadata: Metadata | null;
  jobs: Job[];
  presets: Preset[];
  selectedPreset: Preset | null;
  isPresetEditorOpen: boolean;
  editingPreset: Preset | null;
  comparisonJobIds: string[];
  abTests: { id: string; name: string; assetIds: string[]; presetIds: string[]; createdAt: string }[];
  selectedAssetIds: string[];
  isBatchMode: boolean;
  
  setCurrentAsset: (asset: Asset | null) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
  setMetadata: (metadata: Metadata | null) => void;
  setPresets: (presets: Preset[]) => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  setJobs: (jobs: Job[]) => void;
  setSelectedPreset: (preset: Preset | null) => void;
  addPreset: (preset: Preset) => void;
  removePreset: (presetId: string) => void;
  setIsPresetEditorOpen: (isOpen: boolean, preset?: Preset | null) => void;
  toggleComparisonJob: (jobId: string) => void;
  clearComparison: () => void;
  addABTest: (test: { id: string; name: string; assetIds: string[]; presetIds: string[]; createdAt: string }) => void;
  toggleSelectAsset: (assetId: string) => void;
  clearSelectedAssets: () => void;
  setBatchMode: (enabled: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  currentAsset: null,
  assets: [],
  metadata: null,
  jobs: [],
  presets: [],
  selectedPreset: null,
  isPresetEditorOpen: false,
  editingPreset: null,
  comparisonJobIds: [],
  abTests: [],
  selectedAssetIds: [],
  isBatchMode: false,
 
  setCurrentAsset: (asset) => set({ currentAsset: asset, metadata: null }),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  removeAsset: (assetId) => set((state) => ({ 
    assets: state.assets.filter(a => a.assetId !== assetId),
    currentAsset: state.currentAsset?.assetId === assetId ? null : state.currentAsset,
    selectedAssetIds: state.selectedAssetIds.filter(id => id !== assetId)
  })),
  setMetadata: (metadata) => set({ metadata }),
  setPresets: (presets) => set({ presets }),
  addJob: (job) => set((state) => ({ 
    jobs: state.jobs.some(j => j.id === job.id) ? state.jobs.map(j => j.id === job.id ? { ...j, ...job } : j) : [job, ...state.jobs] 
  })),
  setJobs: (jobs) => set({ jobs }),
  updateJob: (jobId, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, ...updates } : j)),
    })),
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),
  addPreset: (preset) => set((state) => ({ 
    presets: state.presets.some(p => p.id === preset.id) ? state.presets.map(p => p.id === preset.id ? preset : p) : [...state.presets, preset] 
  })),
  removePreset: (presetId) => set((state) => ({
    presets: state.presets.filter(p => p.id !== presetId)
  })),
  setIsPresetEditorOpen: (isOpen, preset = null) => set({ isPresetEditorOpen: isOpen, editingPreset: preset }),
  toggleComparisonJob: (jobId) => set((state) => ({
    comparisonJobIds: state.comparisonJobIds.includes(jobId)
      ? state.comparisonJobIds.filter(id => id !== jobId)
      : [...state.comparisonJobIds, jobId]
  })),
  clearComparison: () => set({ comparisonJobIds: [] }),
  addABTest: (test) => set((state) => ({ abTests: [test, ...state.abTests] })),
  toggleSelectAsset: (assetId) => set((state) => ({
    selectedAssetIds: state.selectedAssetIds.includes(assetId)
      ? state.selectedAssetIds.filter(id => id !== assetId)
      : [...state.selectedAssetIds, assetId]
  })),
  clearSelectedAssets: () => set({ selectedAssetIds: [] }),
  setBatchMode: (enabled) => set((state) => ({
    isBatchMode: enabled,
    selectedAssetIds: enabled && state.currentAsset ? [state.currentAsset.assetId] : []
  })),
}));
