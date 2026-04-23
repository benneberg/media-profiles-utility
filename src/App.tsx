import React from "react";
import Upload from "./components/Upload";
import MetadataViewer from "./components/MetadataViewer";
import PresetSelector from "./components/PresetSelector";
import JobTracker from "./components/JobTracker";
import AssetLibrary from "./components/AssetLibrary";
import AboutModal from "./components/AboutModal";
import DocumentationModal from "./components/DocumentationModal";
import SettingsModal from "./components/SettingsModal";
import PresetEditor from "./components/PresetEditor";
import ABTestCreator from "./components/ABTestCreator";
import ComparisonView from "./components/ComparisonView";
import { useStore } from "./store";
import { Video, Settings, Layout, Layers, Zap, Info, Github, Monitor, Globe, Beaker, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./lib/utils";

export default function App() {
  const { currentAsset, metadata, setIsPresetEditorOpen, isPresetEditorOpen, setCurrentAsset, editingPreset } = useStore();
  const [isAboutOpen, setIsAboutOpen] = React.useState(false);
  const [isDocOpen, setIsDocOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isABTestOpen, setIsABTestOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-offwhite text-black font-sans selection:bg-accent selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-white shadow-brutal-sm">
              <Video className="w-7 h-7" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tighter text-black leading-none">MMM</h1>
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mt-1">MediaMetaManagement</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8">
            <NavLink 
              icon={<Layout className="w-4 h-4" />} 
              label="Dashboard" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              active 
            />
            <NavLink 
              icon={<Settings className="w-4 h-4" />} 
              label="Presets" 
              onClick={() => document.getElementById('presets-section')?.scrollIntoView({ behavior: 'smooth' })}
            />
            <NavLink 
              icon={<Layers className="w-4 h-4" />} 
              label="Jobs" 
              onClick={() => document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentAsset(null)}
              className="brutal-btn bg-white text-black"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">New Upload</span>
            </button>
            <button 
              onClick={() => setIsABTestOpen(true)}
              className="brutal-btn-accent"
            >
              <Beaker className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">A/B Test</span>
            </button>
            <div className="h-8 w-[2px] bg-black hidden sm:block mx-2" />
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-all rounded-none"
              title="Settings"
            >
              <Zap className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="p-2 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-all rounded-none hidden sm:block"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <AnimatePresence mode="wait">
          {!currentAsset ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="max-w-4xl mx-auto text-center space-y-16"
            >
              <div className="space-y-6">
                <motion.h2 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-5xl sm:text-7xl font-black text-black tracking-tighter leading-none"
                >
                  MMM <span className="text-accent">STUDIO</span>
                </motion.h2>
                <p className="text-lg sm:text-xl text-black/60 max-w-2xl mx-auto leading-relaxed font-medium">
                  Professional video metadata inspection and transcoding. Engineered for digital signage, broadcast, and high-performance web workflows.
                </p>
              </div>
              
              <div className="p-2 bg-black shadow-brutal-lg">
                <Upload />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
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
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
            >
              {/* Left Column: Metadata & Presets */}
              <div className="lg:col-span-8 space-y-10">
                <section id="metadata-section" className="brutal-card p-6 sm:p-10">
                  <MetadataViewer />
                </section>
                
                <section id="presets-section" className="brutal-card p-6 sm:p-10">
                  <PresetSelector />
                </section>
              </div>

              {/* Right Column: Jobs & Status */}
              <div className="lg:col-span-4 space-y-10 sticky top-28">
                <section className="brutal-card p-6 sm:p-8">
                  <AssetLibrary />
                </section>

                <section id="jobs-section" className="brutal-card p-6 sm:p-8">
                  <JobTracker />
                </section>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-8 bg-accent border-2 border-black shadow-brutal relative overflow-hidden group cursor-pointer"
                  onClick={() => setIsPresetEditorOpen(true)}
                >
                  <div className="relative z-10">
                    <h3 className="font-black text-2xl mb-2 text-black uppercase tracking-tighter">Custom Settings?</h3>
                    <p className="text-black/70 text-sm mb-6 leading-relaxed font-bold">
                      Advanced transcoding controls are available in the preset editor for fine-grained GOP and bitrate management.
                    </p>
                    <button 
                      className="brutal-btn bg-black text-white w-full"
                    >
                      Open Editor
                    </button>
                  </div>
                  <Settings className="absolute -bottom-6 -right-6 w-32 h-32 text-black/10 group-hover:rotate-90 transition-transform duration-1000" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t-2 border-black py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-white">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">© 2026 MMM STUDIO</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-black hover:text-accent transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="text-xs font-black uppercase tracking-widest hover:text-accent transition-colors"
            >
              Terms
            </button>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="text-xs font-black uppercase tracking-widest hover:text-accent transition-colors"
            >
              Privacy
            </button>
            <button 
              onClick={() => setIsDocOpen(true)}
              className="text-xs font-black uppercase tracking-widest hover:text-accent transition-colors"
            >
              Documentation
            </button>
          </div>
        </div>
      </footer>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <DocumentationModal isOpen={isDocOpen} onClose={() => setIsDocOpen(false)} />
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      {isPresetEditorOpen && <PresetEditor key={editingPreset?.id || "new"} onClose={() => setIsPresetEditorOpen(false)} />}
      {isABTestOpen && <ABTestCreator onClose={() => setIsABTestOpen(false)} />}
      <ComparisonView />
    </div>
  );
}

function NavLink({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all relative group",
        active ? "text-accent" : "text-black/40 hover:text-black"
      )}
    >
      {icon}
      {label}
      {active && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-1 bg-accent" />}
      {!active && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-black scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />}
    </button>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="brutal-card p-8 group"
    >
      <div className="w-14 h-14 bg-offwhite border-2 border-black flex items-center justify-center text-black group-hover:bg-accent transition-colors mb-6 shadow-brutal-sm">
        {icon}
      </div>
      <h4 className="text-xl font-black text-black mb-3 uppercase tracking-tighter">{title}</h4>
      <p className="text-sm text-black/60 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}
