import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, CheckCircle2, ChevronRight, Play, Pause, Compass, ArrowRight } from 'lucide-react';
import referralImage2Clean from '../../assets/referral_image_2_clean.png';
import referralImage2Raw from '../../assets/referral_image_2.png';

interface OpticalPart {
  id: string;
  letter: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  role: string;
  coords: { x: number; y: number }; // percentage on image
  badgeColor: string;
}

const OPTICAL_PARTS: OpticalPart[] = [
  {
    id: 'spatial-scene',
    letter: '(a)',
    name: 'Spatial Scene',
    shortDesc: 'Ground Swath Field of View (x, y)',
    fullDesc: 'The ground target terrain sampled sequentially in the cross-track scan direction. Spatial coordinates (x, y) map each instantaneous geometric field of view with ground sampling distance (GSD).',
    role: 'Incident Earth Radiance Collection',
    coords: { x: 20, y: 82 },
    badgeColor: '#38bdf8',
  },
  {
    id: 'imaging-lens',
    letter: '(b)',
    name: 'Imaging Lens',
    shortDesc: 'Fore-Optics Objective Lens',
    fullDesc: 'Primary objective optical element gathering incident electromagnetic radiation from the spatial scene and focusing the optical field directly onto the entrance slit plane with minimal chromatic aberration.',
    role: 'Primary Optical Focusing',
    coords: { x: 31, y: 68 },
    badgeColor: '#4ade80',
  },
  {
    id: 'narrow-slit',
    letter: '(c)',
    name: 'Narrow Slit',
    shortDesc: 'Spatial Sampling Entrance Aperture',
    fullDesc: 'Precision physical slit aperture defining the instantaneous line field of view (one spatial line of pixels at time t). Rejects out-of-swath ambient photons to prevent spatial crosstalk.',
    role: 'Spatial Line Filtering',
    coords: { x: 38, y: 58 },
    badgeColor: '#fbbf24',
  },
  {
    id: 'collimating-lens',
    letter: '(d)',
    name: 'Collimating Lens',
    shortDesc: 'Ray Alignment Collimator',
    fullDesc: 'Converts diverging ray fans emanating from the narrow slit aperture into a parallel collimated beam, ensuring uniform angles of incidence across the dispersive grating prism.',
    role: 'Beam Parallelization',
    coords: { x: 46, y: 56 },
    badgeColor: '#fb923c',
  },
  {
    id: 'pgp-assembly',
    letter: '(e)',
    name: 'Prism-Grating-Prism (PGP)',
    shortDesc: 'Direct-Sight Dispersive Element',
    fullDesc: 'Volume phase holographic transmission grating sandwiched between high-index prisms. Disperses the collimated polychromatic light into continuous spectral wavebands (λ1 to λ7) without angular beam deviation.',
    role: 'Spectral Band Dispersion',
    coords: { x: 54, y: 52 },
    badgeColor: '#c084fc',
  },
  {
    id: 'focusing-lens',
    letter: '(f)',
    name: 'Focusing Lens',
    shortDesc: 'Camera Imaging Array Objective',
    fullDesc: 'High-numerical-aperture achromatic camera lens that re-focuses the dispersed spectral beams onto the two-dimensional focal plane array detector matrix.',
    role: 'Spectral Line Re-imaging',
    coords: { x: 64, y: 46 },
    badgeColor: '#60a5fa',
  },
  {
    id: 'spatio-spectral-snapshot',
    letter: '(g)',
    name: 'Spatio-Spectral Snapshot',
    shortDesc: '2D Detector Matrix (x vs λ)',
    fullDesc: 'Instantaneous 2D focal plane array (FPA) exposure where horizontal detector pixels record spatial position x and vertical detector rows record wavelength channels λ simultaneously.',
    role: 'Simultaneous 2D Spatial-Spectral Capture',
    coords: { x: 71, y: 34 },
    badgeColor: '#f472b6',
  },
  {
    id: 'hyper-data-cube',
    letter: '(h)',
    name: 'Hyper Data Cube',
    shortDesc: '3D Radiance Tensor (x, y, λ)',
    fullDesc: 'Synthesized 3D hyperspectral datacube constructed by integrating sequential pushbroom snapshots along the scan motion axis y. Contains 200+ contiguous spectral channels ready for Reed-Xiaoli anomaly detection.',
    role: '3D Volumetric Tensor Reconstruction',
    coords: { x: 80, y: 18 },
    badgeColor: '#a855f7',
  },
];

