
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShieldCheck, 
  Link2, 
  Lock, 
  Unlock, 
  Zap, 
  Palette, 
  Layers, 
  Cpu, 
  RefreshCw,
  Info,
  ChevronRight,
  Maximize2,
  FileText,
  ScanEye,
  Globe,
  // Fix: Added Activity to the imports from lucide-react
  Activity
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const DIMENSION_COUNT = 500;

const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'aleph0' | 'aleph1' | 'aleph3'>('aleph0');
  const [isPrivateKey, setIsPrivateKey] = useState<boolean>(true);
  const [targetPoint, setTargetPoint] = useState<number[]>(new Array(DIMENSION_COUNT).fill(0).map(() => Math.random() * 10 - 5));
  const [foundPoint, setFoundPoint] = useState<number[] | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [dimensionLabels, setDimensionLabels] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  // Initialize art-specific dimension labels using AI
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "List 12 technical, high-precision properties for an artwork's 'digital fingerprint' in a 500-dimensional lattice (e.g., 'Pigment Molecular Spin', 'Canvas Warp Vector', 'Brushstroke Velocity'). Return ONLY the list, one per line.",
          config: { temperature: 0.8 }
        });
        const labels = response.text.split('\n').filter(l => l.trim().length > 0).slice(0, 12);
        setDimensionLabels(labels.length > 0 ? labels : [
          'Pigment Depth', 'Surface Tension', 'X-Ray Opacity', 'Canvas Grain', 
          'Spectral Hash', 'Stroke Pressure', 'Age-Index', 'Chemical Signature', 
          'Luminescence', 'Fiber Alignment', 'Thermal Map', 'Varnish Decay'
        ]);
      } catch (e) {
        setDimensionLabels([
          'Pigment Depth', 'Surface Tension', 'X-Ray Opacity', 'Canvas Grain', 
          'Spectral Hash', 'Stroke Pressure', 'Age-Index', 'Chemical Signature', 
          'Luminescence', 'Fiber Alignment', 'Thermal Map', 'Varnish Decay'
        ]);
      }
    };
    fetchLabels();
  }, [ai]);

  // Lattice/Bridge Visualizer Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      
      // Draw a "Hyper-Bridge" structure
      const spacing = 45;
      const skew = isPrivateKey ? 0.2 : 0.95;
      const nodes = 7;

      ctx.lineWidth = 1;
      
      for (let i = -nodes; i <= nodes; i++) {
        for (let j = -nodes; j <= nodes; j++) {
          const depth = (i + j) / (nodes * 2);
          const x = i * spacing + j * spacing * skew + Math.sin(time + i) * 2;
          const y = j * spacing + i * spacing * (skew * 0.5) + Math.cos(time + j) * 2;

          const px = centerX + x;
          const py = centerY + y;

          // Drawing "Crystalline" Connections
          ctx.strokeStyle = isPrivateKey 
            ? `rgba(52, 211, 153, ${0.15 - Math.abs(depth) * 0.1})` 
            : `rgba(244, 63, 94, ${0.15 - Math.abs(depth) * 0.1})`;

          // Vertical links
          if (i < nodes) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(centerX + (i + 1) * spacing + j * spacing * skew, centerY + j * spacing + (i + 1) * spacing * (skew * 0.5));
            ctx.stroke();
          }

          // Horizontal links
          if (j < nodes) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(centerX + i * spacing + (j + 1) * spacing * skew, centerY + (j + 1) * spacing + i * spacing * (skew * 0.5));
            ctx.stroke();
          }

          // Lattice Points
          ctx.fillStyle = isPrivateKey ? '#34d399' : '#f43f5e';
          const size = (1 - Math.abs(depth)) * 2.5;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw the "Artwork Vector" (Floating above/within)
      const targetX = centerX + targetPoint[0] * 12;
      const targetY = centerY + targetPoint[1] * 12;
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#e11d48';
      ctx.fillStyle = '#e11d48'; // Cardinal Red
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pulse ring for the artwork
      ctx.strokeStyle = `rgba(225, 29, 72, ${0.5 + Math.sin(time * 3) * 0.3})`;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 12 + Math.sin(time * 3) * 4, 0, Math.PI * 2);
      ctx.stroke();

      if (foundPoint) {
        const fx = centerX + foundPoint[0] * 12;
        const fy = centerY + foundPoint[1] * 12;
        
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(fx, fy);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#38bdf8';
        ctx.beginPath();
        ctx.arc(fx, fy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPrivateKey, targetPoint, foundPoint]);

  const sealProvenance = async () => {
    setIsSolving(true);
    setFoundPoint(null);
    await new Promise(r => setTimeout(r, 1200));

    if (isPrivateKey) {
      const solved = targetPoint.map(v => Math.round(v / 3.75) * 3.75);
      setFoundPoint(solved);
      setAiInsight("Aleph0 Sealed: Using the Private Basis, the artwork's fingerprint was mapped to the nearest hyper-lattice coordinate in milliseconds. Authentication successful.");
    } else {
      const solved = targetPoint.map(v => Math.round(v / 3.75) * 3.75 + (Math.random() - 0.5) * 12);
      setFoundPoint(solved);
      setAiInsight("Public Challenge: Without the correct basis, the navigation drift in 500 dimensions is too high to find the exact signature. Attack rejected.");
    }
    setIsSolving(false);
  };

  const updateTarget = (idx: number, val: number) => {
    const next = [...targetPoint];
    next[idx] = val;
    setTargetPoint(next);
  };

  return (
    <div className="flex h-screen w-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* SIDEBAR: Controls & Branding */}
      <aside className="w-80 flex-shrink-0 border-r border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl p-6 flex flex-col gap-6 z-20 overflow-y-auto">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <ShieldCheck className="text-red-500 w-6 h-6" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-white">Cardinal Aleph</h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Quantum-Resistant Art Ledger</p>
        </div>

        <nav className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Network Layers</p>
          {[
            { id: 'aleph0', label: 'Aleph0: Permanent', icon: Link2, desc: 'Immutability Layer' },
            { id: 'aleph1', label: 'Aleph1: Value', icon: Layers, desc: 'Trading Layer' },
            { id: 'aleph3', label: 'Aleph3: Asset', icon: Globe, desc: 'Storage Layer' },
          ].map(layer => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                activeLayer === layer.id 
                ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                : 'border-transparent hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <layer.icon size={20} />
              <div>
                <p className="text-xs font-bold">{layer.label}</p>
                <p className="text-[10px] opacity-60">{layer.desc}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className="space-y-4 pt-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex justify-between">
            Encryption Mode
            <span className={isPrivateKey ? 'text-emerald-400' : 'text-rose-400'}>{isPrivateKey ? 'Authorized' : 'Public'}</span>
          </label>
          <button 
            onClick={() => { setIsPrivateKey(!isPrivateKey); setFoundPoint(null); }}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-between font-bold transition-all ${
              isPrivateKey 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            {isPrivateKey ? <Lock size={16} /> : <Unlock size={16} />}
            <span className="text-xs uppercase tracking-tight">Access Key: {isPrivateKey ? 'Private' : 'Public'}</span>
            <RefreshCw size={14} className={isSolving ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Art Fingerprint Vectors</label>
          <div className="space-y-4 pr-1">
            {dimensionLabels.map((label, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{label}</span>
                  <span className="text-white">{targetPoint[idx]?.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="20" 
                  step="0.1"
                  value={targetPoint[idx]}
                  onChange={(e) => updateTarget(idx, parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            ))}
            <div className="p-3 border border-dashed border-slate-800 rounded-xl text-[9px] text-center text-slate-600 font-mono">
              + 488 DILITHIUM DIMENSIONS ENCRYPTED
            </div>
          </div>
        </div>

        <button 
          onClick={sealProvenance}
          disabled={isSolving}
          className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 rounded-xl font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-900/20"
        >
          {isSolving ? 'Calculating Lattice...' : 'Seal Art Provenance'}
          <Zap size={18} className={isSolving ? 'animate-pulse text-yellow-300' : ''} />
        </button>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col relative">
        {/* Header bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <p className="text-xs font-mono text-slate-400">
                Lattice Node: <span className="text-white">Cardinal-Aleph-Mainnet-v2.5</span>
              </p>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <p className="text-xs font-mono text-slate-400">
              Vector Root: <span className="text-white">0x{targetPoint.slice(0, 4).map(v => Math.abs(Math.floor(v)).toString(16)).join('')}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center">
                    <Palette size={14} className="text-slate-500" />
                  </div>
                ))}
             </div>
             <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><Maximize2 size={18} /></button>
          </div>
        </header>

        {/* Content Window */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]">
          {activeLayer === 'aleph0' && (
            <div className="absolute inset-0 flex flex-col">
              <div className="p-12 pb-0 flex justify-between items-start">
                 <div className="max-w-md">
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-2">The Dilithium Bridge</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      This 500-dimensional lattice connects the physical artwork to the Aleph0 ledger. 
                      Navigation is only possible with an authorized basis (The Private Key).
                    </p>
                 </div>
                 <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4">
                    <ScanEye className="text-emerald-400" />
                    <div>
                       <p className="text-[10px] font-bold text-emerald-500 uppercase">Status</p>
                       <p className="text-sm font-mono text-emerald-200">Active Linkage</p>
                    </div>
                 </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-8">
                <canvas 
                  ref={canvasRef} 
                  width={1000} 
                  height={600} 
                  className="w-full h-full max-h-[70vh] cursor-crosshair drop-shadow-[0_0_50px_rgba(225,29,72,0.1)]"
                />
              </div>
            </div>
          )}

          {activeLayer === 'aleph1' && (
            <div className="absolute inset-0 overflow-y-auto p-12 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-full mb-4">
                   <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Aleph1: Market Telemetry</h2>
                   <p className="text-sm text-slate-400">Tradeable certificates synchronized across the global network.</p>
                </div>
                {dimensionLabels.map((label, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-red-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-6">
                       <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest">{label}</h4>
                       <Activity size={16} className="text-slate-700 group-hover:text-red-500 transition-colors" />
                    </div>
                    <div className="flex items-end gap-3 h-24">
                       {Array.from({length: 12}).map((_, i) => (
                         <div 
                           key={i} 
                           className="flex-1 bg-red-600/10 rounded-t-sm group-hover:bg-red-600/30 transition-all"
                           style={{ height: `${20 + Math.random() * 80}%` }}
                         ></div>
                       ))}
                    </div>
                    <div className="mt-4 flex justify-between font-mono text-[10px]">
                       <span className="text-slate-600">OFFSET</span>
                       <span className="text-white">{targetPoint[idx].toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeLayer === 'aleph3' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-8">
              <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center border border-red-500/30 animate-pulse">
                <Globe size={48} className="text-red-500" />
              </div>
              <div className="max-w-2xl space-y-4">
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">IPFS Permanence</h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                  High-resolution imaging, X-ray spectra, and conservation reports are fragmented and stored 
                  globally across the Cardinal IPFS cluster. Cryptographic hashes in Aleph0 ensure 
                  every byte remains authentic for centuries.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 w-full max-w-4xl pt-8">
                {[
                  { icon: FileText, title: "Conservation", desc: "PDF documentation & expert reports" },
                  { icon: ScanEye, title: "Imaging", desc: "X-Ray, IR, and 8K photogrammetry" },
                  { icon: ShieldCheck, title: "Integrity", desc: "NIST-Level 5 SHA-3 verification" }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:bg-slate-800 transition-colors">
                    <item.icon className="mx-auto mb-4 text-red-500" size={32} />
                    <h5 className="font-black text-white text-xs uppercase tracking-widest mb-2">{item.title}</h5>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER INSIGHTS */}
        <footer className="h-28 bg-[#020617] border-t border-slate-800 px-8 flex items-center justify-between z-10">
          <div className="flex gap-6 items-center flex-1">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${isSolving ? 'border-yellow-500/50 animate-spin-slow' : 'border-slate-800'}`}>
              <Cpu className={`text-slate-500 ${isSolving ? 'text-yellow-500' : ''}`} size={24} />
            </div>
            <div className="max-w-3xl">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">Quantum Network Pulse</p>
              <p className="text-sm font-medium text-slate-300 italic">
                {isSolving ? "Traversing 500-dimensional lattice points..." : (aiInsight || "System ready. Adjust art fingerprint vectors to test navigation integrity.")}
              </p>
            </div>
          </div>
          <div className="flex gap-12 items-center text-right">
             <div className="hidden lg:block">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Authenticity Probability</p>
                <div className="flex gap-1">
                   {Array.from({length: 10}).map((_, i) => (
                     <div 
                      key={i} 
                      className={`h-3 w-6 rounded-sm ${isPrivateKey && i < 9 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                     ></div>
                   ))}
                </div>
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Security Score</p>
                <p className="text-2xl font-black text-white">{isPrivateKey ? '99.9%' : '0.01%'}</p>
             </div>
          </div>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #020617;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}


