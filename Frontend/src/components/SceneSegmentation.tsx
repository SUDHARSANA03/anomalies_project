import React, { useState, useRef, useEffect } from 'react'
import { useSession } from '../context/SessionContext'
import { MOCK_CLUSTERS, ClusterInfo } from '../data'
import { PieChart, Layers, Sliders, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react'

export default function SceneSegmentation({ onNavigateToReports }: { onNavigateToReports?: () => void }) {
  const { telemetry } = useSession()
  const [clusterCount, setClusterCount] = useState<number>(4)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [clusters, setClusters] = useState<ClusterInfo[]>(MOCK_CLUSTERS)
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Draw Segmented Map on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 145
    const h = 145
    canvas.width = w
    canvas.height = h

    const clusterColors = [
      [0, 240, 255],   // Electric Cyan
      [0, 245, 160],   // Tactical Emerald
      [56, 189, 248],  // Tactical Blue
      [245, 158, 11],  // Warning Amber
      [14, 165, 233],  // Deep Sky
      [16, 185, 129],  // Deep Emerald
    ]

    const img = ctx.createImageData(w, h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4

        // Multi-region pattern based on coordinates
        const val = Math.sin(x / 18) * 1.5 + Math.cos(y / 15) * 1.2 + Math.sin((x + y) / 22)
        let cId = Math.floor(Math.abs(val * 10)) % clusterCount

        if (selectedCluster !== null && cId !== selectedCluster) {
          // Dim non-selected clusters
          img.data[idx] = 20
          img.data[idx + 1] = 16
          img.data[idx + 2] = 30
          img.data[idx + 3] = 255
        } else {
          const col = clusterColors[cId % clusterColors.length]
          img.data[idx] = col[0]
          img.data[idx + 1] = col[1]
          img.data[idx + 2] = col[2]
          img.data[idx + 3] = 255
        }
      }
    }
    ctx.putImageData(img, 0, 0)
  }, [clusterCount, selectedCluster])

  const handleRerunKMeans = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
    }, 600)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--ok)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            MODULE 05
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
            UNSUPERVISED SPECTRAL CLUSTERING
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Scene Segmentation & Land-Cover Classification
        </h1>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px', maxWidth: '850px' }}>
          Unsupervised K-Means clustering partitions the 200-dimensional spectral signature space into discrete agricultural land-cover classes, demarcating crop types, soil variations, and man-made structures.
        </p>
      </div>

      {/* Cluster Settings Toolbar */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: 'var(--shadow)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
            Target Spectral Clusters (K):
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[3, 4, 5, 6].map((k) => (
              <button
                key={k}
                onClick={() => {
                  setClusterCount(k)
                  setSelectedCluster(null)
                }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: clusterCount === k ? 'linear-gradient(135deg, #00f0ff, #00f5a0)' : 'rgba(7, 15, 30, 0.65)',
                  border: clusterCount === k ? 'none' : '1px solid var(--border-soft)',
                  color: clusterCount === k ? '#040810' : '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleRerunKMeans}
          disabled={isProcessing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #34d399, #059669)',
            border: 'none',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.7 : 1,
            boxShadow: '0 4px 15px rgba(52, 211, 153, 0.25)',
          }}
        >
          <RefreshCw size={15} className={isProcessing ? 'animate-spin' : ''} />
          <span>{isProcessing ? 'Clustering...' : 'Execute K-Means'}</span>
        </button>
      </div>

      {/* Main Grid: Segmented Map vs Cluster Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: '24px', alignItems: 'start', marginBottom: '28px' }}>
        {/* Left: Canvas Segmented Map */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              K-Means Cluster Map (K={clusterCount})
            </span>
            {selectedCluster !== null && (
              <button
                onClick={() => setSelectedCluster(null)}
                style={{ background: 'none', border: 'none', color: 'var(--ai)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                Reset Filter
              </button>
            )}
          </div>

          <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', background: '#05040a', border: '1px solid var(--border-soft)' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '12px', margin: '12px 0 0 0' }}>
            Click on any land-cover cluster card to the right to isolate its spatial distribution.
          </p>
        </div>

        {/* Right: Cluster Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {clusters.slice(0, clusterCount).map((cl, idx) => {
            const isSelected = selectedCluster === idx
            return (
              <div
                key={cl.clusterId}
                onClick={() => setSelectedCluster(isSelected ? null : idx)}
                style={{
                  background: isSelected ? 'rgba(30, 22, 45, 0.95)' : 'var(--panel)',
                  border: isSelected ? `1px solid ${cl.color}` : '1px solid var(--border-soft)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? `0 0 20px ${cl.color}25` : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: cl.color, display: 'inline-block' }}></span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                      Cluster #{cl.clusterId}: {cl.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: cl.color, fontFamily: 'var(--mono)' }}>
                    {cl.percentage}%
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                  {cl.description}
                </p>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(10, 8, 16, 0.7)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${cl.percentage}%`, height: '100%', background: cl.color, borderRadius: '3px' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}>
                  <span>{cl.pixelCount.toLocaleString()} Pixels</span>
                  <span>Centroid Distance: {(1.2 + idx * 0.4).toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      {onNavigateToReports && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onNavigateToReports}
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
            <span>Generate Intelligence Report</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