export const OpticalPathSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(0);
  const [useCleanImage, setUseCleanImage] = useState(true);
  const [isAutoTour, setIsAutoTour] = useState(true);

  // ─── SCROLL-LINKED DYNAMIC HORIZONTAL TRANSLATION (NOT STATIC ON SCROLL) ───
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // As the user scrolls down, the image translates smoothly from left (-140px) to right (+80px)
  const imageX = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [-110, 0, 70]);
  const imageRotate = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [-3, 0, 2.5]);
  const imageScale = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0.94, 1, 0.97]);

  // ─── SMOOTH SEQUENTIAL PART LABELING TOUR (a -> h) ───
  useEffect(() => {
    if (!isAutoTour) return;
    const interval = setInterval(() => {
      setSelectedPartIndex(prev => (prev + 1) % OPTICAL_PARTS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isAutoTour]);

  const activePart = OPTICAL_PARTS[selectedPartIndex];

  return (
    <section 
      ref={sectionRef} 
      className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-[#00f5a0]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-[#1e3a5f]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-xs font-mono text-[#00f0ff] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#00f5a0]" />
            <span>SECTION 02 &bull; OPTICAL SYSTEM & PUSHBROOM SENSOR ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
            Sub-Pixel Radiometric Acquisition Chain
          </h2>
          <p className="text-sm sm:text-base text-[#b9afcb] max-w-3xl leading-relaxed">
            As you scroll, the optical diagram travels smoothly from left to right through the focal path. Light from the ground swath passes through the objective lens, slit aperture, collimating optics, and prism-grating-prism (PGP) element to project a continuous 2D slice onto the sensor array, building the 3D hyper-data cube line by line.
          </p>
        </div>

        {/* View Controls & Auto Tour Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setIsAutoTour(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070f1e] border border-[#1e3a5f] text-xs font-mono font-bold text-[#00f0ff] hover:border-[#00f0ff] transition-all cursor-pointer"
          >
            {isAutoTour ? <Pause className="w-3 h-3 text-[#00f5a0]" /> : <Play className="w-3 h-3 text-[#00f0ff]" />}
            <span>{isAutoTour ? 'Auto Tour: ON' : 'Auto Tour: PAUSED'}</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#070f1e] border border-[#1e3a5f]">
            <button
              onClick={() => setUseCleanImage(true)}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                useCleanImage
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#00f5a0] text-[#040810] shadow-lg shadow-[#00f0ff]/25 font-black'
                  : 'text-[#64748b] hover:text-white'
              }`}
            >
              Obsidian HUD
            </button>
            <button
              onClick={() => setUseCleanImage(false)}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                !useCleanImage
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#00f5a0] text-[#040810] shadow-lg shadow-[#00f0ff]/25 font-black'
                  : 'text-[#64748b] hover:text-white'
              }`}
            >
              Blueprint
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── CORNER DOCKED IMAGE: NOT STATIC, CONTINUOUSLY TRAVELING LEFT TO RIGHT ON SCROLL ─── */}
        <motion.div
          style={{
            x: imageX,
            rotateZ: imageRotate,
            scale: imageScale,
          }}
          className="lg:col-span-7 xl:col-span-8 relative rounded-3xl border border-[#1e3a5f] bg-gradient-to-b from-[#0a1526]/95 via-[#070f1e]/90 to-[#040810]/95 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-cyan-950/30 overflow-hidden"
        >
          {/* Viewport Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e3a5f] text-xs font-mono">
            <div className="flex items-center gap-2 text-[#00f0ff]">
              <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-ping" />
              <span className="font-bold">DYNAMIC OPTICAL BENCH &bull; SCROLL RESPONSIVE (LEFT ➔ RIGHT)</span>
            </div>
            <div className="text-[#64748b] text-[11px] hidden sm:block">
              STEP {selectedPartIndex + 1} OF 8 &bull; {activePart.name}
            </div>
          </div>

          {/* Diagram Container with Smooth Labeled Callout Pins (NO RADAR) */}
          <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#040810] border border-[#1e3a5f] overflow-hidden flex items-center justify-center p-2 sm:p-4 shadow-inner">
            {/* Subtle Grid Reticle */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* The 2nd Referral Image */}
            <img
              src={useCleanImage ? referralImage2Clean : referralImage2Raw}
              alt="Hyperspectral Pushbroom Sensor Optical Path Architecture"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300"
            />

            {/* ─── SMOOTH SEQUENTIAL CALLOUT LABELS PINNED ON THE PARTS (NO RADAR) ─── */}
            {OPTICAL_PARTS.map((part, index) => {
              const isSelected = selectedPartIndex === index;
              return (
                <div
                  key={part.id}
                  style={{
                    left: `${part.coords.x}%`,
                    top: `${part.coords.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  <button
                    onClick={() => {
                      setIsAutoTour(false);
                      setSelectedPartIndex(index);
                    }}
                    onMouseEnter={() => {
                      setIsAutoTour(false);
                      setSelectedPartIndex(index);
                    }}
                    className="relative group cursor-pointer focus:outline-none"
                    aria-label={`Inspect ${part.name}`}
                  >
                    {/* Glowing pulse ring on currently active part */}
                    {isSelected && (
                      <span 
                        className="absolute inset-0 -m-3 rounded-full animate-ping opacity-80"
                        style={{ backgroundColor: part.badgeColor }}
                      />
                    )}

                    {/* Smooth Pill Badge */}
                    <motion.div 
                      animate={{
                        scale: isSelected ? 1.25 : 1,
                        y: isSelected ? -4 : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-black tracking-tight border flex items-center gap-1.5 transition-colors duration-300 shadow-xl ${
                        isSelected 
                          ? 'text-white ring-2 ring-white/50' 
                          : 'bg-[#0c0a14]/90 text-white/90 hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: isSelected ? part.badgeColor : '#0c0a14',
                        borderColor: part.badgeColor,
                        boxShadow: isSelected ? `0 0 20px ${part.badgeColor}` : 'none',
                      }}
                    >
                      <span>{part.letter}</span>
                      <span className="text-[10px] font-semibold">{part.name.split(' ')[0]}</span>
                    </motion.div>
                  </button>
                </div>
              );
            })}

            {/* Smooth Tracking Callout Card in corner */}
            <div className="absolute top-3 left-3 font-mono text-[10px] text-[#00f5d4] bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#3a2e52] flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse" />
              <span>ACTIVE OPTIC: {activePart.letter} {activePart.name.toUpperCase()}</span>
            </div>

            {/* Bottom Swath Bar */}
            <div className="absolute bottom-3 right-3 font-mono text-[10px] text-[#8577a0] bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-[#3a2e52] pointer-events-none">
              PUSHBROOM SCAN DIRECTION: Y-AXIS (v_flight)
            </div>
          </div>

          {/* Dynamic Active Part Banner below diagram */}
          <div className="mt-4 p-4 rounded-2xl bg-[#0c0a14] border border-[#2a2138] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                key={activePart.id}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-11 h-11 rounded-xl flex items-center justify-center font-mono font-black text-sm text-white shrink-0 shadow-lg"
                style={{ backgroundColor: activePart.badgeColor }}
              >
                {activePart.letter}
              </motion.div>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>{activePart.name}</span>
                  <span className="text-xs font-mono text-[#8577a0] font-normal">[{activePart.role}]</span>
                </div>
                <div className="text-xs text-[#b9afcb]">{activePart.shortDesc}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPartIndex(prev => (prev - 1 + OPTICAL_PARTS.length) % OPTICAL_PARTS.length)}
                className="px-2.5 py-1.5 rounded-lg bg-[#070f1e] border border-[#1e3a5f] text-xs font-mono text-[#94a3b8] hover:text-white hover:border-[#00f0ff] cursor-pointer"
              >
                Prev
              </button>
              <button
                onClick={() => setSelectedPartIndex(prev => (prev + 1) % OPTICAL_PARTS.length)}
                className="px-2.5 py-1.5 rounded-lg bg-[#070f1e] border border-[#1e3a5f] text-xs font-mono text-[#00f0ff] hover:text-white hover:border-[#00f0ff] cursor-pointer"
              >
                Next ({(selectedPartIndex + 1) % OPTICAL_PARTS.length + 1}/8)
              </button>
            </div>
          </div>
        </motion.div>

        {/* ─── RIGHT ACCORDION PANEL: SMOOTHLY HIGHLIGHTING ALL 8 PARTS ─── */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-2.5">
          <div className="p-4 rounded-2xl bg-[#070f1e] border border-[#1e3a5f] mb-1">
            <div className="text-xs font-mono font-bold text-[#00f0ff] uppercase tracking-wider mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00f0ff]" />
              <span>LABELED SYSTEM COMPONENTS (a - h)</span>
            </div>
            <p className="text-xs text-[#64748b]">
              Photon travel sequence through the optical bench. Click any component to jump directly.
            </p>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {OPTICAL_PARTS.map((part, index) => {
              const isSelected = selectedPartIndex === index;
              return (
                <div
                  key={part.id}
                  onClick={() => {
                    setIsAutoTour(false);
                    setSelectedPartIndex(index);
                  }}
                  className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-[#00f0ff] bg-[#0c182b] shadow-lg shadow-[#00f0ff]/15 translate-x-1.5'
                      : 'border-[#1e3a5f] bg-[#070f1e]/80 hover:border-[#38bdf8] hover:bg-[#0c182b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="px-2 py-0.5 rounded font-mono font-bold text-xs text-white"
                        style={{ backgroundColor: part.badgeColor }}
                      >
                        {part.letter}
                      </span>
                      <span className="font-bold text-sm text-white">{part.name}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#00f5d4]" />
                    )}
                  </div>

                  <div className="text-xs text-[#8577a0] font-mono mb-2">
                    {part.role}
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-[#b9afcb] leading-relaxed pt-2 border-t border-[#2a2138]"
                    >
                      {part.fullDesc}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
