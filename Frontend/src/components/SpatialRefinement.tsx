import React, { useRef, useEffect } from 'react'
import { useSession } from '../context/SessionContext'
import { CandidateRegion } from '../data'
import { Scan, Sparkles, Filter, CheckCircle2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react'

export default function SpatialRefinement({ onNavigateToProfiler }: { onNavigateToProfiler?: () => void }) {
  const { telemetry, selectedCandidate, setSelectedCandidate } = useSession()
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const cleanedMaskCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const candidates = telemetry.candidates || []
  const maxArea = candidates.length > 0 ? Math.max(...candidates.map((c) => c.area)) : 0
  const avgScore = candidates.length > 0 ? (candidates.reduce((acc, c) => acc + c.meanScore, 0) / candidates.length).toFixed(1) : '0.0'
  const peakScore = candidates.length > 0 ? Math.max(...candidates.map((c) => c.maxScore)).toFixed(1) : '0.0'

  // Render Cleaned Mask & Bounding Box Overlay
  useEffect(() => {
    const w = 145
    const h = 145

    // 1. Cleaned Morphological Mask
    if (cleanedMaskCanvasRef.current) {
      const ctx = cleanedMaskCanvasRef.current.getContext('2d')
      if (ctx) {
        cleanedMaskCanvasRef.current.width = w
        cleanedMaskCanvasRef.current.height = h
        ctx.fillStyle = '#0a0810'
        ctx.fillRect(0, 0, w, h)

        // Draw refined candidate regions
        candidates.forEach((cand) => {
          ctx.fillStyle = '#34d399'
          ctx.beginPath()
          ctx.ellipse(cand.centroid[0], cand.centroid[1], cand.width / 2, cand.height / 2, 0, 0, Math.PI * 2)
          ctx.fill()
        })
      }
    }

    // 2. Scene with Bounding Boxes & Reticles
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d')
      if (ctx) {
        overlayCanvasRef.current.width = w
        overlayCanvasRef.current.height = h

        // Draw false-color background
        const img = ctx.createImageData(w, h)
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4
            img.data[idx] = Math.floor(100 + 70 * Math.sin(x / 14))
            img.data[idx + 1] = Math.floor(60 + 50 * Math.sin(y / 12))
            img.data[idx + 2] = Math.floor(110 + 60 * Math.sin((x + y) / 16))
            img.data[idx + 3] = 255
          }
        }
        ctx.putImageData(img, 0, 0)

        // Draw bounding boxes for all candidate targets
        candidates.forEach((cand) => {
          const isSelected = selectedCandidate?.id === cand.id

          // Bounding Box
          ctx.strokeStyle = isSelected ? '#00f0ff' : '#00f5a0'
          ctx.lineWidth = isSelected ? 2 : 1.5
          ctx.strokeRect(cand.x, cand.y, cand.width, cand.height)

          // Semi-transparent target fill
          ctx.fillStyle = isSelected ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 245, 160, 0.2)'
          ctx.fillRect(cand.x, cand.y, cand.width, cand.height)

          // Center crosshair
          ctx.strokeStyle = isSelected ? '#ffffff' : '#00f5a0'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(cand.centroid[0] - 4, cand.centroid[1])
          ctx.lineTo(cand.centroid[0] + 4, cand.centroid[1])
          ctx.moveTo(cand.centroid[0], cand.centroid[1] - 4)
          ctx.lineTo(cand.centroid[0], cand.centroid[1] + 4)
          ctx.stroke()

          // Target Label tag
          ctx.fillStyle = '#040810'
          ctx.fillRect(cand.x, cand.y - 12, 28, 11)
          ctx.fillStyle = isSelected ? '#00f0ff' : '#00f5a0'
          ctx.font = '8px monospace'
          ctx.fillText(`T#${cand.id}`, cand.x + 2, cand.y - 3)
        })
      }
    }
  }, [candidates, selectedCandidate])

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--ok)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            MODULE 03
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
            OPENCV MORPHOLOGY & TARGET EXTRACTION
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Spatial Refinement & Candidate Target Bounding
        </h1>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px', maxWidth: '850px' }}>
          Suppress salt-and-pepper sensor noise through morphological opening and closing operators, grouping connected anomalous pixels into discrete geospatial target candidates.
        </p>
      </div>

      {/* KPI Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '18px 22px', borderRadius: '14px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Candidate Targets</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ok)', marginTop: '4px' }}>
            {candidates.length} Targets
          </div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '18px 22px', borderRadius: '14px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Max Target Area</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
            {maxArea} pixels
          </div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '18px 22px', borderRadius: '14px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Average RX Distance</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ai)', marginTop: '4px' }}>
            {avgScore}
          </div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '18px 22px', borderRadius: '14px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Peak Outlier Distance</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--critical)', marginTop: '4px' }}>
            {peakScore}
          </div>
        </div>
      </div>

      {/* Dual Visual Inspection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* 1. Morphologically Cleaned Mask */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ok)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Morphologically Cleaned Mask
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}>OpenCV 3×3 Kernel</span>
          </div>
          <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', background: '#05040a', border: '1px solid var(--border-soft)' }}>
            <canvas ref={cleanedMaskCanvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '12px 0 0 0' }}>
            Isolated single-pixel impulse noise eliminated via morphological opening.
          </p>
        </div>

        {/* 2. Bounding Box Overlay */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ai)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2. Target Bounding Box Overlays
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ai)', fontFamily: 'var(--mono)' }}>Georeferenced Targets</span>
          </div>
          <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', background: '#05040a', border: '1px solid var(--border-soft)' }}>
            <canvas ref={overlayCanvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '12px 0 0 0' }}>
            Green rectangles delineate discrete clusters; click any row below to highlight target.
          </p>
        </div>
      </div>

      {/* Candidate Targets Table */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text)' }}>
          Discrete Candidate Anomaly Target Registry
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
                <th style={{ padding: '12px 14px' }}>Target ID</th>
                <th style={{ padding: '12px 14px' }}>Centroid (X, Y)</th>
                <th style={{ padding: '12px 14px' }}>Area (Pixels)</th>
                <th style={{ padding: '12px 14px' }}>Mean Distance</th>
                <th style={{ padding: '12px 14px' }}>Peak Distance</th>
                <th style={{ padding: '12px 14px' }}>Anomaly Confidence</th>
                <th style={{ padding: '12px 14px' }}>Classification</th>
                <th style={{ padding: '12px 14px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((cand) => {
                const isSelected = selectedCandidate?.id === cand.id
                return (
                  <tr
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    style={{
                      borderBottom: '1px solid var(--border-soft)',
                      background: isSelected ? 'rgba(199, 125, 255, 0.1)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: isSelected ? 'var(--critical)' : 'var(--ai)' }}>
                      #{cand.id}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)' }}>
                      ({cand.centroid[0].toFixed(1)}, {cand.centroid[1].toFixed(1)})
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)' }}>
                      {cand.area} px
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                      {cand.meanScore.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--critical)' }}>
                      {cand.maxScore.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: cand.confidence > 95 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: cand.confidence > 95 ? 'var(--ok)' : 'var(--warning)',
                          border: `1px solid ${cand.confidence > 95 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        }}
                      >
                        {cand.confidence.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-dim)' }}>
                      {cand.classification}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCandidate(cand)
                          if (onNavigateToProfiler) onNavigateToProfiler()
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(199, 125, 255, 0.15)',
                          border: '1px solid rgba(199, 125, 255, 0.3)',
                          color: 'var(--ai)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Inspect Spectrum
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Footer */}
      {onNavigateToProfiler && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onNavigateToProfiler}
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
            <span>Inspect Spectral Signature</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
