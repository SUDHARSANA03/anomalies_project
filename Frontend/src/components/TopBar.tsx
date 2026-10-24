import React, { useEffect, useState } from 'react'
import { NAV_ITEMS, ViewId } from '../data'
import { useSession } from '../context/SessionContext'
import { Upload, Satellite, User, LogOut, ArrowLeft, ShieldCheck, Sparkles, Lock } from 'lucide-react'

interface Props {
  activeView: ViewId | null
  pillLabel: string
  onSelect: (view: ViewId) => void
  onHome: () => void
}

export default function TopBar({ activeView, onSelect, onHome }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const { user, openAuthModal, logoutUser, openCubeModal } = useSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (view: ViewId) => {
    // Live demo (rx radar) is the ONLY exception allowed without signin
    if (view === 'rx' || user) {
      onSelect(view)
    } else {
      openAuthModal('signup')
    }
  }

  return (
    <div className={'topbar-wrap' + (scrolled ? ' scrolled' : '')} id="topbarWrap">
      <div className="topbar">
        {/* Dedicated Return to Frontpage Button */}
        <button
          onClick={onHome}
          className="frontpage-btn"
          title="Return to HyperSense AI Landing Page"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: '#00f0ff',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            marginRight: '10px',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={13} />
          <span>← Frontpage</span>
        </button>

        {/* Brand */}
        <div
          className="brand"
          role="button"
          tabIndex={0}
          aria-label="Go to HyperSense AI home page"
          onClick={onHome}
          title="Click to return to frontpage"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onHome()
            }
          }}
        >
          <span className="mark" style={{ background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }}></span>
          <b>HYPERSENSE AI</b>
          <span className="badge" style={{ background: 'rgba(0, 245, 160, 0.12)', color: '#00f5a0', borderColor: 'rgba(0, 245, 160, 0.3)' }}>SPECTRAL CORE</span>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', marginLeft: '12px' }}>
          {NAV_ITEMS.map((item) => {
            const isProtected = item.view !== 'rx' && !user
            const isDemo = item.view === 'rx'
            return (
              <button
                key={item.view}
                className={activeView === item.view ? 'active' : ''}
                onClick={() => handleNavClick(item.view)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  opacity: isProtected ? 0.75 : 1,
                  position: 'relative'
                }}
                title={isProtected ? 'Operator Sign Up required to unlock this module' : isDemo ? 'Live Demo Mode (No signin required)' : item.label}
              >
                <span className="nav-num">{item.num}</span>
                <span>{item.label}</span>
                {isDemo && !user && (
                  <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(0, 245, 160, 0.2)', color: '#00f5a0', fontWeight: 800 }}>DEMO</span>
                )}
                {isProtected && (
                  <Lock size={10} style={{ color: '#94a3b8', marginLeft: '2px' }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          {/* Upload Cube Button (requires auth) */}
          <button
            onClick={openCubeModal}
            className="secondary-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              color: '#00f0ff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Upload size={14} style={{ color: '#00f0ff' }} />
            <span>Upload Cube</span>
            {!user && <Lock size={10} style={{ opacity: 0.6 }} />}
          </button>

          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 6px',
                borderRadius: '20px',
                background: 'rgba(10, 18, 32, 0.95)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f0ff, #00f5a0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '11px',
                  color: '#040810',
                }}
              >
                {user.name.charAt(0)}
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{user.name}</span>
              <button
                onClick={logoutUser}
                title="Sign Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => openAuthModal('login')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(14, 27, 46, 0.9)',
                  border: '1px solid rgba(30, 51, 77, 0.8)',
                  color: '#e2e8f0',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00f0ff, #00f5a0)',
                  border: 'none',
                  color: '#040810',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
