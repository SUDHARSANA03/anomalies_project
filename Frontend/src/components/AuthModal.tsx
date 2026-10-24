import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { X, ShieldCheck, UserCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    loginUser,
    signupUser,
    loginWithCredentials,
  } = useSession()

  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isAuthModalOpen) return null

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const res = await loginWithCredentials(email || 'operator@hypersense.ai', password || 'hypersense2026')
      if (res.success) {
        setSuccessMessage('Operator authenticated against SQLite database.')
        setTimeout(() => {
          setIsSubmitting(false)
          closeAuthModal()
          navigate('/console')
        }, 300)
      } else {
        setIsSubmitting(false)
        setErrorMessage(res.error || 'Invalid email/username or password')
      }
    } catch (err: any) {
      setIsSubmitting(false)
      setErrorMessage(err.message || 'Authentication error')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    if (!email || !password) {
      setIsSubmitting(false)
      setErrorMessage('Please provide an email and password')
      return
    }

    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')

    try {
      const res = await signupUser(email, username, password, name || username)
      if (res.success) {
        setSuccessMessage('Operator account created & persisted in SQLite database!')
        setTimeout(() => {
          setIsSubmitting(false)
          closeAuthModal()
          navigate('/console')
        }, 400)
      } else {
        setIsSubmitting(false)
        setErrorMessage(res.error || 'Failed to register account')
      }
    } catch (err: any) {
      setIsSubmitting(false)
      setErrorMessage(err.message || 'Registration error')
    }
  }

  const handleDemoLogin = () => {
    loginUser({
      name: 'Lead Spectral Operator',
      email: 'operator@hypersense.ai',
      role: 'Lead Remote Sensing Scientist',
    })
    closeAuthModal()
    navigate('/console')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(3, 7, 18, 0.92)',
        backdropFilter: 'blur(16px)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#070f1e',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 240, 255, 0.15)',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: '#00f0ff', textTransform: 'uppercase', fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px' }}>
            DATABASE &bull; HYPERSENSE OPERATOR ACCESS
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', color: '#f8fafc' }}>
            {authModalMode === 'login' ? 'Sign In to Console' : 'Create Operator Account'}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            {authModalMode === 'login' 
              ? 'Access authenticated mission control, custom cube storage, and full analysis.' 
              : 'Sign up to unlock custom uploads, morphology filters, continuous profiling, and reports.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e3a5f', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { openAuthModal('signup'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: authModalMode === 'signup' ? '2px solid #00f0ff' : '2px solid transparent',
              color: authModalMode === 'signup' ? '#00f0ff' : '#64748b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign Up (Unlock All)
          </button>
          <button
            type="button"
            onClick={() => { openAuthModal('login'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: authModalMode === 'login' ? '2px solid #00f0ff' : '2px solid transparent',
              color: authModalMode === 'login' ? '#00f0ff' : '#64748b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '12px', marginBottom: '16px' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(0, 245, 160, 0.15)', border: '1px solid rgba(0, 245, 160, 0.3)', borderRadius: '8px', color: '#00f5a0', fontSize: '12px', marginBottom: '16px' }}>
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={authModalMode === 'login' ? handleSignIn : handleSignUp}>
          {authModalMode === 'signup' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--mono)', marginBottom: '6px' }}>
                Full Name / Callsign
              </label>
              <input
                type="text"
                placeholder="Dr. Sarah Mitchell"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(4, 8, 16, 0.8)',
                  border: '1px solid #1e3a5f',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--mono)', marginBottom: '6px' }}>
              Institutional Email / Username
            </label>
            <input
              type="text"
              placeholder={authModalMode === 'login' ? 'operator@hypersense.ai or spectral_lead' : 'operator@hypersense.ai'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(4, 8, 16, 0.8)',
                border: '1px solid #1e3a5f',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--mono)', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(4, 8, 16, 0.8)',
                border: '1px solid #1e3a5f',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f0ff, #00f5a0)',
              border: 'none',
              color: '#040810',
              fontSize: '13px',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(0, 240, 255, 0.3)',
              marginBottom: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {isSubmitting ? 'Authenticating with SQLite Database...' : authModalMode === 'login' ? 'Sign In to Console' : 'Sign Up & Unlock Full Suite'}
          </button>
        </form>

        {/* Demo Fast Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(0, 240, 255, 0.06)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            color: '#00f0ff',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <UserCheck size={15} />
          <span>Quick Demo Operator Access</span>
        </button>
      </div>
    </div>
  )
}
