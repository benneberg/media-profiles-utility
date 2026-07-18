import React, { useState } from "react";
import { useStore } from "../store";
import { LogIn, UserPlus, Mail, Lock, User, AlertTriangle, Loader2, Video } from "lucide-react";
import axios from "axios";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthScreen() {
  const { setUser } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email, password } : { email, password, name };
      
      const response = await axios.post(endpoint, payload);
      const { token, user } = response.data;

      localStorage.setItem("mmm_auth_token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.response?.data?.error || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center p-4 selection:bg-accent selection:text-white">
      {/* Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border-4 border-black p-8 shadow-brutal relative overflow-hidden"
      >
        {/* Banner decorative line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-accent" />

        <div className="flex flex-col items-center text-center mb-8 mt-2">
          <div className="w-14 h-14 bg-black border-2 border-black flex items-center justify-center text-white shadow-brutal-sm mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-black uppercase">
            MMM <span className="text-accent">Studio</span>
          </h1>
          <p className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em] mt-1">
            MediaMetaManagement Authentication
          </p>
        </div>

        <div className="flex border-2 border-black p-1 bg-black/5 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={cn(
              "flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all",
              isLogin ? "bg-black text-white" : "text-black hover:bg-black/10"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={cn(
              "flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all",
              !isLogin ? "bg-black text-white" : "text-black hover:bg-black/10"
            )}
          >
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-red-100 border-2 border-red-500 text-red-900 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs font-black uppercase tracking-wide leading-relaxed">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black text-xs font-bold uppercase tracking-wider bg-white focus:outline-none focus:bg-accent/5 focus:ring-0"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/60">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-black text-xs font-bold uppercase tracking-wider bg-white focus:outline-none focus:bg-accent/5 focus:ring-0"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/60">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-black text-xs font-bold uppercase tracking-wider bg-white focus:outline-none focus:bg-accent/5 focus:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-4 bg-accent text-black font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-all shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <LogIn className="w-5 h-5" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            <span>{isLoading ? "Authenticating..." : isLogin ? "Sign In" : "Register"}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-black/10 text-center">
          <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest leading-relaxed">
            {isLogin 
              ? "New to MMM Studio? Switch to register to create your profile." 
              : "Already have an account? Sign in to access your media hub."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
