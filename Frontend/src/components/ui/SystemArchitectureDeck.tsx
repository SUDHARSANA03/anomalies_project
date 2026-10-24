import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Target, 
  Scan, 
  Activity, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  CreditCard,
  Zap,
  CheckCircle2,
  Sliders,
  FolderCheck,
  Lock,
  Play
} from 'lucide-react';
import { ViewId } from '../../data';
import { useSession } from '../../context/SessionContext';

interface ArchitectureModule {
  id: ViewId;
  indexStr: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  technicalDetails: string[];
  algorithm: string;
  badge: string;
  accentColor: string;
  icon: React.ReactNode;
  datasetNote?: string;
}

const MODULES: ArchitectureModule[] = [
  {
    id: 'ingest',
    indexStr: '01',
    number: 1,
    title: 'CUBE STUDIO',
    subtitle: 'Hyperspectral Ingestion & Calibration',
    description: 'Ingest 200+ contiguous channel airborne cubes (Indian Pines, Salinas, Pavia, CAVE multispectral, custom .mat/.hdr), synthesize false-color composites, and inspect spectral band distributions.',
    technicalDetails: [
      'AVIRIS / ROSIS sensor header parsing & spectral wavelength mapping',
      'Interactive 3-channel RGB band assignment (NIR, Red-Edge, Green)',
      'Zero-mean, unit-variance radiometric data normalization',
      'Pine_Dataset (145×145×200 bands) loaded & validated',
    ],
    algorithm: 'Tensor Calibration: X ∈ ℝ^(H×W×B)',
    badge: 'INGESTION ENGINE',
    accentColor: '#38bdf8',
    icon: <Database className="w-5 h-5 text-[#38bdf8]" />,
    datasetNote: 'Pines_Dataset.mat Connected (5.95 MB)',
  },
  {
    id: 'rx',
    indexStr: '02',
    number: 2,
    title: 'RX RADAR',
    subtitle: 'Reed-Xiaoli Anomaly Detection (Live Demo Benchmark)',
    description: 'Autonomous statistical anomaly isolation executing global covariance background modeling to compute the Mahalanobis distance metric for each pixel vector.',
    technicalDetails: [
      'Covariance Matrix Inversion: r(x) = (x - μ)ᵀ K⁻¹ (x - μ)',
      'Sub-pixel metallic, synthetic, and disturbed material extraction',
      'Real-time percentile threshold sensitivity tuning (1% - 20%)',
    ],
    algorithm: 'Mahalanobis: r(x) > η_threshold',
    badge: 'LIVE DEMO • UNLOCKED',
    accentColor: '#00f0ff',
    icon: <Target className="w-5 h-5 text-[#00f0ff]" />,
  },
  {
    id: 'spatial',
    indexStr: '03',
    number: 3,
    title: 'SPATIAL REFINEMENT',
    subtitle: 'Morphology & Target Bounding Boxes',
    description: 'Applies OpenCV morphological opening and closing operators to eliminate single-pixel sensor noise and delineates candidate anomaly clusters with georeferenced bounding boxes.',
    technicalDetails: [
      '3×3 structuring element morphological erosion and dilation',
      'Connected components candidate region clustering & centroids',
      'Area filtering and target bounding box geometry generation',
    ],
    algorithm: 'Morphology: (A ∘ B) • B & CCL',
    badge: 'SPATIAL FILTER',
    accentColor: '#00f5a0',
    icon: <Scan className="w-5 h-5 text-[#00f5a0]" />,
  },
  {
    id: 'profiler',
    indexStr: '04',
    number: 4,
    title: 'SPECTRAL PROFILER',
    subtitle: '200-Band Signature Analysis',
    description: 'Extracts and decomposes full continuous reflectance curves across 400nm – 2500nm, comparing isolated anomalous targets against surrounding agricultural or urban background baselines.',
    technicalDetails: [
      'Continuous 200-channel spectral reflectance curve cross-examination',
      'Chlorophyll red-edge and water absorption band (1400/1900nm) profiling',
      'Spectral Angle Mapper (SAM) vector divergence calculation',
    ],
    algorithm: 'SAM: θ = cos⁻¹((s·b) / (‖s‖‖b‖))',
    badge: 'SPECTRAL PROFILER',
    accentColor: '#2dd4bf',
    icon: <Activity className="w-5 h-5 text-[#2dd4bf]" />,
  },
  {
    id: 'segment',
    indexStr: '05',
    number: 5,
    title: 'SCENE SEGMENTATION',
    subtitle: 'Unsupervised K-Means Clustering',
    description: 'Partitions high-dimensional spectral radiance spaces into cohesive land-cover clusters: dense crop canopies, bare soils, waterways, and artificial infrastructure.',
    technicalDetails: [
      'Unsupervised K-Means clustering across K=3 to K=6 centroids',
      'Spatial-spectral variance estimation and thematic pseudo-coloring',
      'Acreage percentage distribution and land-cover class reporting',
    ],
    algorithm: 'K-Means Min: ∑ ‖x_i - μ_k‖²',
    badge: 'UNSUPERVISED CLUSTER',
    accentColor: '#fbbf24',
    icon: <Layers className="w-5 h-5 text-[#fbbf24]" />,
  },
  {
    id: 'reports',
    indexStr: '06',
    number: 6,
    title: 'INTELLIGENCE REPORTS',
    subtitle: 'Mission Dossier & Anomaly Export',
    description: 'Synthesizes mission-critical hyperspectral analysis into formatted intelligence dossiers, structured GeoJSON/CSV coordinate catalogs, and telemetry summaries.',
    technicalDetails: [
      'Downloadable mission dossier containing dataset metadata & target catalog',
      'Exportable CSV target tables with confidence scores and centroids',
      'Clipboard telemetry export and API payload synchronization',
    ],
    algorithm: 'Export: JSON / CSV / GeoJSON',
    badge: 'SQLITE DOSSIER',
    accentColor: '#00f0ff',
    icon: <ShieldCheck className="w-5 h-5 text-[#00f0ff]" />,
  },
];

