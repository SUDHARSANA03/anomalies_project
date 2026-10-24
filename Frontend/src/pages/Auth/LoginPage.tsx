import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Mail, User, Shield, ArrowRight, Sparkles, CheckCircle, Database, Key, Check, Zap, Laptop, ShieldCheck, Crosshair } from 'lucide-react'
import { InteractiveBackground } from '../../components/ui/InteractiveBackground'
import { Footer } from '../../components/common/Footer'
import { useSession } from '../../context/SessionContext'

interface MockAccount {
  id: string
  name: string
  role: string
  email: string
  pass: string
  avatarBg: string
  badgeText: string
}

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'lead_scientist',
    name: 'Dr. Sarah Mitchell',
    role: 'Lead Remote Sensing Scientist',
    email: 'operator@hypersense.ai',
    pass: 'hypersense2026',
    avatarBg: 'linear-gradient(135deg, #00f0ff, #00f5a0)',
    badgeText: 'DIRECTOR',
  },
  {
    id: 'spectral_analyst',
    name: 'Dr. Alex Rivera',
    role: 'AVIRIS Spectral Analyst',
    email: 'a.rivera@hypersense.ai',
    pass: 'hypersense2026',
    avatarBg: 'linear-gradient(135deg, #00f5a0, #38bdf8)',
    badgeText: 'ANALYST',
  },
  {
    id: 'earth_obs',
    name: 'Marcus Chen',
    role: 'Earth Observation Engineer',
    email: 'm.chen@hypersense.ai',
    pass: 'hypersense2026',
    avatarBg: 'linear-gradient(135deg, #38bdf8, #00f0ff)',
    badgeText: 'SENSOR',
  },
]

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'

  const { loginUser, loginWithCredentials, signupUser } = useSession()

  const [mode, setMode] = useState<'signin' | 'signup'>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Remote Sensing Scientist')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const handleSelectPreset = (acc: MockAccount) => {
    setSelectedPreset(acc.id)
    setEmail(acc.email)
    setPassword(acc.pass)
    setFullName(acc.name)
    setRole(acc.role)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    if (mode === 'signup') {
      const username = (email.split('@')[0] || 'operator').replace(/[^a-zA-Z0-9_]/g, '_')
      const res = await signupUser(email || 'operator@hypersense.ai', username, password || 'hypersense2026', fullName || username)
      setIsLoading(false)
      if (res.success) {
        navigate('/console')
      } else {
        setErrorMsg(res.error || 'Failed to create operator account')
      }
    } else {
      const res = await loginWithCredentials(email || 'operator@hypersense.ai', password || 'hypersense2026')
      setIsLoading(false)
      if (res.success) {
        navigate('/console')
      } else {
        setErrorMsg(res.error || 'Invalid credentials. You can use operator@hypersense.ai / hypersense2026')
      }
    }
  }

  return (
    <div className="relative min-h-screen bg-[#040810] text-[#f8fafc] overflow-hidden selection:bg-[#00f0ff] selection:text-[#040810] font-sans flex flex-col justify-between">
      <InteractiveBackground />

      {/* Header */}
      <header className="relative z-30 max-w-7xl mx-auto px-6 py-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00f0ff] via-[#00f5a0] to-[#38bdf8] flex items-center justify-center p-[1px] shadow-lg shadow-[#00f0ff]/20">
            <div className="w-full h-full bg-[#070f1e] rounded-[7px] flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-[#00f0ff]" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black tracking-tight flex items-center gap-1.5 text-white">
              <span>HYPERSENSE</span>
              <span className="bg-gradient-to-r from-[#00f0ff] to-[#00f5a0] bg-clip-text text-transparent">AI</span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-[#64748b] font-mono font-semibold">
              SPECTRAL ANOMALY CORE
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors"
        >
          &larr; Back to Frontpage
        </button>
      </header>

      {/* Main Form Center */}
      <main className="relative z-20 max-w-md mx-auto w-full px-6 py-8">
        <div className="bg-[#070f1e]/90 border border-[#1e3a5f] rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-[#00f0ff]/10">
          <div className="mb-6 text-center">
            <div className="inline-block px-3 py-1 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-xs font-mono text-[#00f0ff] font-semibold mb-2">
              HYPERSENSE AI ACCESS GATEWAY
            </div>
            <h1 className="text-2xl font-black text-white">
              {mode === 'signin' ? 'Sign In to Radar Console' : 'Create Operator Profile'}
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1">
              Authenticate against SQLite database storage or choose a pre-configured scientist role.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-lg bg-red-900/30 border border-red-500/40 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {/* Quick Select Presets */}
          <div className="space-y-2 mb-6">
            <div className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider">
              Quick-Select Demo Scientist:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MOCK_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectPreset(acc)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    selectedPreset === acc.id
                      ? 'border-[#00f0ff] bg-[#0c1a2e]'
                      : 'border-[#1e3a5f] bg-[#040810] hover:border-[#38bdf8]'
                  }`}
                >
                  <div className="font-bold text-white truncate">{acc.name.split(' ')[1] || acc.name}</div>
                  <div className="text-[10px] text-[#00f0ff] truncate">{acc.badgeText}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#64748b] mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Sarah Mitchell"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#040810] border border-[#1e3a5f] text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#64748b] mb-1">Email / Callsign</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@hypersense.ai"
                className="w-full px-3 py-2.5 rounded-lg bg-[#040810] border border-[#1e3a5f] text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#64748b] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 rounded-lg bg-[#040810] border border-[#1e3a5f] text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] via-[#00f5a0] to-[#38bdf8] text-[#040810] font-black text-sm tracking-wide shadow-lg shadow-[#00f0ff]/25 hover:shadow-[#00f0ff]/40 transition-all cursor-pointer mt-2"
            >
              {isLoading ? 'Authenticating with SQLite Database...' : mode === 'signin' ? 'Sign In to Console →' : 'Register Operator Profile →'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#1e3a5f] text-center text-xs text-[#64748b]">
            {mode === 'signin' ? (
              <span>Need an account? <button onClick={() => setMode('signup')} className="text-[#00f0ff] font-bold hover:underline">Sign up here</button></span>
            ) : (
              <span>Already registered? <button onClick={() => setMode('signin')} className="text-[#00f0ff] font-bold hover:underline">Sign in here</button></span>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
