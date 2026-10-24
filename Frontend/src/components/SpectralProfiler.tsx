import React, { useState, useRef, useEffect } from 'react'
import { useSession } from '../context/SessionContext'
import { CandidateRegion } from '../data'
import { Activity, Zap, CheckCircle2, ArrowRight, BarChart2, Info } from 'lucide-react'

export default function SpectralProfiler({ onNavigateToSegment }: { onNavigateToSegment?: () => void }) {
  const { telemetry, selectedCandidate, setSelectedCandidate } = useSession()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hoveredBand, setHoveredBand] = useState<number | null>(null)

  const candidate = selectedCandidate || telemetry.candidates[0]

  const bgSignature = candidate?.backgroundSignature || []
  const targetSignature = candidate?.spectralSignature || []

  // Draw 200-band Spectral Curve Chart on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !bgSignature.length || !targetSignature.length) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    const padding = { top: 30, right: 30, bottom: 45, left: 55 }
    const plotW = w - padding.left - padding.right
    const plotH = h - padding.top - padding.bottom

    // Background
    ctx.fillStyle = '#0a0810'
    ctx.fillRect(0, 0, w, h)

    // Grid lines
    ctx.strokeStyle = '#2a2138'
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (plotH / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()

      // Y-axis label (Reflectance)
      ctx.fillStyle = '#8577a0'
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      const val = (1 - i / 5).toFixed(1)
      ctx.fillText(val, padding.left - 10, y + 3)
    }

    // X-axis wavelength ticks (400nm, 800nm, 1200nm, 1600nm, 2000nm, 2400nm)
    const wavelengths = [400, 800, 1200, 1600, 2000, 2400]
    wavelengths.forEach((wl) => {
      const x = padding.left + ((wl - 400) / (2500 - 400)) * plotW
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, h - padding.bottom)
      ctx.stroke()

      ctx.fillStyle = '#8577a0'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${wl}nm`, x, h - padding.bottom + 18)
    })

    // X-Axis Title
    ctx.fillStyle = '#b9afcb'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Wavelength (Nanometers / Continuous Spectral Bands)', padding.left + plotW / 2, h - 8)

    // Y-Axis Title
    ctx.save()
    ctx.translate(14, padding.top + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('Reflectance (0.00 – 1.00)', 0, 0)
    ctx.restore()

    const nBands = bgSignature.length

    // Function to get pixel coordinates
    const getX = (idx: number) => padding.left + (idx / (nBands - 1)) * plotW
    const getY = (val: number) => padding.top + (1 - val) * plotH

    // 1. Draw Deviation Fill between Background and Target
    ctx.beginPath()
    ctx.moveTo(getX(0), getY(bgSignature[0]))
    for (let i = 1; i < nBands; i++) {
      ctx.lineTo(getX(i), getY(bgSignature[i]))
    }
    for (let i = nBands - 1; i >= 0; i--) {
      ctx.lineTo(getX(i), getY(targetSignature[i]))
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(255, 107, 157, 0.12)'
    ctx.fill()

    // 2. Draw Background Signature Curve (Dashed Cyan / Violet)
    ctx.beginPath()
    ctx.strokeStyle = '#818cf8'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.moveTo(getX(0), getY(bgSignature[0]))
    for (let i = 1; i < nBands; i++) {
      ctx.lineTo(getX(i), getY(bgSignature[i]))
    }
    ctx.stroke()
    ctx.setLineDash([])

    // 3. Draw Anomaly Target Signature Curve (Solid Electric Cyan with Glow)
    ctx.beginPath()
    ctx.strokeStyle = '#00f0ff'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(0, 240, 255, 0.6)'
    ctx.shadowBlur = 10
    ctx.moveTo(getX(0), getY(targetSignature[0]))
    for (let i = 1; i < nBands; i++) {
      ctx.lineTo(getX(i), getY(targetSignature[i]))
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Hover Indicator
    if (hoveredBand !== null && hoveredBand >= 0 && hoveredBand < nBands) {
      const hx = getX(hoveredBand)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.moveTo(hx, padding.top)
      ctx.lineTo(hx, h - padding.bottom)
      ctx.stroke()
      ctx.setLineDash([])

      // Target dot
      ctx.fillStyle = '#00f0ff'
      ctx.beginPath()
      ctx.arc(hx, getY(targetSignature[hoveredBand]), 4, 0, Math.PI * 2)
      ctx.fill()

      // Background dot
      ctx.fillStyle = '#00f5a0'
      ctx.beginPath()
      ctx.arc(hx, getY(bgSignature[hoveredBand]), 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [bgSignature, targetSignature, hoveredBand])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const padding = { left: 55, right: 30 }
    const plotW = rect.width - padding.left - padding.right
    if (x >= padding.left && x <= rect.width - padding.right) {
      const ratio = (x - padding.left) / plotW
      const band = Math.round(ratio * (bgSignature.length - 1))
      setHoveredBand(Math.max(0, Math.min(bgSignature.length - 1, band)))
    } else {
      setHoveredBand(null)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge" style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
            MODULE 04
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
            200-CHANNEL CONTINUOUS SPECTROMETRY
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Spectral Signature Profiler & Absorption Analysis
        </h1>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px', maxWidth: '850px' }}>
          Cross-examine high-resolution continuous reflectance curves of anomalous candidate targets against scene background reference baselines from visible blue (400nm) through shortwave infrared (2500nm).
        </p>
      </div>

      {/* Target Selector Toolbar */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '18px 24px',
          boxShadow: 'var(--shadow)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Active Target:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {telemetry.candidates.map((cand) => {
              const isSelected = candidate?.id === cand.id
              return (
                <button
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'linear-gradient(135deg, #00f0ff, #00f5a0)' : 'rgba(7, 15, 30, 0.65)',
                    border: isSelected ? 'none' : '1px solid var(--border-soft)',
                    color: isSelected ? '#040810' : '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Target #{cand.id} ({cand.confidence.toFixed(1)}%)
                </button>
              )
            })}
          </div>
        </div>

        {candidate && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontFamily: 'var(--mono)' }}>
            <span style={{ color: 'var(--text-dim)' }}>
              Centroid: <strong style={{ color: 'var(--text)' }}>({candidate.centroid[0].toFixed(1)}, {candidate.centroid[1].toFixed(1)})</strong>
            </span>
            <span style={{ color: 'var(--text-dim)' }}>
              Peak RX: <strong style={{ color: 'var(--critical)' }}>{candidate.maxScore.toFixed(2)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Chart Container */}
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
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '3px', background: '#00f0ff', display: 'inline-block', borderRadius: '2px', boxShadow: '0 0 8px #00f0ff' }}></span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                Target #{candidate?.id} Anomaly Spectrum
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '2px', background: '#00f5a0', display: 'inline-block', borderTop: '2px dashed #00f5a0' }}></span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>
                Scene Mean Background Baseline
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '14px', height: '14px', background: 'rgba(0, 240, 255, 0.2)', display: 'inline-block', borderRadius: '3px', border: '1px solid rgba(0, 240, 255, 0.4)' }}></span>
              <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Spectral Divergence Envelope</span>
            </div>
          </div>

          {hoveredBand !== null && (
            <div style={{ fontSize: '12px', fontFamily: 'var(--mono)', background: 'rgba(7, 15, 30, 0.85)', padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border-soft)' }}>
              Band #{hoveredBand} ({(400 + hoveredBand * 10.5).toFixed(0)}nm) | Target: <strong style={{ color: '#00f0ff' }}>{targetSignature[hoveredBand]?.toFixed(3)}</strong> | Bg: <strong style={{ color: '#00f5a0' }}>{bgSignature[hoveredBand]?.toFixed(3)}</strong>
            </div>
          )}
        </div>

        {/* Canvas Plot */}
        <div style={{ width: '100%', height: '380px', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredBand(null)}
            style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }}
          />
        </div>
      </div>

      {/* Spectral Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '20px', borderRadius: '14px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={16} style={{ color: 'var(--ai)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase' }}>Spectral Angle Mapper (SAM)</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ai)', fontFamily: 'var(--mono)' }}>
            0.342 rad
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
            High angular separation indicating distinctive non-vegetative signature.
          </p>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '20px', borderRadius: '14px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={16} style={{ color: 'var(--critical)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase' }}>Euclidean Spectral Distance</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--critical)', fontFamily: 'var(--mono)' }}>
            2.84
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
            Significant divergence from surrounding background mean in SWIR-1 and NIR channels.
          </p>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '20px', borderRadius: '14px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Info size={16} style={{ color: 'var(--ok)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase' }}>Classification Assessment</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
            {candidate?.classification || 'Synthetic / Man-Made Material'}
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
            Absence of characteristic chlorophyll absorption pit confirms unnatural target.
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      {onNavigateToSegment && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onNavigateToSegment}
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
            <span>Run Scene Segmentation (K-Means)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