export interface SystemArchitectureDeckProps {
  onSelectModule?: (view: ViewId) => void;
}

export const SystemArchitectureDeck: React.FC<SystemArchitectureDeckProps> = ({ onSelectModule }) => {
  const navigate = useNavigate();
  const { user, requireAuth } = useSession();
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Mouse glare effect coords
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleLaunch = (viewId: ViewId) => {
    if (viewId === 'rx') {
      if (onSelectModule) {
        onSelectModule('rx');
      } else {
        navigate('/console', { state: { view: 'rx' } });
      }
    } else {
      requireAuth(() => {
        if (onSelectModule) {
          onSelectModule(viewId);
        } else {
          navigate('/console', { state: { view: viewId } });
        }
      }, 'signup');
    }
  };

  const nextCard = () => {
    setActiveCardIndex(prev => (prev + 1) % MODULES.length);
  };

  const prevCard = () => {
    setActiveCardIndex(prev => (prev - 1 + MODULES.length) % MODULES.length);
  };

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 overflow-hidden select-none">
      {/* ─── DYNAMIC HOLOGRAPHIC AMBIENT GLOWS & PARTICLES ─── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00f0ff]/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#00f5a0]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00f0ff]/30 bg-[#070f1e] text-xs font-mono text-[#00f0ff] font-semibold mb-4 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00f5a0] animate-pulse" />
          <span>SYSTEM ARCHITECTURE &bull; TACTILE DECK INTERACTION</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4"
        >
          Six Autonomous Spectral Intelligence Modules
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-sm sm:text-base text-[#b9afcb] leading-relaxed"
        >
          Touch, drag, and place cards with physics-based smooth effects. From raw 3D tensor calibration and Reed-Xiaoli covariance inversion to 200-band spectral profile decomposition and mission dossier export.
        </motion.p>

        {/* Dataset Status Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2.5 mt-5 px-3.5 py-1.5 rounded-full bg-[#0c0a14] border border-[#00f5d4]/40 text-xs font-mono text-[#00f5d4] shadow-[0_0_15px_rgba(0,245,212,0.15)]"
        >
          <FolderCheck className="w-4 h-4 text-[#00f5d4] animate-pulse" />
          <span>DATASET ATTACHED: Pines_Dataset.mat (145×145×200 bands) &bull; CAVE MULTISPECTRAL READY</span>
        </motion.div>

        {/* View Mode Switcher */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0c0a14] border border-[#2a2138]">
            <button
              onClick={() => setViewMode('deck')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === 'deck'
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#00f5a0] text-[#040810] shadow-lg shadow-[#00f0ff]/25 font-black'
                  : 'text-[#8577a0] hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Placing Card Deck</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#00f5a0] text-[#040810] shadow-lg shadow-[#00f0ff]/25 font-black'
                  : 'text-[#8577a0] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Full Matrix Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODE 1: TACTILE PLACING CARD DECK WITH ENHANCED 3D GLOW & SHIMMER EFFECTS ─── */}
      {viewMode === 'deck' ? (
        <div className="relative max-w-5xl mx-auto">
          {/* Deck Carousel Header Controls */}
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="text-xs font-mono text-[#8577a0] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
              <span>CARD <strong className="text-white">{activeCardIndex + 1}</strong> OF <strong className="text-white">{MODULES.length}</strong></span>
              <span className="hidden sm:inline text-[#1e3a5f]">&bull;</span>
              <span className="hidden sm:inline text-[#00f0ff]">TOUCH / DRAG TO PLACE</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevCard}
                className="w-10 h-10 rounded-xl bg-[#070f1e] border border-[#1e3a5f] flex items-center justify-center text-[#b9afcb] hover:text-white hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
                aria-label="Previous module card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextCard}
                className="w-10 h-10 rounded-xl bg-[#070f1e] border border-[#1e3a5f] flex items-center justify-center text-[#b9afcb] hover:text-white hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
                aria-label="Next module card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tactile Deck Display Stage */}
          <div 
            onMouseMove={handleMouseMove}
            className="relative min-h-[460px] sm:min-h-[500px] flex items-center justify-center py-6"
            style={{ perspective: '1200px' }}
          >
            {MODULES.map((module, index) => {
              const offset = (index - activeCardIndex + MODULES.length) % MODULES.length;
              let normalizedOffset = offset;
              if (normalizedOffset > MODULES.length / 2) {
                normalizedOffset -= MODULES.length;
              }

              const isCenter = normalizedOffset === 0;
              const isAdjacent = Math.abs(normalizedOffset) === 1;
              const isVisible = Math.abs(normalizedOffset) <= 2;

              if (!isVisible) return null;

              // Card-placing physics transforms: x offset, rotation, elevation, scale
              const xOffset = normalizedOffset * 170;
              const rotateZ = normalizedOffset * 6.5;
              const zIndex = 30 - Math.abs(normalizedOffset) * 5;
              const scale = isCenter ? 1 : isAdjacent ? 0.88 : 0.76;
              const opacity = isCenter ? 1 : isAdjacent ? 0.78 : 0.35;

              return (
                <motion.div
                  key={module.id}
                  layout
                  onClick={() => setActiveCardIndex(index)}
                  onTouchStart={() => setActiveCardIndex(index)}
                  whileHover={{ 
                    y: isCenter ? -18 : -10, 
                    scale: isCenter ? 1.04 : scale + 0.05,
                    transition: { duration: 0.25, ease: "easeOut" }
                  }}
                  whileTap={{ 
                    scale: 0.96, 
                    y: -6,
                    transition: { duration: 0.12 } 
                  }}
                  animate={{
                    x: xOffset,
                    rotateZ: rotateZ,
                    scale: scale,
                    opacity: opacity,
                    zIndex: zIndex,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 24,
                  }}
                  className={`absolute w-[92%] sm:w-[490px] rounded-3xl p-6 sm:p-8 cursor-pointer backdrop-blur-2xl transition-all duration-300 overflow-hidden ${
                    isCenter
                      ? 'border-2 shadow-2xl bg-gradient-to-b from-[#181326] via-[#100d1c] to-[#0a0812]'
                      : 'border bg-[#100d1c]/90 hover:opacity-90'
                  }`}
                  style={{
                    borderColor: isCenter ? module.accentColor : '#2a2138',
                    boxShadow: isCenter ? `0 25px 60px -10px ${module.accentColor}44, 0 0 25px ${module.accentColor}22` : 'none',
                  }}
                >
                  {/* Dynamic Interactive Glare Sheen Overlay on Active Card */}
                  {isCenter && (
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle 350px at ${mousePos.x}px ${mousePos.y}px, ${module.accentColor}33, transparent 70%)`,
                      }}
                    />
                  )}

                  {/* Corner Accent Brackets */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t border-l" style={{ borderColor: module.accentColor }} />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t border-r" style={{ borderColor: module.accentColor }} />

                  {/* Card Header & Badge */}
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center p-2.5 border shadow-lg"
                        style={{
                          backgroundColor: `${module.accentColor}18`,
                          borderColor: `${module.accentColor}55`,
                          boxShadow: `0 0 15px ${module.accentColor}25`,
                        }}
                      >
                        {module.icon}
                      </div>
                      <div>
                        <div className="font-mono text-xs font-black tracking-widest" style={{ color: module.accentColor }}>
                          MODULE {module.indexStr}
                        </div>
                        <div className="text-[10px] font-mono text-[#8577a0]">
                          {module.badge}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono text-xs text-[#8577a0] bg-[#07090e] px-2.5 py-1 rounded-lg border border-[#2a2138] flex items-center gap-1.5">
                      <Zap className="w-3 h-3" style={{ color: module.accentColor }} />
                      <span>{module.algorithm.split(':')[0]}</span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight relative z-10">
                    {module.subtitle}
                  </h3>
                  <div className="text-xs font-mono mb-4 flex items-center gap-2 relative z-10" style={{ color: module.accentColor }}>
                    <span>{module.title}</span>
                    {module.datasetNote && (
                      <span className="text-[10px] text-[#00f5d4] bg-[#00f5d4]/10 px-2 py-0.5 rounded border border-[#00f5d4]/30">
                        {module.datasetNote}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#b9afcb] leading-relaxed mb-6 relative z-10">
                    {module.description}
                  </p>

                  {/* Technical Bullet Points (Active on Center Card) */}
                  {isCenter && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 mb-6 pt-4 border-t border-[#2a2138] relative z-10"
                    >
                      {module.technicalDetails.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2.5 text-xs text-[#b9afcb]">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: module.accentColor }} />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Action CTA */}
                  <div className="flex items-center justify-between pt-2 relative z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunch(module.id);
                      }}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: isCenter ? module.accentColor : '#1f192e',
                        color: isCenter ? '#07090e' : '#ffffff',
                        boxShadow: isCenter ? `0 0 20px ${module.accentColor}55` : 'none',
                      }}
                    >
                      <span className="font-black">Open in Mission Console</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] font-mono text-[#8577a0] hidden sm:inline flex items-center gap-1">
                      <span>TOUCH TO PLACE</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Card Selector Indicators */}
          <div className="flex items-center justify-center gap-2.5 mt-5">
            {MODULES.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setActiveCardIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeCardIndex === idx 
                    ? 'w-10 bg-[#00f0ff] shadow-[0_0_12px_#00f0ff]' 
                    : 'w-2.5 bg-[#1e3a5f] hover:bg-[#38bdf8]'
                }`}
                aria-label={`Switch to module ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ─── MODE 2: FULL TACTILE MATRIX GRID (SMOOTH TILT & GLOW EFFECTS) ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((module, index) => {
            const isHovered = hoveredCard === index;
            return (
              <motion.div
                key={module.id}
                onClick={() => handleLaunch(module.id)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ 
                  y: -14, 
                  scale: 1.03, 
                  rotateZ: index % 2 === 0 ? 1 : -1,
                  transition: { duration: 0.25, ease: "easeOut" } 
                }}
                whileTap={{ scale: 0.98, y: -4 }}
                className={`relative p-6 sm:p-7 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-xl overflow-hidden ${
                  isHovered
                    ? 'bg-[#1a1428] shadow-2xl'
                    : 'bg-[#120e1e]/90 border-[#2a2138] hover:border-[#3a2e52]'
                }`}
                style={{
                  borderColor: isHovered ? module.accentColor : '#2a2138',
                  boxShadow: isHovered ? `0 20px 50px -10px ${module.accentColor}35, 0 0 20px ${module.accentColor}20` : 'none',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center p-2 border"
                      style={{
                        backgroundColor: `${module.accentColor}18`,
                        borderColor: `${module.accentColor}40`,
                      }}
                    >
                      {module.icon}
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold tracking-wider" style={{ color: module.accentColor }}>
                        MODULE {module.indexStr}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-[#8577a0] bg-[#0c0a14] px-2 py-0.5 rounded border border-[#2a2138]">
                    {module.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{module.subtitle}</h3>
                <div className="text-[11px] font-mono text-[#00f0ff] mb-3">{module.title}</div>
                <p className="text-xs text-[#b9afcb] leading-relaxed mb-6">{module.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-[#2a2138]">
                  <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: module.accentColor }}>
                    <span>Launch Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-[#8577a0]">
                    PRESS TO ENTER
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};
