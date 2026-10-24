import React from 'react'
import CountUp from './CountUp'
import { useSession } from '../context/SessionContext'

export default function StatusBar() {
  const { backendConnected, telemetry, pipelineStage } = useSession()

  return (
    <div className="statusbar">
      <div className="item">
        <span className={`dot ${backendConnected ? 'on' : 'crit'}`}></span>
        FastAPI Spectral Engine{' '}
        <span className="val">{backendConnected ? 'connected (8000)' : 'standby mode'}</span>
      </div>
      <span className="sep">/</span>
      <div className="item">
        Active Cube <span className="val" style={{ color: 'var(--text)' }}>{telemetry.datasetName}</span>
      </div>
      <span className="sep">/</span>
      <div className="item">
        Sensitivity Threshold <span className="val" style={{ color: 'var(--ai)' }}>{telemetry.activeThreshold}% Cutoff</span>
      </div>
      <span className="sep">/</span>
      <div className="item">
        <span className={`dot ${telemetry.anomalyPixels > 0 ? 'crit' : 'on'}`}></span>
        Anomaly Pixels <CountUp target={telemetry.anomalyPixels} />
      </div>
      <span className="sep">/</span>
      <div className="item">
        Candidate Targets <CountUp target={telemetry.candidates.length} />
      </div>
      <span className="sep">/</span>
      <div className="item">
        <span className="dot on"></span>
        Core Status{' '}
        <span className="val" style={{ color: 'var(--ok)' }}>
          {pipelineStage === 'calibrating'
            ? 'Calibrating Cube...'
            : pipelineStage === 'rx_covariance'
            ? 'Computing RX Covariance...'
            : pipelineStage === 'morphology'
            ? 'Filtering Noise...'
            : 'Reed-Xiaoli (RX) Ready'}
        </span>
      </div>
    </div>
  )
}
