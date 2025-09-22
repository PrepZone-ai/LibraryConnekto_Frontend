import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiClient, setAuthToken } from '../../lib/api'

export default function AuthModal({ open, role = 'student', onClose }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [emailOrId, setEmailOrId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const title = useMemo(() => {
    const roleLabel = role === 'admin' ? 'Admin / Owner' : 'Student'
    const action = mode === 'signin' ? 'Sign In' : 'Sign Up'
    return `${roleLabel} ${action}`
  }, [role, mode])

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setMode('signin')
      setEmailOrId('')
      setPassword('')
      setError('')
      setMessage('')
    }
  }, [open])

  const submit = async (e) => {
    e?.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (role === 'admin') {
        if (mode === 'signup') {
          await apiClient.post('/auth/admin/signup', { email: emailOrId, password })
          setMessage('Signup successful. Please verify email if required, then sign in.')
          setMode('signin')
        } else {
          const res = await apiClient.post('/auth/admin/signin', { email: (emailOrId || '').toLowerCase(), password })
          if (res?.access_token) setAuthToken(res.access_token)
          setMessage('Signed in successfully.')
        }
      } else {
        if (mode === 'signup') {
          setError('Students are created by admins. Please contact your library admin.')
        } else {
          // Student sign in uses student ID or email in `email` field
          const res = await apiClient.post('/auth/student/signin', { email: (emailOrId || '').toUpperCase(), password })
          if (res?.access_token) setAuthToken(res.access_token)
          if (res?.is_first_login) {
            setMessage('First login detected. Redirecting to set password...')
            window.location.href = `/student/set-password?studentId=${encodeURIComponent(res.student_id || emailOrId)}`
            return
          }
          setMessage('Signed in successfully.')
        }
      }
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-800 shadow-2xl">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-md pointer-events-none" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">{role === 'admin' ? 'Email' : 'Student ID or Email'}</label>
              <input value={emailOrId} onChange={(e) => setEmailOrId(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-emerald-400 text-sm">{message}</p>}
            <button type="submit" disabled={loading} className="w-full py-2 rounded bg-primary-600 hover:bg-primary-500 disabled:opacity-60">
              {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-3 text-sm text-slate-300">
            {mode === 'signin' ? (
              <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="text-primary-300 hover:text-primary-200">Don't have an account? Sign Up</button>
            ) : (
              <button onClick={() => { setMode('signin'); setError(''); setMessage(''); }} className="text-primary-300 hover:text-primary-200">Already have an account? Sign In</button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

