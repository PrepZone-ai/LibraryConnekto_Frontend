import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiClient } from '../../lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys, useAdminDetails } from '../../lib/queries'
import { ASSETS } from '../../lib/assets'

// Icons
const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const EyeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
)

export default function AdminAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { login, resendAdminVerification, isLoggedIn, userType, loading: authLoading } = useAuth()
  const { data: adminDetails, isLoading: adminDetailsLoading } = useAdminDetails({
    enabled: isLoggedIn && userType === 'admin',
  })
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // ── If already logged in, redirect to dashboard or mandatory setup ──
  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) return
    if (userType === 'student') {
      navigate('/student/dashboard', { replace: true })
      return
    }
    if (userType === 'admin') {
      if (adminDetailsLoading) return
      navigate(
        adminDetails?.is_complete ? '/admin/dashboard' : '/admin/details',
        { replace: true }
      )
    }
  }, [isLoggedIn, userType, authLoading, adminDetails, adminDetailsLoading, navigate])

  useEffect(() => {
    // Check if mode is specified in URL
    const urlMode = searchParams.get('mode')
    if (urlMode === 'signup') {
      setMode('signup')
    }
    const urlMessage = searchParams.get('message')
    if (urlMessage) {
      setMode('signin')
      setMessage(decodeURIComponent(urlMessage))
    }
  }, [searchParams])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const toggleMode = () => {
    if (mode === 'forgot') {
      setMode('signin')
    } else {
      setMode(mode === 'signin' ? 'signup' : 'signin')
    }
    setError('')
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          setError('Enter your email address.')
          return
        }
        const res = await apiClient.postAnonymous('/auth/admin/forgot-password', {
          email: email.trim().toLowerCase(),
        })
        setMessage(res?.message || 'If an account exists for this email, you will receive reset instructions.')
        return
      }
      if (mode === 'signin') {
        const result = await login(email, password, 'admin')
        if (result.success) {
          let isComplete = result.adminDetails?.is_complete
          if (isComplete === undefined) {
            try {
              const details = await queryClient.fetchQuery({
                queryKey: queryKeys.adminDetails,
                queryFn: () => apiClient.get('/admin/details'),
              })
              isComplete = details?.is_complete
            } catch (_) {
              isComplete = false
            }
          }
          navigate(isComplete ? '/admin/dashboard' : '/admin/details', { replace: true })
        } else {
          setError(result.error)
        }
      } else {
        // Admin signup
        const result = await login(email, password, 'admin', 'signup')
        if (result.success) {
          setMessage(result.message || 'Signup successful. Verification email has been queued. Please sign in after verification.')
          setMode('signin')
          setEmail('')
          setPassword('')
        } else {
          setError(result.error)
        }
      }
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setError('')
    setMessage('')
    if (resendCooldown > 0) {
      setError(`Please wait ${resendCooldown}s before requesting another verification email.`)
      return
    }
    if (!email) {
      setError('Enter your email address first, then click resend verification.')
      return
    }
    setLoading(true)
    try {
      const result = await resendAdminVerification(email)
      if (result.success) {
        setMessage(result.message || 'Verification email re-queued. Please check inbox and spam.')
      } else {
        setError(result.error || 'Could not resend verification email.')
        if (result.retryAfterSeconds != null && !Number.isNaN(Number(result.retryAfterSeconds))) {
          setResendCooldown(Number(result.retryAfterSeconds))
        } else {
          const match = (result.error || '').match(/wait\s+(\d+)\s+seconds?/i)
          if (match && match[1]) {
            setResendCooldown(Number(match[1]))
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Could not resend verification email.')
      const match = (err.message || '').match(/wait\s+(\d+)\s+seconds?/i)
      if (match && match[1]) {
        setResendCooldown(Number(match[1]))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow relative flex items-center justify-center px-4 pt-20 pb-8 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <img 
            src={ASSETS.front} 
            alt="Library Study Environment" 
            className="h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-pink-900/80"></div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 left-40 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 overflow-hidden shadow-lg shadow-purple-500/25">
                  <img 
                    src={ASSETS.logo} 
                    alt="Library Connekto Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === 'forgot'
                ? 'Forgot password'
                : mode === 'signin'
                  ? 'Welcome Back'
                  : 'Create Account'}
            </h1>
            <p className="text-white/70">
              {mode === 'forgot'
                ? 'Enter your email and we will send a reset link'
                : mode === 'signin'
                  ? 'Sign in to your admin account'
                  : 'Join as a new admin'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-white/50" />
                </div>
                <input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Enter your email"
                  required 
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="w-5 h-5 text-white/50" />
                  </div>
                  <input 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                    placeholder="Enter your password"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5 text-white/50 hover:text-white/70 transition-colors" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-white/50 hover:text-white/70 transition-colors" />
                    )}
                  </button>
                </div>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot')
                      setError('')
                      setMessage('')
                    }}
                    className="text-sm text-purple-200 hover:text-white text-left"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            {message && (
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                <p className="text-green-200 text-sm">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Please wait...
                </div>
              ) : (
                mode === 'forgot' ? 'Send reset link' : mode === 'signin' ? 'Sign In' : 'Sign Up'
              )}
            </button>

            {mode === 'signin' && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading || resendCooldown > 0}
                className="w-full py-2 text-sm bg-white/10 border border-white/20 text-white/90 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : "Didn't receive verification email? Resend"}
              </button>
            )}
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={toggleMode} 
              className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
            >
              {mode === 'forgot' ? (
                <>
                  <span className="text-purple-300 font-medium">Back to sign in</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  Don't have an account? <span className="text-purple-300 font-medium">Sign Up</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="text-purple-300 font-medium">Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-sm">
            Library Connekto Admin Portal
          </p>
        </div>
      </div>
      </main>
    </div>
  )
}
