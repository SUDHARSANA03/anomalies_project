import React, { useEffect, useRef } from 'react'
import { useSession, PipelineStage } from '../context/SessionContext'
import { Layers, Activity, Scan, Target, CheckCircle2, X } from 'lucide-react'

interface StepConfig {
  id: PipelineStage
  label: string
  desc: string
}

const STAGES: StepConfig[] = [
  { id: 'calibrating', label: '1. Ingest & Normalization', desc: 'Read 3D cube float array & calibrate dynamic range' },
  { id: 'rx_covariance', label: '2. RX Mahalanobis Distance', desc: 'Compute scene background mean and inverse covariance matrix K⁻¹' },
  { id: 'morphology', label: '3. Morphological Noise Filter', desc: 'Apply OpenCV 3×3 opening & connected component analysis' },
  { id: 'spectral_profiling', label: '4. Spectral Profiling', desc: 'Decompose 200-band reflectance curves across 0.4µm – 2.5µm' },
  { id: 'completed', label: '5. Pipeline Ready', desc: 'Targets georeferenced and registered in mission dossier' },
]

export default function ProcessVisualizer() {
  const {
    isVisualizerOpen,
    pipelineStage,
    pipelineProgress,
    pipelineLogs,
    closeVisualizer,
  } = useSession()

  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [pipelineLogs])

  if (!isVisualizerOpen) return null

  const getStageStatus = (stageId: PipelineStage) => {
    const stageOrder: PipelineStage[] = ['calibrating', 'rx_covariance', 'morphology', 'spectral_profiling', 'completed']
    const currentIndex = stageOrder.indexOf(pipelineStage)
    const thisIndex = stageOrder.indexOf(stageId)

    if (pipelineStage === 'failed') {
      if (thisIndex <= currentIndex) return 'error'
      return 'pending'
    }

    if (pipelineStage === 'completed') return 'done'
    if (thisIndex < currentIndex) return 'done'
    if (thisIndex === currentIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="process-overlay">
      <div className="process-modal reveal-up in-view" style={{ maxWidth: '640px' }}>
        <div className="process-header">
          <div className="process-title-group">
            <span className="process-badge">ANOMALY TELEMETRY ENGINE</span>
            <h3>Hyperspectral Pipeline Execution</h3>
          </div>
          <button className="process-close" onClick={closeVisualizer} title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="process-bar-track">
          <div
            className="process-bar-fill"
            style={{
              width: `${pipelineProgress}%`,
              background: 'linear-gradient(90deg, #00f0ff, #00f5a0)',
            }}
          />
        </div>

        {/* Step Items */}
        <div className="process-steps">
          {STAGES.map((step) => {
            const status = getStageStatus(step.id)
            return (
              <div key={step.id} className={`process-step ${status}`}>
                <div className="step-indicator">
                  {status === 'done' ? (
                    <CheckCircle2 size={16} style={{ color: '#34d399' }} />
                  ) : status === 'active' ? (
                    <span className="step-spinner" />
                  ) : (
                    <span className="step-dot" />
                  )}
                </div>
                <div className="step-info">
                  <div className="step-label">{step.label}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live Execution Logs */}
        <div className="process-logs-section">
          <div className="process-logs-header">
            <span>EXECUTION TELEMETRY LOGS</span>
            <span className="log-count">{pipelineLogs.length} events</span>
          </div>
          <div className="process-logs-container">
            {pipelineLogs.map((log) => (
              <div key={log.id} className={`process-log-line ${log.type}`}>
                <span className="log-time">{log.time}</span>
                <span className="log-msg">{log.text}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
