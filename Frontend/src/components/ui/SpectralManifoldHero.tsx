import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, RotateCw, Activity, Layers } from 'lucide-react';
import manifoldCutout from '../../assets/manifold_surface_only.png';

export const SpectralManifoldHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState({ rx: 0, ry: 0 });
  const [azimuth, setAzimuth] = useState(142.6);

  // Subtle 3D mouse parallax interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const rx = (dy / (window.innerHeight / 2)) * -5;
      const ry = (dx / (window.innerWidth / 2)) * 5;
      setCoords({ rx, ry });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Continuous azimuth telemetry rotation
  useEffect(() => {
    const azInterval = setInterval(() => {
      setAzimuth(prev => Number(((prev + 0.8) % 360).toFixed(1)));
    }, 100);
    return () => clearInterval(azInterval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] sm:h-[560px] lg:h-[620px] flex items-center justify-center select-none"
      style={{ perspective: '1400px' }}
    >
      {/* 3D Tilted Parent Stage */}
      <div 
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${coords.rx}deg) rotateY(${coords.ry}deg)`,
        }}
      >
        {/* Background ambient star/dust particles */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ transform: 'translateZ(-100px)' }}>
          {[...Array(24)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute bg-[#00f0ff] rounded-full animate-pulse"
              style={{
                width: (i % 3) + 2 + 'px',
                height: (i % 3) + 2 + 'px',
                top: `${(i * 19) % 100}%`,
                left: `${(i * 27) % 100}%`,
                opacity: 0.25 + ((i % 4) * 0.12),
                boxShadow: '0 0 10px #00f0ff',
              }}
            />
          ))}
        </div>

        {/* ─── REAR RADAR ARC: GLIDING BOTTOM TO UP (BEHIND 3D OBJECT: translateZ -50px) ─── */}
        <motion.div
          animate={{
            top: ['82%', '14%', '82%'],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute left-1/2 -translate-x-1/2 w-[115%] max-w-[580px] pointer-events-none z-10"
          style={{
            transform: 'rotateX(72deg) scale(1.18) translateZ(-50px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Back half of the circular radar ring */}
          <div className="w-full h-44 rounded-full border border-[#00f0ff]/35 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-center animate-[spin_18s_linear_infinite]">
            <div className="w-[96%] h-[90%] rounded-full border border-[#00f5a0]/25" />
          </div>
        </motion.div>

        {/* ─── CENTRAL 3D VOLUMETRIC MANIFOLD: 360-DEGREE ROTATING WITH ISOMETRIC FULL-DEPTH ─── */}
        <div 
          className="relative z-20 flex items-center justify-center"
          style={{ 
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 3D Isometric Pitch Base: Ensures the surface is clearly volumetric throughout 360 degrees */}
          <div
            className="relative"
            style={{
              transform: 'rotateX(18deg) rotateZ(-4deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Continuous 360-Degree Rotating Volumetric Body */}
            <motion.div
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="relative w-[340px] sm:w-[420px] lg:w-[460px] aspect-square flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Primary Front Facet (Cut 3D surface with zero corner space) */}
              <div 
                className="absolute inset-0 flex items-center justify-center filter drop-shadow-[0_15px_35px_rgba(199,125,255,0.4)] drop-shadow-[0_0_25px_rgba(0,245,212,0.25)]"
                style={{
                  transform: 'translateZ(18px)',
                }}
              >
                <img 
                  src={manifoldCutout} 
                  alt="3D Hyperspectral Spectral Manifold Cutout (360 Degree Rotating)" 
                  className="w-full h-full object-contain filter contrast-115 brightness-110"
                />
              </div>

              {/* Cross-Facet 1 (+40 degrees): Preserves volumetric width during 90-degree edge transitions */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-65 filter drop-shadow-[0_10px_20px_rgba(199,125,255,0.2)]"
                style={{
                  transform: 'rotateY(40deg) scale(0.97)',
                }}
              >
                <img 
                  src={manifoldCutout} 
                  alt="3D Volumetric Depth Slice" 
                  className="w-full h-full object-contain filter hue-rotate-10 brightness-100"
                />
              </div>

              {/* Cross-Facet 2 (-40 degrees): Cross-stabilizes opposite angle */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-65 filter drop-shadow-[0_10px_20px_rgba(0,245,212,0.2)]"
                style={{
                  transform: 'rotateY(-40deg) scale(0.97)',
                }}
              >
                <img 
                  src={manifoldCutout} 
                  alt="3D Volumetric Cross Depth Slice" 
                  className="w-full h-full object-contain filter hue-rotate-20 brightness-100"
                />
              </div>

              {/* Primary Rear Facet (Mirrored depth layer for true 360-degree volumetric appearance) */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-90 filter drop-shadow-[0_12px_28px_rgba(199,125,255,0.25)]"
                style={{
                  transform: 'translateZ(-18px) scaleX(-1) rotateY(180deg)',
                }}
              >
                <img 
                  src={manifoldCutout} 
                  alt="3D Hyperspectral Spectral Manifold Rear Facet" 
                  className="w-full h-full object-contain filter hue-rotate-15 brightness-95"
                />
              </div>

              {/* Holographic 3D Ground Reticle Base pinned underneath */}
              <div 
                className="absolute -bottom-8 w-4/5 h-20 rounded-full border border-[#00f0ff]/30 bg-gradient-to-t from-[#00f0ff]/15 to-transparent pointer-events-none"
                style={{
                  transform: 'rotateX(82deg) translateZ(-60px)',
                  filter: 'blur(1.5px)',
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* ─── FRONT RADAR ARC: GLIDING BOTTOM TO UP OVERLAPPED (IN FRONT OF 3D OBJECT: translateZ +50px) ─── */}
        <motion.div
          animate={{
            top: ['82%', '14%', '82%'],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute left-1/2 -translate-x-1/2 w-[115%] max-w-[580px] pointer-events-none z-30"
          style={{
            transform: 'rotateX(72deg) scale(1.18) translateZ(50px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Active Front Sweeping Radar Scanner Ring (Physically overlaps the rotating 3D surface) */}
          <div className="relative w-full h-44 rounded-full border-2 border-[#00f0ff]/80 shadow-[0_0_35px_rgba(0,240,255,0.7)] flex items-center justify-center animate-[spin_10s_linear_infinite]">
            {/* Cardinal Radar Beacons */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#00f0ff] shadow-[0_0_20px_#00f0ff] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-[#00f5a0] shadow-[0_0_20px_#00f5a0]" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#38bdf8] shadow-[0_0_20px_#38bdf8]" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-[#00f5d4] shadow-[0_0_20px_#00f5d4]" />

            {/* Continuous Sweeping Beam circulating around that plane */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="w-1/2 h-full origin-right bg-gradient-to-l from-[#00f0ff]/45 via-[#00f5a0]/20 to-transparent animate-[spin_2.8s_linear_infinite]" />
            </div>

            {/* Inner Neon Orbit Ring */}
            <div className="w-[94%] h-[84%] rounded-full border border-[#00f0ff]/70 animate-pulse" />
          </div>

          {/* Sweeping Laser Scan Line with glow */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_20px_#00f0ff]" />
        </motion.div>

        {/* ─── TELEMETRY OVERLAY BADGES (FLOATING IN 3D SPACE) ─── */}
        <div 
          className="absolute top-4 left-4 z-40 flex items-center gap-2 font-mono text-xs pointer-events-none"
          style={{ transform: 'translateZ(70px)' }}
        >
          <div className="flex items-center gap-2 bg-[#070f1e]/90 px-3 py-1.5 rounded-xl border border-[#1e3a5f] backdrop-blur-md shadow-xl text-[#00f0ff]">
            <Radio className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
            <span className="font-bold tracking-wider">360° VOLUMETRIC MANIFOLD</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-[#070f1e]/90 px-2.5 py-1.5 rounded-xl border border-[#1e3a5f] backdrop-blur-md text-[#64748b]">
            <RotateCw className="w-3 h-3 text-[#00f0ff] animate-spin" />
            <span>AZ {azimuth}°</span>
          </div>
        </div>

        <div 
          className="absolute bottom-4 right-4 z-40 hidden sm:flex flex-col gap-1.5 font-mono text-right pointer-events-none"
          style={{ transform: 'translateZ(70px)' }}
        >
          <div className="p-2.5 rounded-xl bg-[#070f1e]/90 border border-[#1e3a5f] shadow-xl backdrop-blur-md">
            <div className="text-[9px] text-[#64748b] uppercase tracking-wider">RADAR OVERLAP SCAN</div>
            <div className="text-xs font-bold text-[#00f5a0] flex items-center justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-ping" />
              BOTTOM ⇄ TOP BOUND
            </div>
          </div>
        </div>

        <div 
          className="absolute bottom-4 left-4 z-40 hidden sm:flex flex-col gap-1.5 font-mono text-left pointer-events-none"
          style={{ transform: 'translateZ(70px)' }}
        >
          <div className="p-2.5 rounded-xl bg-[#070f1e]/90 border border-[#1e3a5f] shadow-xl backdrop-blur-md">
            <div className="text-[9px] text-[#64748b] uppercase tracking-wider">SPECTRAL BANDWIDTH</div>
            <div className="text-xs font-bold text-[#00f0ff]">400nm – 2500nm &bull; 200 CH</div>
          </div>
        </div>

      </div>
    </div>
  );
};
