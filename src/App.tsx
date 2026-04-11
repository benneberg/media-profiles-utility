import React from "react";
import Upload from "./components/Upload";
import MetadataViewer from "./components/MetadataViewer";
import PresetSelector from "./components/PresetSelector";
import JobTracker from "./components/JobTracker";
import AssetLibrary from "./components/AssetLibrary";
import AboutModal from "./components/AboutModal";
import DocumentationModal from "./components/DocumentationModal";
import SettingsModal from "./components/SettingsModal";
import ComparisonView from "./components/ComparisonView";
import { useStore } from "./store";
import { Video, Settings, Layout, Layers, Zap, Info, Github, Monitor, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

export default function App() {
  const { currentAsset, metadata, setIsPresetEditorOpen } = useStore();
  const [isAboutOpen, setIsAboutOpen] = React.useState(false);
  const [isDocOpen, setIsDocOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Video Studio</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] -mt-1">Metadata & Transcoding</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <NavLink icon={<Layout className="w-4 h-4" />} label="Dashboard" active />
            <NavLink icon={<Settings className="w-4 h-4" />} label="Presets" />
            <NavLink icon={<Layers className="w-4 h-4" />} label="Jobs" />
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Settings"
            >
              <Zap className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">Operator Admin</p>
                <p className="text-[10px] text-slate-500 font-medium">Signage Network A</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://picsum.photos/seed/operator/100/100" alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!currentAsset ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto text-center space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                  Professional Video <span className="text-blue-600">Processing</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                  Extract detailed technical metadata and transcode your video assets using production-grade presets for digital signage and web.
                </p>
              </div>
              
              <Upload />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                <FeatureCard 
                  icon={<Monitor className="w-6 h-6" />}
                  title="Digital Signage"
                  description="Optimized presets for Full HD and 4K signage displays."
                />
                <FeatureCard 
                  icon={<Globe className="w-6 h-6" />}
                  title="Web Ready"
                  description="Standardized web formats with fast-start optimization."
                />
                <FeatureCard 
                  icon={<Zap className="w-6 h-6" />}
                  title="Fast Probing"
                  description="Instant metadata extraction using ffprobe and MediaInfo."
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="studio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Metadata & Presets */}
              <div className="lg:col-span-8 space-y-8">
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <MetadataViewer />
                </section>
                
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <PresetSelector />
                </section>
              </div>

              {/* Right Column: Jobs & Status */}
              <div className="lg:col-span-4 space-y-8 sticky top-24">
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <AssetLibrary />
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <JobTracker />
                </section>

                <div className="p-6 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2">Need Custom Settings?</h3>
                    <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                      Advanced transcoding controls are available in the preset editor for fine-grained GOP and bitrate management.
                    </p>
                    <button 
                      onClick={() => setIsPresetEditorOpen(true)}
                      className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
                    >
                      Open Preset Editor
                    </button>
                  </div>
                  <Settings className="absolute -bottom-4 -right-4 w-32 h-32 text-blue-500/20 group-hover:rotate-45 transition-transform duration-700" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-500">© 2026 Video Metadata & Transcoding Studio</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Terms
            </button>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Privacy
            </button>
            <button 
              onClick={() => setIsDocOpen(true)}
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Documentation
            </button>
          </div>
        </div>
      </footer>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <DocumentationModal isOpen={isDocOpen} onClose={() => setIsDocOpen(false)} />
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      <ComparisonView />
    </div>
  );
}

function NavLink({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={cn(
        "flex items-center gap-2 text-sm font-semibold transition-colors",
        active ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </a>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mb-6">
        {icon}
      </div>
      <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
