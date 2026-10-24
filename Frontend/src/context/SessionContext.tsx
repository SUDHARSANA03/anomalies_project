import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { HyperspectralTelemetry, INITIAL_TELEMETRY, CandidateRegion, ClusterInfo } from '../data'
import { apiService } from '../services/api'

export type PipelineStage = 'idle' | 'calibrating' | 'rx_covariance' | 'morphology' | 'spectral_profiling' | 'completed' | 'failed'

export interface PipelineLogItem {
  id: number
  time: string
  text: string
  type: 'info' | 'success' | 'warn' | 'error'
}

export interface UserProfile {
  id?: number | string
  name: string
  email: string
  role: string
}

interface SessionContextType {
  telemetry: HyperspectralTelemetry
  backendConnected: boolean
  user: UserProfile | null
  loginUser: (userData: UserProfile) => void
  logoutUser: () => void
  requireAuth: (action: () => void, mode?: 'login' | 'signup') => boolean
  signupUser: (email: string, username: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>
  loginWithCredentials: (emailOrUser: string, pass: string) => Promise<{ success: boolean; error?: string }>
  // Auth modal
  isAuthModalOpen: boolean
  authModalMode: 'login' | 'signup'
  openAuthModal: (mode?: 'login' | 'signup') => void
  closeAuthModal: () => void
  // Cube upload modal
  isCubeModalOpen: boolean
  openCubeModal: () => void
  closeCubeModal: () => void
  // Visualizer / Radar Processing
  isVisualizerOpen: boolean
  pipelineStage: PipelineStage
  pipelineProgress: number
  pipelineLogs: PipelineLogItem[]
  closeVisualizer: () => void
  // Actions
  setThreshold: (newThreshold: number) => Promise<void>
  loadDataset: (datasetId: string) => Promise<void>
  uploadCustomCube: (file: File) => Promise<void>
  selectedCandidate: CandidateRegion | null
  setSelectedCandidate: (candidate: CandidateRegion | null) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<HyperspectralTelemetry>(INITIAL_TELEMETRY)
  const [backendConnected, setBackendConnected] = useState<boolean>(true)
  
  // Default to guest (null) unless previously logged in
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('hypersense_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup')
  const [isCubeModalOpen, setIsCubeModalOpen] = useState(false)
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false)
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle')
  const [pipelineProgress, setPipelineProgress] = useState(0)
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLogItem[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRegion | null>(INITIAL_TELEMETRY.candidates[0] || null)

  // Periodic health check
  useEffect(() => {
    let mounted = true
    const check = async () => {
      const ok = await apiService.checkHealth()
      if (mounted) setBackendConnected(ok)
    }
    check()
    const interval = setInterval(check, 10000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const loginUser = (userData: UserProfile) => {
    setUser(userData)
    try {
      localStorage.setItem('hypersense_user', JSON.stringify(userData))
    } catch (e) {
      console.warn('Could not save user to localStorage', e)
    }
    setIsAuthModalOpen(false)
  }

  const logoutUser = () => {
    setUser(null)
    try {
      localStorage.removeItem('hypersense_user')
    } catch {}
  }

  const openAuthModal = (mode: 'login' | 'signup' = 'signup') => {
    setAuthModalMode(mode)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => setIsAuthModalOpen(false)

  // Gating helper: if authenticated, run action; if guest, open signup modal
  const requireAuth = (action: () => void, mode: 'login' | 'signup' = 'signup'): boolean => {
    if (user) {
      action()
      return true
    }
    openAuthModal(mode)
    return false
  }

  const signupUser = async (email: string, username: string, pass: string, name?: string) => {
    const res = await apiService.signup(email, username, pass, name)
    if (res.success && res.user) {
      const profile: UserProfile = {
        id: res.user.id,
        name: res.user.full_name || res.user.username,
        email: res.user.email,
        role: res.user.role || 'Hyperspectral Operator',
      }
      loginUser(profile)
      return { success: true }
    }
    return { success: false, error: res.error || 'Failed to create account in database' }
  }

  const loginWithCredentials = async (emailOrUser: string, pass: string) => {
    const res = await apiService.login(emailOrUser, pass)
    if (res.success && res.user) {
      const profile: UserProfile = {
        id: res.user.id,
        name: res.user.full_name || res.user.username,
        email: res.user.email,
        role: res.user.role || 'Hyperspectral Operator',
      }
      loginUser(profile)
      return { success: true }
    }
    return { success: false, error: res.error || 'Invalid credentials' }
  }

  const openCubeModal = () => {
    requireAuth(() => setIsCubeModalOpen(true), 'signup')
  }
  const closeCubeModal = () => setIsCubeModalOpen(false)
  const closeVisualizer = () => setIsVisualizerOpen(false)

  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setPipelineLogs((prev) => [...prev, { id: Date.now() + Math.random(), time, text, type }])
  }

  const loadDataset = async (datasetId: string) => {
    setIsVisualizerOpen(true)
    setPipelineStage('calibrating')
    setPipelineProgress(15)
    setPipelineLogs([])
    addLog(`Ingesting hyperspectral telemetry dataset: ${datasetId}`, 'info')

    setTimeout(() => {
      setPipelineStage('rx_covariance')
      setPipelineProgress(55)
      addLog('Computing inverse scene covariance matrix K^-1 across 200 spectral bands...', 'info')
    }, 400)

    setTimeout(() => {
      setPipelineStage('morphology')
      setPipelineProgress(85)
      addLog('Executing morphological opening/closing noise suppression filters...', 'info')
    }, 900)

    setTimeout(async () => {
      const res = await apiService.loadBenchmark(datasetId)
      setTelemetry(res.data)
      if (res.data.candidates.length > 0) {
        setSelectedCandidate(res.data.candidates[0])
      }
      setPipelineStage('completed')
      setPipelineProgress(100)
      addLog(`Analysis complete. Extracted ${res.data.candidateCount} discrete anomaly targets.`, 'success')
      setTimeout(() => {
        setIsVisualizerOpen(false)
      }, 1200)
    }, 1400)
  }

  const setThreshold = async (newThreshold: number) => {
    const updated = await apiService.updateThreshold(newThreshold, telemetry)
    setTelemetry(updated)
    if (updated.candidates.length > 0 && !updated.candidates.find((c) => c.id === selectedCandidate?.id)) {
      setSelectedCandidate(updated.candidates[0])
    }
  }

  const uploadCustomCube = async (file: File) => {
    setIsVisualizerOpen(true)
    setPipelineStage('calibrating')
    setPipelineProgress(20)
    setPipelineLogs([])
    addLog(`Ingesting uploaded cube: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`, 'info')

    setTimeout(() => {
      setPipelineStage('rx_covariance')
      setPipelineProgress(60)
      addLog('Extracting 3D float array & computing Mahalanobis background distance...', 'info')
    }, 600)

    setTimeout(async () => {
      const res = await apiService.uploadCube(file)
      setTelemetry(res.data)
      if (res.data.candidates.length > 0) {
        setSelectedCandidate(res.data.candidates[0])
      }
      setPipelineStage('completed')
      setPipelineProgress(100)
      addLog(`Cube calibrated successfully. Dimension: ${res.data.dimensions.height}x${res.data.dimensions.width}x${res.data.dimensions.bands}`, 'success')
      setIsCubeModalOpen(false)
      setTimeout(() => setIsVisualizerOpen(false), 1200)
    }, 1500)
  }

  return (
    <SessionContext.Provider
      value={{
        telemetry,
        backendConnected,
        user,
        loginUser,
        logoutUser,
        requireAuth,
        signupUser,
        loginWithCredentials,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isCubeModalOpen,
        openCubeModal,
        closeCubeModal,
        isVisualizerOpen,
        pipelineStage,
        pipelineProgress,
        pipelineLogs,
        closeVisualizer,
        setThreshold,
        loadDataset,
        uploadCustomCube,
        selectedCandidate,
        setSelectedCandidate,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used within SessionProvider')
  return context
}
