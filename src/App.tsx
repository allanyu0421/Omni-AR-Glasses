/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Maximize2,
  RefreshCw,
  Weight,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  Hexagon,
  Eye,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { cn } from '@/src/lib/utils';
import { calculateAnalysis, Material } from '@/src/lib/physics';
import StressViewport from '@/src/components/StressViewport';

export default function App() {
  // Mechanical State
  const [mass, setMass] = useState(0.130);
  const [acceleration, setAcceleration] = useState(2.5);
  const [compressionLoad, setCompressionLoad] = useState(100);
  const [bendingSF, setBendingSF] = useState(2.0);
  const [material, setMaterial] = useState<Material>(Material.Aluminum);

  // Analysis Engine
  const analysisResults = useMemo(() => {
    return calculateAnalysis(mass, acceleration, compressionLoad, bendingSF, material);
  }, [mass, acceleration, compressionLoad, bendingSF, material]);

  const overallStatus = useMemo(() => {
    if (analysisResults.some(r => r.status === "FAIL")) return "FAIL";
    if (analysisResults.some(r => r.status === "CRITICAL")) return "CRITICAL";
    return "PASS";
  }, [analysisResults]);

  // Visual Metrics Data
  const radarData = useMemo(() => {
    return analysisResults.map(r => ({
      subject: r.name,
      A: Math.min((r.value / r.threshold) * 100, 115), 
      fullMark: 100,
      actual: r.value.toFixed(2),
      limit: r.threshold.toFixed(1)
    }));
  }, [analysisResults]);

  const resetDefaults = () => {
    setMass(0.130);
    setAcceleration(2.5);
    setCompressionLoad(100);
    setBendingSF(2.0);
    setMaterial(Material.Aluminum);
  };

  return (
    <div className="flex h-screen bg-[#030712] text-slate-200 font-sans selection:bg-sky-500/30 overflow-hidden bg-[radial-gradient(circle_at_50%_-20%,_#1e293b_0%,_#030712_80%)]">
      
      {/* FIXED SIDEBAR CONTROLS */}
      <aside className="w-80 glass m-6 mr-0 flex flex-col shadow-2xl relative z-10 shrink-0 border-white/5 h-[calc(100vh-3rem)]">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20">
              <Settings2 className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="font-bold tracking-widest text-white uppercase text-xs">Simulation Input</h2>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black italic opacity-60">
            CONTROL_PANEL_v2.5
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          {/* Substrate Selector */}
          <section>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-5 italic">Primary Material</label>
            <div className="space-y-2">
              {Object.values(Material).map((m) => (
                <button
                  key={m}
                  onClick={() => setMaterial(m)}
                  className={cn(
                    "w-full px-4 py-4 rounded-xl border transition-all text-left flex items-center justify-between group",
                    material === m 
                      ? "bg-sky-500/10 border-sky-500/40 text-white shadow-xl" 
                      : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-slate-300"
                  )}
                >
                  <span className="text-[11px] font-black uppercase tracking-tight italic">{m}</span>
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                    material === m ? "border-sky-400 bg-sky-400 text-white" : "border-slate-800"
                  )}>
                    {material === m && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Dynamic Sliders */}
          <div className="space-y-10">
            <ControlSlider 
              icon={<Weight className="w-3.5 h-3.5" />}
              label="Mass (kg)"
              value={mass}
              min={0.05} max={0.30} step={0.005}
              onChange={setMass}
              displayValue={mass.toFixed(3)}
            />
            <ControlSlider 
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Impact Factor"
              value={acceleration}
              min={1.0} max={5.0} step={0.1}
              onChange={setAcceleration}
              displayValue={acceleration.toFixed(1)}
            />
            <ControlSlider 
              icon={<Maximize2 className="w-3.5 h-3.5" />}
              label="Compression (N)"
              value={compressionLoad}
              min={0} max={200} step={5}
              onChange={setCompressionLoad}
              displayValue={compressionLoad.toFixed(0)}
            />
            <ControlSlider 
              icon={<Info className="w-3.5 h-3.5" />}
              label="Bending SF"
              value={bendingSF}
              min={1.0} max={3.0} step={0.1}
              onChange={setBendingSF}
              displayValue={bendingSF.toFixed(1)}
            />
          </div>
        </div>

        <div className="p-8 border-t border-white/5">
          <button 
            onClick={resetDefaults}
            className="w-full py-4 glass-dark border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/5 hover:text-white transition-all shadow-xl italic"
          >
            <RefreshCw className="w-3 h-3" /> Reset Matrix
          </button>
        </div>
      </aside>

      {/* SCROLLING MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        
        {/* TELEMETRY HEADER */}
        <header className="h-24 glass flex items-center justify-between px-10 shrink-0 relative overflow-hidden group border-white/5">
          <div className="absolute top-0 right-0 w-64 h-full bg-sky-500/5 blur-[80px] pointer-events-none group-hover:bg-sky-500/10 transition-all" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-2">
              <Hexagon className="w-8 h-8 text-white fill-white/20" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white leading-none uppercase italic">OmniScene Pro</h1>
              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-[0.4em] font-black opacity-60">Industrial Structural Validator</p>
            </div>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className="text-[9px] uppercase tracking-[0.5em] mb-2 text-slate-500 font-black">Environmental Safety Monitor</div>
            <AnimatePresence mode="wait">
              <motion.div 
                key={overallStatus}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "px-12 py-3 rounded-full font-black text-xs tracking-[0.2em] flex items-center gap-4 border-2 shadow-2xl transition-all duration-500 backdrop-blur-md",
                  overallStatus === "PASS" && "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10",
                  overallStatus === "CRITICAL" && "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-amber-500/10",
                  overallStatus === "FAIL" && "bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-rose-500/10"
                )}
              >
                {overallStatus === "PASS" ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                {overallStatus === "PASS" ? "DESIGN_SAFE" : 
                 overallStatus === "CRITICAL" ? "CRITICAL_PATH" : "FAILURE_IMMINENT"}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="text-right flex flex-col items-end relative z-10">
             <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 opacity-50">Matrix Stream</div>
             <div className="font-mono text-xs text-sky-400 bg-sky-500/10 px-4 py-2 rounded-xl border border-sky-500/20 shadow-inner">
               SYNC: <span className="animate-pulse underline ml-1">STABLE</span>
             </div>
          </div>
        </header>

        {/* TOP MODULE: Visual Analysis (Image & Radar) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 shrink-0 h-auto">
          {/* Left: 3D Rendering */}
          <div className="glass-dark aspect-video lg:aspect-auto h-[400px] relative overflow-hidden flex items-center justify-center group bg-[#020617] border-white/5">
            <div className="absolute top-6 left-6 z-20 flex gap-3">
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Box className="w-3 h-3 text-sky-400" />
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest leading-none">3D Topology</span>
              </div>
            </div>
            
            <div className="w-full h-full">
              <StressViewport 
                mass={mass} 
                acceleration={acceleration} 
                compressionLoad={compressionLoad} 
                bendingSF={bendingSF} 
              />
            </div>

            <div className="absolute bottom-6 right-8 text-[10px] font-mono text-slate-600 text-right uppercase tracking-[0.2em] leading-tight">
              RENDER_ENGINE: PLOTLY_FEA_v2<br />
              VECTORS: {analysisResults.length} / REALTIME
            </div>
          </div>

          {/* Right: Radar Stress Map */}
          <div className="glass h-[400px] p-8 flex flex-col items-center border-white/5">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 w-full text-left italic flex items-center gap-3">
               <Eye className="w-4 h-4 text-sky-400" /> Vector Magnitude Map
             </h3>
             <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#334155" strokeWidth={0.5} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#64748b', fontSize: 9, fontWeight: '900' }} 
                    />
                    <Radar
                      name="Stress (%)"
                      dataKey="A"
                      stroke={overallStatus === "FAIL" ? "#f43f5e" : overallStatus === "CRITICAL" ? "#fbbf24" : "#38bdf8"}
                      fill={overallStatus === "FAIL" ? "#f43f5e" : overallStatus === "CRITICAL" ? "#fbbf24" : "#38bdf8"}
                      fillOpacity={0.2}
                      strokeWidth={3}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.98)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '16px', 
                        fontSize: '11px', 
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* BOTTOM MODULE: Detailed Telemetry & Advice (No internal scroll) */}
        <div className="flex flex-col lg:flex-row gap-6 h-auto min-h-0">
          {/* Vector Table */}
          <div className="flex-1 glass border-white/5 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">
                 Six-Force Telemetry Matrix
              </h3>
              <div className="text-[9px] text-slate-600 font-mono tracking-tighter">DATA_SYNC_PRO_v2</div>
            </div>
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-white/5">
                  {analysisResults.map((r) => (
                    <tr key={r.name} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-black text-xs text-white uppercase tracking-tight italic">{r.name}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-tighter opacity-60 italic">{r.description}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="font-mono text-xs text-sky-400 font-black italic">{r.value.toFixed(2)}</div>
                        <div className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-1">MPa_CALC</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={cn(
                          "inline-block px-4 py-1.5 rounded-lg text-[9px] font-black tracking-[0.14em] uppercase border transition-all",
                          r.status === "PASS" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                          r.status === "CRITICAL" && "bg-amber-500/10 border-amber-500/30 text-amber-400",
                          r.status === "FAIL" && "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        )}>
                          {r.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advice Column */}
          <section className="w-full lg:w-[450px] glass p-8 flex flex-col border-white/5">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5">
                 <AlertTriangle className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] italic leading-none mb-1">Design Advisor</h4>
                 <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black opacity-50">Expert Intelligence</p>
               </div>
             </div>

             <div className="space-y-4">
               {analysisResults.filter(r => r.status !== "PASS").length > 0 ? (
                 analysisResults.filter(r => r.status !== "PASS").map((r, i) => (
                   <motion.div 
                     initial={{ x: 20, opacity: 0 }}
                     whileInView={{ x: 0, opacity: 1 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     key={r.name}
                     className={cn(
                       "p-6 rounded-2xl border-l-[6px] space-y-2 relative overflow-hidden",
                       r.status === "FAIL" ? "bg-rose-500/5 border-rose-500/50" : "bg-amber-500/5 border-amber-500/50"
                     )}
                   >
                     <p className={cn(
                       "text-[10px] font-black uppercase tracking-[0.2em] italic",
                       r.status === "FAIL" ? "text-rose-400" : "text-amber-400"
                     )}>Correction Layer: {r.name}</p>
                     <p className="text-[11px] text-slate-300 leading-relaxed italic font-medium">{r.mitigation}</p>
                   </motion.div>
                 ))
               ) : (
                 <div className="w-full py-12 flex flex-col items-center justify-center text-center p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl group">
                    <div className="w-14 h-14 rounded-full border border-emerald-500/30 flex items-center justify-center mb-5 transition-all group-hover:scale-110">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2 italic">Structural Optimized</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic max-w-[240px]">
                      The simulation confirms that thermal displacement and kinetic stress across the {material} frame are within acceptable safety margins.
                    </p>
                 </div>
               )}
             </div>
          </section>
        </div>

      </main>
    </div>
  );
}

// Technical Slider Component
function ControlSlider({ icon, label, value, min, max, step, onChange, displayValue }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 italic">
          <span className="p-1.5 bg-white/5 rounded-lg border border-white/10 text-sky-400">{icon}</span> {label}
        </label>
        <div className="font-mono text-sky-400 text-xs font-black bg-sky-500/10 px-4 py-1.5 rounded-xl border border-sky-400/30 shadow-2xl">{displayValue}</div>
      </div>
      <div className="relative flex items-center px-2">
        <input 
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition-all shadow-inner"
        />
      </div>
    </div>
  );
}