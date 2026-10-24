import React, { useState } from 'react'
import { useSession } from '../context/SessionContext'
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'

export default function CubeUploadModal() {
  const { isCubeModalOpen, closeCubeModal, uploadCustomCube } = useSession()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  if (!isCubeModalOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      uploadCustomCube(selectedFile)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 4, 10, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.15)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeCubeModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-faint)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00f0ff, #00f5a0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#040810',
            }}
          >
            <Upload size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
              Upload Hyperspectral Cube (.MAT)
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--ai)', fontFamily: 'var(--mono)' }}>
              3D NUMERIC ARRAY CALIBRATION
            </span>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          Upload MATLAB `.mat` files containing 3D hyperspectral image arrays (e.g., AVIRIS, HySpex, ROSIS). The engine will automatically detect dimensions and extract spectral signatures.
        </p>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: isDragging ? '2px dashed var(--ai)' : '2px dashed var(--border)',
            borderRadius: '14px',
            padding: '36px 20px',
            textAlign: 'center',
            background: isDragging ? 'rgba(0, 240, 255, 0.08)' : 'rgba(7, 15, 30, 0.65)',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s ease',
          }}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <input
            id="file-upload-input"
            type="file"
            accept=".mat,.hdr"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(0, 240, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: 'var(--ai)',
            }}
          >
            <Upload size={22} />
          </div>

          {selectedFile ? (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ok)', fontFamily: 'var(--mono)' }}>
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for Calibrated Ingestion
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                Drag & drop your .MAT cube here, or <span style={{ color: 'var(--ai)' }}>browse</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}>
                Supports Indian Pines, Salinas, Pavia, and custom ENVI/MAT arrays up to 200MB
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={closeCubeModal}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid var(--border-soft)',
              color: 'var(--text-dim)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              background: selectedFile ? 'linear-gradient(135deg, #00f0ff, #00f5a0)' : 'rgba(30, 58, 95, 0.5)',
              border: 'none',
              color: '#040810',
              fontSize: '13px',
              fontWeight: 700,
              cursor: selectedFile ? 'pointer' : 'not-allowed',
              opacity: selectedFile ? 1 : 0.6,
              boxShadow: selectedFile ? '0 4px 15px rgba(0, 240, 255, 0.3)' : 'none',
            }}
          >
            Ingest & Run RX Radar
          </button>
        </div>
      </div>
    </div>
  )
}
