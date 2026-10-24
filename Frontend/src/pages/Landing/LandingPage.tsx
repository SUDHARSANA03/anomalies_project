import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crosshair, ArrowRight, Sparkles, Target, ShieldCheck, Lock, Play, Compass } from 'lucide-react';
import { Footer } from '../../components/common/Footer';
import { InteractiveBackground } from '../../components/ui/InteractiveBackground';
import { SpectralManifoldHero } from '../../components/ui/SpectralManifoldHero';
import { OpticalPathSection } from '../../components/ui/OpticalPathSection';
import { SystemArchitectureDeck } from '../../components/ui/SystemArchitectureDeck';
import { useSession } from '../../context/SessionContext';
import { ViewId } from '../../data';

/* Animated Numbers Component */
const AnimatedNumber: React.FC<{ target: number; suffix?: string; prefix?: string; decimals?: number }> = ({ target, suffix = '', prefix = '', decimals = 0 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const start = performance.now();
        const dur = 1800;
        const step = (now: number) => {
          const progress = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setVal(eased * target);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}{suffix}</span>;
};

export interface LandingPageProps {
  onNext?: (view?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNext }) => {
  const navigate = useNavigate();
  const { user, openAuthModal, requireAuth } = useSession();

  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Live demo method: ONLY exception allowed without signin
  const handleLaunchLiveDemo = () => {
    if (onNext) {
      onNext('rx');
    } else {
      navigate('/console', { state: { view: 'rx' } });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected methods: require signup if not signed in
  const handleEnterMissionControl = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current && e) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    requireAuth(() => {
      if (onNext) {
        onNext('ingest');
      } else {
        navigate('/console');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 'signup');
  };

  const handleModuleSelect = (viewId: ViewId) => {
    if (viewId === 'rx') {
      // Live demo radar is allowed for anyone without signin
      handleLaunchLiveDemo();
    } else {
      // All other modules strictly require signup
      requireAuth(() => {
        if (onNext) {
          onNext(viewId);
        } else {
          navigate('/console', { state: { view: viewId } });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 'signup');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#040810] text-[#f8fafc] overflow-hidden selection:bg-[#00f0ff] selection:text-[#040810] font-sans">
      {/* 3D Holographic Particle Background */}
      <InteractiveBackground />

      {/* Cyber ambient glow spotlights */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#00f0ff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-[#00f5a0]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ─── NAVIGATION HEADER ─── */}
      <header className="relative z-30 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00f0ff] via-[#00f5a0] to-[#38bdf8] flex items-center justify-center p-[1px] shadow-lg shadow-[#00f0ff]/20">
            <div className="w-full h-full bg-[#070f1e] rounded-[7px] flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-[#00f0ff]" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black tracking-tight flex items-center gap-1.5 text-white">
              <span>HYPERSENSE</span>
              <span className="bg-gradient-to-r from-[#00f0ff] to-[#00f5a0] bg-clip-text text-transparent">AI</span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-[#64748b] font-mono font-semibold">
              SPECTRAL ANOMALY RADAR PLATFORM
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Demo Direct Launch Button (No signin required) */}
          <button
            onClick={handleLaunchLiveDemo}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#00f5a0]/15 border border-[#00f5a0]/35 text-xs font-bold text-[#00f5a0] hover:bg-[#00f5a0]/25 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.2)]"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Live Demo (No Signin)</span>
          </button>

          {user ? (
            <button
              onClick={() => navigate('/console')}
              className="px-4 py-2 rounded-lg bg-[#0c1a2e] border border-[#1e3a5f] text-xs font-bold text-white hover:border-[#00f0ff] transition-all duration-200 cursor-pointer"
            >
              Open Console ({user.name})
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 rounded-lg bg-[#070f1e] border border-[#1e3a5f] text-xs font-semibold text-[#94a3b8] hover:text-white hover:border-[#00f0ff] transition-all duration-200 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#00f5a0] text-xs font-extrabold text-[#040810] shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── SECTION 01: FRONTPAGE (HERO WITH FIRST REFERRAL IMAGE & SURROUNDING HORIZONTAL RADAR) ─── */}
      <section className="relative min-h-0 pt-4 pb-12 sm:pb-16 flex items-start px-4 sm:px-6 lg:px-8 overflow-hidden z-10">
        {/* Subtle Cyber Atmospheric Mesh Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,240,255,0.12),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040810]/70 to-[#040810]" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center relative z-10">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 z-20 pt-2">
            {/* Pill Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-[#00f0ff]/40 text-xs text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.25)] backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00f5a0] animate-pulse" />
              <span className="font-semibold font-sans tracking-widest uppercase text-[10px]">
                HYPERSENSE AI &bull; REAL-TIME SPECTRAL ANOMALY & RADAR ANALYSIS
              </span>
            </motion.div>

            {/* Giant Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]"
            >
              HYPERSENSE <span className="bg-gradient-to-r from-[#00f0ff] via-[#00f5a0] to-[#38bdf8] bg-clip-text text-transparent">AI</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-[#94a3b8] max-w-xl leading-relaxed"
            >
              HyperSense AI is an autonomous spectral anomaly intelligence platform that continuously analyzes 200+ channel airborne and satellite cubes to isolate sub-pixel anomalies, calculate Mahalanobis RX spatial distances, and classify spectral signatures with mathematical precision.
            </motion.p>

            {/* Feature pill */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#1e3a5f] bg-[#070f1e]/85 backdrop-blur-md max-w-xl shadow-lg"
            >
              <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <div className="text-xs sm:text-sm text-[#94a3b8] leading-snug">
                Equipped with <span className="font-semibold text-white">Reed-Xiaoli (RX) Mahalanobis Engine</span>, 3×3 OpenCV Morphological Noise Suppression, and <span className="font-semibold text-white">Unsupervised K-Means Spectral Clustering</span>.
              </div>
            </motion.div>

            {/* Dual CTA Buttons: Live Demo (No signin) + Enter Mission Control (Signup required) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Button 1: Live Demo Exception (works 100% without signin) */}
              <button
                onClick={handleLaunchLiveDemo}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#00f0ff] via-[#00f5a0] to-[#38bdf8] text-[#040810] font-black text-sm tracking-wide shadow-lg shadow-[#00f0ff]/30 hover:shadow-[#00f0ff]/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>LAUNCH LIVE DEMO (NO SIGNIN)</span>
              </button>

              {/* Button 2: Enter Mission Control (Requires Signup) */}
              <button
                ref={buttonRef}
                onClick={handleEnterMissionControl}
                className="relative overflow-hidden px-6 py-3.5 rounded-xl bg-[#0c182b] border border-[#1e3a5f] hover:border-[#00f0ff] text-white font-bold text-sm tracking-wide shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              >
                {!user ? <Lock className="w-3.5 h-3.5 text-[#00f0ff]" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#00f5a0]" />}
                <span>{user ? 'ENTER MISSION CONTROL' : 'MISSION CONTROL (SIGNUP)'}</span>
                <ArrowRight className="w-4 h-4 text-[#00f0ff]" />
                {ripples.map(r => (
                  <span
                    key={r.id}
                    className="absolute bg-[#00f0ff]/30 rounded-full pointer-events-none animate-ping"
                    style={{ left: r.x, top: r.y, width: 40, height: 40, transform: 'translate(-50%, -50%)' }}
                  />
                ))}
              </button>
            </div>
          </div>

          {/* Right Hero Column: First Referral Image + Horizontal Spinning Radar Bounding It */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <SpectralManifoldHero />
          </div>
        </div>
      </section>

      {/* ─── SECTION 02: SECOND REFERRAL IMAGE (SMOOTH ENTRANCE LEFT-TO-RIGHT IN CORNER + LABELED PARTS a-h, NO RADAR) ─── */}
      <OpticalPathSection />

      {/* ─── METRICS TICKER ROW ─── */}
      <section className="relative z-20 border-y border-[#1e3a5f] bg-[#070f1e]/90 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono mb-1">
              <AnimatedNumber target={224} suffix="+" />
            </div>
            <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Contiguous Spectral Bands
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#00f0ff] font-mono mb-1">
              &lt;<AnimatedNumber target={38} suffix="ms" />
            </div>
            <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              RX Covariance Latency
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#00f5a0] font-mono mb-1">
              <AnimatedNumber target={99} suffix=".4%" decimals={1} />
            </div>
            <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Anomaly Target Precision
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#38bdf8] font-mono mb-1">
              0.4 – 2.5<span className="text-lg">µm</span>
            </div>
            <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Continuous Wavelength Span
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 03: SYSTEM ARCHITECTURE - SIX AUTONOMOUS SPECTRAL INTELLIGENCE MODULES (CARD-PLACING TOUCH EFFECTS) ─── */}
      <SystemArchitectureDeck onSelectModule={handleModuleSelect} />

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
};
