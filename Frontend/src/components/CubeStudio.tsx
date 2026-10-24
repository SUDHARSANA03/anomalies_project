import React, { useState, useRef, useEffect } from 'react'
import { DATASET_OPTIONS, DatasetOption } from '../data'
import { useSession } from '../context/SessionContext'
import { Layers, Database, Sparkles, Sliders, Upload, CheckCircle2, ArrowRight } from 'lucide-react'

export default function CubeStudio({ onNavigateToRx }: { onNavigateToRx?: () => void }) {
  const { telemetry, loadDataset, openCubeModal } = useSession()
  const [selectedDataset, setSelectedDataset] = useState<string>('pines')
  const [redBand, setRedBand] = useState<number>(29)
  const [greenBand, setGreenBand] = useState<number>(19)
  const [blueBand, setBlueBand] = useState<number>(9)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Synthesize false-color RGB on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 145
    const h = 145
    canvas.width = w
    canvas.height = h

    const imgData = ctx.createImageData(w, h)
    const data = imgData.data

    // Generate false color synthetic simulation
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        // Agricultural field pattern
        const fieldGrid = Math.sin(x / 14) * Math.cos(y / 14)
        const subStripe = Math.sin(x / 4) * 0.15

        // RGB channel variation by chosen bands
        const rVal = Math.floor(120 + 80 * Math.sin((x + redBand * 3) / 12) + fieldGrid * 40)
        const gVal = Math.floor(70 + 60 * Math.cos((y + greenBand * 2) / 10) + subStripe * 50)
        const bVal = Math.floor(90 + 90 * Math.sin((x + y + blueBand * 4) / 18) + fieldGrid * 30)

        data[idx] = Math.min(255, Math.max(20, rVal))
        data[idx + 1] = Math.min(255, Math.max(30, gVal))
        data[idx + 2] = Math.min(255, Math.max(40, bVal))
        data[idx + 3] = 255
      }
    }
    ctx.putImageData(imgData, 0, 0)
  }, [redBand, greenBand, blueBand])

  const handleSelectDataset = (id: string) => {
    setSelectedDataset(id)
    loadDataset(id)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge" style={{ background: 'rgba(199, 125, 255, 0.15)', color: 'var(--ai)', border: '1px solid rgba(199, 125, 255, 0.3)' }}>
            MODULE 01
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
            AVIRIS HYPERSPECTRAL TELEMETRY
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Cube Ingestion & False-Color Band Studio
        </h1>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px', maxWidth: '800px' }}>
          Calibrate high-dimensional spectral radiance cubes, isolate discrete contiguous bands across 0.4µm – 2.5µm, and synthesize false-color RGB composites for scene visual inspection.
        </p>
      </div>

      {/* Dataset Benchmark Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {DATASET_OPTIONS.map((ds) => {
          const isSelected = selectedDataset === ds.id
          return (
            <div
              key={ds.id}
              onClick={() => handleSelectDataset(ds.id)}
              style={{
                padding: '20px',
                borderRadius: '14px',
                background: isSelected ? 'rgba(30, 22, 45, 0.95)' : 'rgba(21, 17, 31, 0.65)',
                border: isSelected ? '1px solid var(--ai)' : '1px solid var(--border-soft)',
                boxShadow: isSelected ? '0 0 20px rgba(199, 125, 255, 0.2)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isSelected ? 'linear-gradient(135deg, #00f0ff, #00f5a0)' : 'rgba(30, 58, 95, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#040810' : '#00f0ff',
                    }}
                  >
                    <Database size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{ds.name}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--ai)', fontFamily: 'var(--mono)' }}>{ds.sensor}</span>
                  </div>
                </div>
                {isSelected && <CheckCircle2 size={18} style={{ color: 'var(--ai)' }} />}
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.5 }}>
                {ds.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontFamily: 'var(--mono)' }}>
                <div style={{ background: 'rgba(10, 8, 16, 0.6)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-soft)' }}>
                  <span style={{ color: 'var(--text-faint)' }}>SHAPE: </span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{ds.dimensions}</span>
                </div>
                <div style={{ background: 'rgba(10, 8, 16, 0.6)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-soft)' }}>
                  <span style={{ color: 'var(--text-faint)' }}>RES: </span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{ds.spatialResolution}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Studio Workspace: False-Color Synthesis & Band Tuner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Interactive Canvas Screen */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Synthesized False-Color Composite
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ok)', background: 'rgba(52, 211, 153, 0.12)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              CALIBRATED
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#05040a',
              border: '1px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                imageRendering: 'pixelated',
              }}
            />
            {/* Reticle Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                border: '1px dashed rgba(199, 125, 255, 0.25)',
                margin: '12px',
                borderRadius: '8px',
              }}
            />
            <div style={{ position: 'absolute', bottom: '12px', left: '16px', background: 'rgba(10, 8, 16, 0.85)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--mono)', border: '1px solid var(--border-soft)' }}>
              RGB: B{redBand} / B{greenBand} / B{blueBand}
            </div>
          </div>
        </div>

        {/* Right: Band Tuning Sliders & Telemetry Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Band Sliders Card */}
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Sliders size={18} style={{ color: 'var(--ai)' }} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                Contiguous Band Selection (0 - {telemetry.dimensions.bands} Bands)
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px' }}>
              Map specific wavelength bands to Red, Green, and Blue rendering pipelines to differentiate canopy moisture, chlorophyll absorption, and soil reflectance.
            </p>

            {/* Red Band Slider */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--critical)', fontWeight: 600 }}>RED CHANNEL (NIR / Chlorophyll)</span>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>Band {redBand} (~{(400 + redBand * 10.5).toFixed(0)} nm)</span>
              </div>
              <input
                type="range"
                min={1}
                max={telemetry.dimensions.bands}
                value={redBand}
                onChange={(e) => setRedBand(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--critical)', cursor: 'pointer' }}
              />
            </div>

            {/* Green Band Slider */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--ok)', fontWeight: 600 }}>GREEN CHANNEL (Vegetation Peak)</span>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>Band {greenBand} (~{(400 + greenBand * 10.5).toFixed(0)} nm)</span>
              </div>
              <input
                type="range"
                min={1}
                max={telemetry.dimensions.bands}
                value={greenBand}
                onChange={(e) => setGreenBand(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--ok)', cursor: 'pointer' }}
              />
            </div>

            {/* Blue Band Slider */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--ai)', fontWeight: 600 }}>BLUE CHANNEL (Water / Blue Visible)</span>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>Band {blueBand} (~{(400 + blueBand * 10.5).toFixed(0)} nm)</span>
              </div>
              <input
                type="range"
                min={1}
                max={telemetry.dimensions.bands}
                value={blueBand}
                onChange={(e) => setBlueBand(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--ai)', cursor: 'pointer' }}
              />
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={openCubeModal}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: 'rgba(199, 125, 255, 0.1)',
                  border: '1px solid rgba(199, 125, 255, 0.3)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Upload size={16} style={{ color: 'var(--ai)' }} />
                <span>Upload Custom .MAT Cube</span>
              </button>

              {onNavigateToRx && (
                <button
                  onClick={onNavigateToRx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 18px',
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
                  <span>Execute RX Radar</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border-soft)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Spatial Dimension</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
                {telemetry.dimensions.height} × {telemetry.dimensions.width} px
              </div>
            </div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border-soft)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Spectral Channels</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ai)', marginTop: '4px' }}>
                {telemetry.dimensions.bands} Bands
              </div>
            </div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border-soft)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Total Voxel Elements</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ok)', marginTop: '4px' }}>
                {(telemetry.totalPixels * telemetry.dimensions.bands).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
