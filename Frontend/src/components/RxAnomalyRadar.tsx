import React, { useState, useRef, useEffect } from 'react'
import { useSession } from '../context/SessionContext'
import { Target, Sliders, RefreshCw, Eye, Crosshair, ArrowRight, Activity, Zap } from 'lucide-react'

export default function RxAnomalyRadar({ onNavigateToSpatial }: { onNavigateToSpatial?: () => void }) {
  const { telemetry, setThreshold } = useSession()
  const [localThreshold, setLocalThreshold] = useState<number>(telemetry.activeThreshold || 5)
  const [activeTab, setActiveTab] = useState<'comparison' | 'heatmap'>('comparison')
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false)

  const falseColorCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Render Synthetic High-Fidelity Maps on Canvases
  useEffect(() => {
    const w = 145
    const h = 145

    // 1. False Color
    if (falseColorCanvasRef.current) {
      const ctx = falseColorCanvasRef.current.getContext('2d')
      if (ctx) {
        falseColorCanvasRef.current.width = w
        falseColorCanvasRef.current.height = h
        const img = ctx.createImageData(w, h)
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4
            const r = Math.floor(100 + 70 * Math.sin(x / 14) + Math.cos(y / 10) * 30)
            const g = Math.floor(60 + 50 * Math.sin(y / 12))
            const b = Math.floor(110 + 60 * Math.sin((x + y) / 16))
            img.data[idx] = r
            img.data[idx + 1] = g
            img.data[idx + 2] = b
            img.data[idx + 3] = 255
          }
        }
        ctx.putImageData(img, 0, 0)
      }
    }

    // 2. Continuous RX Score Heatmap (Cyber Violet - Plasma Heatmap)
    if (heatmapCanvasRef.current) {
      const ctx = heatmapCanvasRef.current.getContext('2d')
      if (ctx) {
        heatmapCanvasRef.current.width = w
        heatmapCanvasRef.current.height = h
        const img = ctx.createImageData(w, h)

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4
            // Background noise
            let rx = Math.random() * 2.5 + Math.sin(x / 20) * Math.cos(y / 20) * 2

            // Inject known anomaly clusters
            telemetry.candidates.forEach((cand) => {
              const dist = Math.hypot(x - cand.centroid[0], y - cand.centroid[1])
              if (dist < 12) {
                rx += (12 - dist) * 2.2
              }
            })

            // Normalize score to color: Deep Obsidian (#040810) -> Tactical Emerald (#00f5a0) -> Electric Cyan (#00f0ff) -> White (#ffffff)
            const norm = Math.min(1, Math.max(0, rx / (telemetry.peakRxScore || 24)))
            if (norm < 0.5) {
              const t = norm / 0.5
              img.data[idx] = Math.floor(4 * (1 - t) + 0 * t)
              img.data[idx + 1] = Math.floor(15 * (1 - t) + 245 * t)
              img.data[idx + 2] = Math.floor(30 * (1 - t) + 160 * t)
            } else {
              const t = (norm - 0.5) / 0.5
              img.data[idx] = Math.floor(0 * (1 - t) + 255 * t)
              img.data[idx + 1] = Math.floor(245 * (1 - t) + 255 * t)
              img.data[idx + 2] = Math.floor(160 * (1 - t) + 255 * t)
            }
            img.data[idx + 3] = 255
          }
        }
        ctx.putImageData(img, 0, 0)
      }
    }

    // 3. Binary Anomaly Mask
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d')
      if (ctx) {
        maskCanvasRef.current.width = w
        maskCanvasRef.current.height = h
        const img = ctx.createImageData(w, h)

        // Threshold cutoff
        const cutoffValue = 24 * (1 - localThreshold / 22)

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4
            let rx = Math.random() * 2 + Math.sin(x / 20) * Math.cos(y / 20) * 2
            telemetry.candidates.forEach((cand) => {
              const dist = Math.hypot(x - cand.centroid[0], y - cand.centroid[1])
              if (dist < 12) {
                rx += (12 - dist) * 2.2
              }
            })

            const isAnomaly = rx >= cutoffValue
            if (isAnomaly) {
              img.data[idx] = 255
              img.data[idx + 1] = 107
              img.data[idx + 2] = 157
              img.data[idx + 3] = 255
            } else {
              img.data[idx] = 10
              img.data[idx + 1] = 8
              img.data[idx + 2] = 16
              img.data[idx + 3] = 255
            }
          }
        }
        ctx.putImageData(img, 0, 0)
      }
    }
  }, [telemetry, localThreshold])

  const handleApplyThreshold = async () => {
    setIsRecalculating(true)
    await setThreshold(localThreshold)
    setTimeout(() => setIsRecalculating(false), 300)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge" style={{ background: 'rgba(255, 107, 157, 0.15)', color: 'var(--critical)', border: '1px solid rgba(255, 107, 157, 0.3)' }}>
            MODULE 02
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
            REED-XIAOLI (RX) ALGORITHM CORE
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Reed-Xiaoli (RX) Anomaly Detection Engine
        </h1>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px', maxWidth: '850px' }}>
          Unsupervised spectral anomaly detection measuring the Mahalanobis distance r(x) = (x - μ)ᵀ K⁻¹ (x - μ) between each pixel spectrum and the global scene background covariance matrix.
        </p>
      </div>

      {/* Threshold Tuning Bar Card */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow)',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sliders size={18} style={{ color: 'var(--ai)' }} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                Anomaly Sensitivity & Percentile Threshold Tuning
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>
              Controls the top percentage of high-scoring Mahalanobis distance pixels classified as anomalous targets.
            </p>
          </div>

          <button
            onClick={handleApplyThreshold}
            disabled={isRecalculating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f0ff, #00f5a0)',
              border: 'none',
              color: '#040810',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isRecalculating ? 'not-allowed' : 'pointer',
              opacity: isRecalculating ? 0.7 : 1,
              boxShadow: '0 4px 15px rgba(0, 240, 255, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={15} className={isRecalculating ? 'animate-spin' : ''} />
            <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Mask'}</span>
          </button>
        </div>

        {/* Slider control */}
        <div style={{ background: 'rgba(10, 8, 16, 0.65)', border: '1px solid var(--border-soft)', padding: '16px 20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              Percentile Sensitivity Threshold: <span style={{ color: 'var(--ai)', fontFamily: 'var(--mono)' }}>{localThreshold}% Cutoff</span>
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}>
              Flagging ~{Math.round((telemetry.totalPixels * localThreshold) / 100).toLocaleString()} px / {telemetry.totalPixels.toLocaleString()} px
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={localThreshold}
            onChange={(e) => setLocalThreshold(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--ai)', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-faint)', marginTop: '6px', fontFamily: 'var(--mono)' }}>
            <span>1% (Extreme Outliers Only)</span>
            <span>5% (Recommended Baseline)</span>
            <span>20% (High Sensitivity)</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('comparison')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: activeTab === 'comparison' ? 'var(--panel)' : 'transparent',
            border: activeTab === 'comparison' ? '1px solid var(--ai)' : '1px solid transparent',
            color: activeTab === 'comparison' ? 'var(--text)' : 'var(--text-dim)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Side-by-Side Radar Comparison
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: activeTab === 'heatmap' ? 'var(--panel)' : 'transparent',
            border: activeTab === 'heatmap' ? '1px solid var(--ai)' : '1px solid transparent',
            color: activeTab === 'heatmap' ? 'var(--text)' : 'var(--text-dim)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Continuous Heatmap Focus
        </button>
      </div>

      {/* Visualizer Canvases */}
      {activeTab === 'comparison' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {/* 1. False Color */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. False-Color Reference
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}>RGB Composite</span>
            </div>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', background: '#05040a', border: '1px solid var(--border-soft)' }}>
              <canvas ref={falseColorCanvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '10px', margin: '10px 0 0 0' }}>
              Multi-band scene baseline before background subtraction.
            </p>
          </div>

          {/* 2. RX Score Heatmap */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ai)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Continuous RX Heatmap
              </span>
              <span style={{ fontSize: '11px', color: 'var(--ai)', fontFamily: 'var(--mono)' }}>Mahalanobis Distance</span>
            </div>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', background: '#05040a', border: '1px solid var(--border-soft)' }}>
              <canvas ref={heatmapCanvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '10px', margin: '10px 0 0 0' }}>
              Hotter shades represent higher spectral distance from background covariance.
            </p>
          </div>

          {/* 3. Binary Anomaly Mask */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--critical)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                3. Binary Anomaly Mask
              </span>
              <span style={{ fontSize: '11px', color: 'var(--critical)', fontFamily: 'var(--mono)' }}>{localThreshold}% Cutoff</span>
            </div>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', background: '#05040a', border: '1px solid var(--border-soft)' }}>
              <canvas ref={maskCanvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '10px', margin: '10px 0 0 0' }}>
              Binary segmentation flagging candidate anomalous targets.
            </p>
          </div>
        </div>
      ) : (
        /* Large Heatmap View */
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)', marginBottom: '28px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', maxWidth: '500px', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', background: '#05040a', border: '1px solid var(--border-soft)' }}>
            <canvas ref={heatmapCanvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text)' }}>
              Spectral Outlier Concentration Map
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '20px' }}>
              High-intensity hotspots indicate spatial clusters where multi-band reflectance profiles sharply deviate from the scene background average. These locations represent candidate artificial targets, stress anomalies, or distinct mineral signatures.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--mono)', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(10, 8, 16, 0.6)', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                <span style={{ color: 'var(--text-faint)' }}>MEAN DISTANCE:</span>
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>{telemetry.meanRxScore.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(10, 8, 16, 0.6)', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                <span style={{ color: 'var(--text-faint)' }}>PEAK DISTANCE:</span>
                <span style={{ color: 'var(--critical)', fontWeight: 700 }}>{telemetry.peakRxScore.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(10, 8, 16, 0.6)', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                <span style={{ color: 'var(--text-faint)' }}>ANOMALY PIXELS:</span>
                <span style={{ color: 'var(--ai)', fontWeight: 700 }}>{telemetry.anomalyPixels.toLocaleString()} ({telemetry.anomalyPercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      {onNavigateToSpatial && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onNavigateToSpatial}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f0ff, #00f5a0)',
              border: 'none',
              color: '#040810',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)',
            }}
          >
            <span>Proceed to Spatial Refinement</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
