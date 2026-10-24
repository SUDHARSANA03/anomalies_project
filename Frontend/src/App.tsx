import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import TopBar from './components/TopBar'
import StatusBar from './components/StatusBar'
import { LandingPage } from './pages/Landing/LandingPage'
import { LoginPage } from './pages/Auth/LoginPage'
import CubeStudio from './components/CubeStudio'
import RxAnomalyRadar from './components/RxAnomalyRadar'
import SpatialRefinement from './components/SpatialRefinement'
import SpectralProfiler from './components/SpectralProfiler'
import SceneSegmentation from './components/SceneSegmentation'
import ReportsExport from './components/ReportsExport'
import ProcessVisualizer from './components/ProcessVisualizer'
import CubeUploadModal from './components/CubeUploadModal'
import AuthModal from './components/AuthModal'
import { NAV_ITEMS, ViewId } from './data'
import { SessionProvider, useSession } from './context/SessionContext'
import { AuthProvider } from './context/AuthContext'

function ConsoleWorkspace() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, openAuthModal } = useSession()
  const requestedView = (location.state as any)?.view as ViewId | undefined
  // Live Demo (RX Radar) is the ONLY method allowed without sign in
  const initialView: ViewId = user ? (requestedView || 'ingest') : 'rx'
  const [activeView, setActiveView] = useState<ViewId>(initialView)

  useEffect(() => {
    const target = (location.state as any)?.view as ViewId | undefined
    if (target) {
      if (target !== 'rx' && !user) {
        setActiveView('rx')
        openAuthModal('signup')
      } else {
        setActiveView(target)
      }
    } else if (!user && activeView !== 'rx') {
      setActiveView('rx')
    }
  }, [location.state, user])

  const pillLabel = NAV_ITEMS.find((n) => n.view === activeView)?.label ?? 'Explore'

  const openView = (view: ViewId) => {
    // Live demo (rx) is the only exception without signin
    if (view !== 'rx' && !user) {
      openAuthModal('signup')
      return
    }
    setActiveView(view)
    setTimeout(() => {
      const item = document.querySelector(`.accordion-item[data-view="${view}"]`)
      if (item) {
        const y = item.getBoundingClientRect().top + window.scrollY - 104
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
      }
    }, 50)
  }

  const goHome = () => {
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <TopBar activeView={activeView} pillLabel={pillLabel} onSelect={openView} onHome={goHome} />
      <StatusBar />
      <main style={{ flex: 1, position: 'relative', width: '100%' }}>
        <div className="accordion view-shell visible" id="accordion">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.view}
              className={'accordion-item' + (activeView === item.view ? ' open' : '')}
              data-view={item.view}
            >
              <div className="accordion-body">
                <div className="accordion-body-inner">
                  {activeView === item.view && <ViewFor view={item.view} onNavigate={openView} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Global Interactive Overlays for Console */}
      <ProcessVisualizer />
    </div>
  )
}

function ViewFor({ view, onNavigate }: { view: ViewId; onNavigate: (v: ViewId) => void }) {
  switch (view) {
    case 'ingest':
      return <CubeStudio onNavigateToRx={() => onNavigate('rx')} />
    case 'rx':
      return <RxAnomalyRadar onNavigateToSpatial={() => onNavigate('spatial')} />
    case 'spatial':
      return <SpatialRefinement onNavigateToProfiler={() => onNavigate('profiler')} />
    case 'profiler':
      return <SpectralProfiler onNavigateToSegment={() => onNavigate('segment')} />
    case 'segment':
      return <SceneSegmentation onNavigateToReports={() => onNavigate('reports')} />
    case 'reports':
      return <ReportsExport />
    default:
      return <CubeStudio onNavigateToRx={() => onNavigate('rx')} />
  }
}

function AppContent() {
  const navigate = useNavigate()

  const handleNext = (view?: string) => {
    const targetView = (view as ViewId) || 'ingest'
    navigate('/console', { state: { view: targetView } })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onNext={handleNext} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Navigate to="/login?mode=signup" replace />} />
        <Route path="/profile" element={<Navigate to="/console" state={{ view: 'reports' }} replace />} />
        <Route path="/console" element={<ConsoleWorkspace />} />
        <Route path="/app" element={<ConsoleWorkspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global App-Wide Overlays (Available on Landing Page and Console) */}
      <AuthModal />
      <CubeUploadModal />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </AuthProvider>
  )
}
