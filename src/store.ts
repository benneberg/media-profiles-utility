import { create } from "zustand";
import { Asset, Metadata, Job, Preset } from "./types";

interface AppState {
  currentAsset: Asset | null;
  assets: Asset[];
  metadata: Metadata | null;
  jobs: Job[];
  selectedPreset: Preset | null;
  customPresets: Preset[];
  isPresetEditorOpen: boolean;
  editingPreset: Preset | null;
  comparisonJobIds: string[];
  abTests: { id: string; name: string; assetIds: string[]; presetIds: string[]; createdAt: string }[];
  
  setCurrentAsset: (asset: Asset | null) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
  setMetadata: (metadata: Metadata | null) => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  setSelectedPreset: (preset: Preset | null) => void;
  addCustomPreset: (preset: Preset) => void;
  setIsPresetEditorOpen: (isOpen: boolean, preset?: Preset | null) => void;
  toggleComparisonJob: (jobId: string) => void;
  clearComparison: () => void;
  addABTest: (test: { id: string; name: string; assetIds: string[]; presetIds: string[]; createdAt: string }) => void;
}

export const useStore = create<AppState>((set) => ({
  currentAsset: null,
  assets: [],
  metadata: null,
  jobs: [],
  selectedPreset: null,
  customPresets: [],
  isPresetEditorOpen: false,
  editingPreset: null,
  comparisonJobIds: [],
  abTests: [],

  setCurrentAsset: (asset) => set({ currentAsset: asset, metadata: null }),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  removeAsset: (assetId) => set((state) => ({ 
    assets: state.assets.filter(a => a.assetId !== assetId),
    currentAsset: state.currentAsset?.assetId === assetId ? null : state.currentAsset
  })),
  setMetadata: (metadata) => set({ metadata }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (jobId, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, ...updates } : j)),
    })),
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),
  addCustomPreset: (preset) => set((state) => ({ customPresets: [...state.customPresets, preset] })),
  setIsPresetEditorOpen: (isOpen, preset = null) => set({ isPresetEditorOpen: isOpen, editingPreset: preset }),
  toggleComparisonJob: (jobId) => set((state) => ({
    comparisonJobIds: state.comparisonJobIds.includes(jobId)
      ? state.comparisonJobIds.filter(id => id !== jobId)
      : [...state.comparisonJobIds, jobId]
  })),
  clearComparison: () => set({ comparisonJobIds: [] }),
  addABTest: (test) => set((state) => ({ abTests: [test, ...state.abTests] })),
}));
