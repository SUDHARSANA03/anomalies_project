import React from 'react';
import { Target, CheckCircle2, Shield, Activity, Database, Layers } from 'lucide-react';

export const Footer: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <footer className={`w-full text-xs py-14 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors duration-300 ${
      isDark
        ? 'bg-[#040810] border-t border-[#1e3a5f] text-[#64748b]'
        : 'bg-slate-100/90 border-t border-slate-200/80 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
        
        {/* Brand Col */}
        <div className="space-y-3.5 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isDark 
                ? 'bg-[#070f1e] border-[#00f0ff]/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]' 
                : 'bg-sky-50 border-sky-200'
            }`}>
              <Target className={`w-4 h-4 ${isDark ? 'text-[#00f0ff]' : 'text-sky-600'}`} />
            </div>
            <div className="flex items-center gap-1 font-black text-base tracking-tight text-white">
              <span>HYPERSENSE</span>
              <span className="bg-gradient-to-r from-[#00f0ff] to-[#00f5a0] bg-clip-text text-transparent">AI</span>
            </div>
          </div>
          <p className={`${isDark ? 'text-[#94a3b8]' : 'text-slate-500'} leading-relaxed text-xs`}>
            Autonomous spectral anomaly intelligence platform. Real-time Reed-Xiaoli (RX) Mahalanobis distance background modeling, 200+ channel airborne tensor processing, and sub-pixel material characterization.
          </p>
          <div className={`flex items-center gap-2 pt-1 text-[11px] font-mono ${
            isDark ? 'text-[#00f5a0]' : 'text-emerald-700'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-ping ${isDark ? 'bg-[#00f5a0]' : 'bg-emerald-500'}`}></span>
            <span>FastAPI & RX Algorithm Engine Operational</span>
          </div>
        </div>

        {/* Spectral Core Capabilities */}
        <div>
          <h4 className={`font-semibold uppercase tracking-wider text-[11px] font-mono mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Spectral Core Capabilities
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#00f0ff]' : 'text-sky-600'}`} />
              <span>AVIRIS & ROSIS 200+ Band Ingestion</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#00f0ff]' : 'text-sky-600'}`} />
              <span>Reed-Xiaoli (RX) Mahalanobis Metric</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#00f0ff]' : 'text-sky-600'}`} />
              <span>OpenCV 3×3 Morphology Noise Suppression</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#00f0ff]' : 'text-sky-600'}`} />
              <span>Unsupervised K-Means Land Segmentation</span>
            </li>
          </ul>
        </div>

        {/* Console Modules */}
        <div>
          <h4 className={`font-semibold uppercase tracking-wider text-[11px] font-mono mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Autonomous Modules
          </h4>
          <ul className="space-y-2 text-xs">
            <li><a href="/console" className={`transition-colors ${isDark ? 'hover:text-[#00f0ff] text-[#94a3b8]' : 'hover:text-sky-700'}`}>01 / Cube Studio (AVIRIS Data)</a></li>
            <li><a href="/console" className={`transition-colors ${isDark ? 'hover:text-[#00f0ff] text-[#94a3b8]' : 'hover:text-sky-700'}`}>02 / RX Anomaly Radar (Live Demo)</a></li>
            <li><a href="/console" className={`transition-colors ${isDark ? 'hover:text-[#00f0ff] text-[#94a3b8]' : 'hover:text-sky-700'}`}>03 / Spatial Refinement & Boxes</a></li>
            <li><a href="/console" className={`transition-colors ${isDark ? 'hover:text-[#00f0ff] text-[#94a3b8]' : 'hover:text-sky-700'}`}>04 / Continuous Spectral Profiler</a></li>
            <li><a href="/console" className={`transition-colors ${isDark ? 'hover:text-[#00f0ff] text-[#94a3b8]' : 'hover:text-sky-700'}`}>05 / Scene Segmentation</a></li>
            <li><a href="/console" className={`transition-colors ${isDark ? 'hover:text-[#00f0ff] text-[#94a3b8]' : 'hover:text-sky-700'}`}>06 / Mission Dossier Export</a></li>
          </ul>
        </div>

        {/* Technical Architecture */}
        <div>
          <h4 className={`font-semibold uppercase tracking-wider text-[11px] font-mono mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Sensor & Model Engine
          </h4>
          <p className={`${isDark ? 'text-[#94a3b8]' : 'text-slate-500'} mb-3 text-xs leading-relaxed`}>
            Pushbroom radiometric pipeline adhering to NASA JPL AVIRIS and IEEE GRSS benchmark standards.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 border rounded-md text-[10px] font-mono ${
              isDark 
                ? 'bg-[#070f1e] border-[#1e3a5f] text-white' 
                : 'bg-white border-slate-200 text-slate-700'
            }`}>FastAPI v0.110</span>
            <span className={`px-2.5 py-1 border rounded-md text-[10px] font-mono ${
              isDark 
                ? 'bg-[#070f1e] border-[#1e3a5f] text-[#00f0ff]' 
                : 'bg-white border-slate-200 text-slate-700'
            }`}>RX Covariance Inversion</span>
            <span className={`px-2.5 py-1 border rounded-md text-[10px] font-mono ${
              isDark 
                ? 'bg-[#070f1e] border-[#1e3a5f] text-[#00f5a0]' 
                : 'bg-white border-slate-200 text-slate-700'
            }`}>OpenCV Morphology</span>
          </div>
        </div>

      </div>

      <div className={`max-w-7xl mx-auto mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono ${
        isDark 
          ? 'border-[#1e3a5f] text-[#64748b]' 
          : 'border-slate-200/80 text-slate-500'
      }`}>
        <p>© 2026 HyperSense AI Inc. All rights reserved. Hyperspectral Anomaly Detection & Threat Mapping.</p>
        <div className="flex items-center gap-4">
          <a href="#" className={`transition-colors ${isDark ? 'hover:text-[#00f0ff]' : 'hover:text-slate-800'}`}>Privacy Policy</a>
          <span>•</span>
          <a href="#" className={`transition-colors ${isDark ? 'hover:text-[#00f0ff]' : 'hover:text-slate-800'}`}>IEEE GRSS Benchmarks</a>
          <span>•</span>
          <a href="#" className={`transition-colors ${isDark ? 'hover:text-[#00f0ff]' : 'hover:text-slate-800'}`}>System Telemetry</a>
        </div>
      </div>
    </footer>
  );
};
