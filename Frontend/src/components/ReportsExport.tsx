import React, { useState } from 'react'
import { useSession } from '../context/SessionContext'
import { FileText, Download, Check, Copy, ShieldCheck, Share2, Layers, Database } from 'lucide-react'

export default function ReportsExport() {
  const { telemetry, user } = useSession()
  const [copied, setCopied] = useState<boolean>(false)

  // Construct Dossier JSON
  const reportPayload = {
    platform: 'HyperSense AI — Hyperspectral Anomaly Intelligence Platform',
    version: '2.4.0-SPECTRAL-CORE',
    timestamp: new Date().toISOString(),
    operator: {
      name: user?.name || 'Dr. Sarah Mitchell',
      role: user?.role || 'Lead Remote Sensing Scientist',
    },
    missionSummary: {
      dataset: telemetry.datasetName,
      sensor: telemetry.sensor,
      spatialDimensions: `${telemetry.dimensions.height} x ${telemetry.dimensions.width} px`,
      spectralBands: telemetry.dimensions.bands,
      totalVoxels: telemetry.totalPixels * telemetry.dimensions.bands,
      rxPercentileCutoff: `${telemetry.activeThreshold}%`,
      anomalyPixelsIsolated: telemetry.anomalyPixels,
      peakMahalanobisDistance: telemetry.peakRxScore,
      meanBackgroundDistance: telemetry.meanRxScore,
    },
    candidateTargets: telemetry.candidates.map((c) => ({
      targetId: c.id,
      centroidCoordinates: { x: c.centroid[0], y: c.centroid[1] },
      spatialBoundingBox: { x: c.x, y: c.y, width: c.width, height: c.height },
      areaPixels: c.area,
      meanRxScore: c.meanScore,
      peakRxScore: c.maxScore,
      anomalyConfidence: `${c.confidence.toFixed(1)}%`,
      classification: c.classification,
    })),
    landCoverSegmentation: telemetry.clusters.map((cl) => ({
      clusterId: cl.clusterId,
      name: cl.name,
      coveragePercentage: `${cl.percentage}%`,
      pixelCount: cl.pixelCount,
    })),
  }

  const jsonString = JSON.stringify(reportPayload, null, 2)

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hypersense_anomaly_report_${telemetry.datasetName.replace('.mat', '')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadCSV = () => {
    const headers = ['Target_ID', 'Centroid_X', 'Centroid_Y', 'Area_Pixels', 'Mean_RX', 'Peak_RX', 'Confidence_Pct', 'Classification']
    const rows = telemetry.candidates.map((c) => [
      c.id,
      c.centroid[0].toFixed(2),
      c.centroid[1].toFixed(2),
      c.area,
      c.meanScore.toFixed(2),
      c.maxScore.toFixed(2),
      c.confidence.toFixed(1),
      `"${c.classification}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hypersense_target_catalog_${telemetry.datasetName.replace('.mat', '')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge" style={{ background: 'rgba(199, 125, 255, 0.15)', color: 'var(--ai)', border: '1px solid rgba(199, 125, 255, 0.3)' }}>
            MODULE 06
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
            MISSION DOSSIER & INTELLIGENCE AUDIT
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Intelligence Reports & Geospatial Anomaly Export
        </h1>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px', maxWidth: '850px' }}>
          Compile verified anomaly detections, continuous spectral distance profiles, and land-cover cluster distributions into audit-ready JSON and CSV geospatial target packages.
        </p>
      </div>

      {/* Export Toolbar & Metrics Summary */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f0ff, #00f5a0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#040810',
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
              Mission Dossier: {telemetry.datasetName}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              {telemetry.candidates.length} Candidate Targets Isolated &bull; {telemetry.dimensions.bands} Continuous Spectral Channels
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadJSON}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f0ff, #00f5a0)',
              border: 'none',
              color: '#040810',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 240, 255, 0.25)',
            }}
          >
            <Download size={15} />
            <span>Export JSON Dossier</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              color: 'var(--ok)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Download size={15} />
            <span>Export CSV Catalog</span>
          </button>

          <button
            onClick={handleCopyJSON}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(10, 8, 16, 0.65)',
              border: '1px solid var(--border-soft)',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={15} style={{ color: 'var(--ok)' }} /> : <Copy size={15} />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>
      </div>

      {/* JSON Viewer Card */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Structured Mission Dossier Payload (JSON)
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ok)', fontFamily: 'var(--mono)' }}>
            VALIDATED SCHEMAS
          </span>
        </div>

        <pre
          style={{
            background: '#040810',
            border: '1px solid var(--border-soft)',
            borderRadius: '12px',
            padding: '20px',
            fontSize: '12px',
            fontFamily: 'var(--mono)',
            color: '#00f0ff',
            maxHeight: '480px',
            overflowY: 'auto',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {jsonString}
        </pre>
      </div>
    </div>
  )
}
