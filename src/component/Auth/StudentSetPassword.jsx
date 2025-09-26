import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiClient } from '../../lib/api'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

// Icons
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

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

function useQuery() {
  const [params, setParams] = useState(new URLSearchParams(window.location.search))
  useEffect(() => {
    const handler = () => setParams(new URLSearchParams(window.location.search))
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
  return params
}

export default function StudentSetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const query = useQuery()
  
  // Get student ID from navigation state or URL query parameter
  const studentId = location.state?.studentId || query.get('studentId') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!studentId) {
      setError('Missing student ID')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      // Mobile uses POST /student/set-password with { student_id, new_password }
      const res = await apiClient.post('/student/set-password', {
        student_id: studentId,
        new_password: newPassword
      })
      // Some backends return {success: boolean} or {message: string}
      if (res && (res.success || res.message)) {
        setMessage('Password set successfully. Redirecting to dashboard...')
        setTimeout(() => {
          navigate('/student/dashboard')
        }, 2000)
      } else {
        setMessage('Password set. Redirecting to dashboard...')
        setTimeout(() => {
          navigate('/student/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Failed to set password')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' }
    if (password.length < 6) return { strength: 1, text: 'Too short', color: 'text-red-400' }
    if (password.length < 8) return { strength: 2, text: 'Weak', color: 'text-orange-400' }
    if (password.length < 12) return { strength: 3, text: 'Good', color: 'text-yellow-400' }
    return { strength: 4, text: 'Strong', color: 'text-green-400' }
  }

  const strength = passwordStrength(newPassword)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow relative flex items-center justify-center px-4 pt-20 pb-8 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <img 
            src={new URL('../../assets/Front.png', import.meta.url).href} 
            alt="Library Study Environment" 
            className="h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-green-900/80 to-teal-900/80"></div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 left-40 w-60 h-60 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 overflow-hidden shadow-lg shadow-emerald-500/25">
                  <img 
                    src={new URL('../../assets/Logo.png', import.meta.url).href} 
                    alt="Library Connekto Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Set Your Password
            </h1>
            <p className="text-white/70 mb-4">
              Create a secure password for your account
            </p>
            {studentId && (
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                <UserIcon className="w-4 h-4 text-white/70 mr-2" />
                <span className="text-white/90 font-mono text-sm">{studentId}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="w-5 h-5 text-white/50" />
                </div>
                <input 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  type={showNewPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Enter new password"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="w-5 h-5 text-white/50 hover:text-white/70 transition-colors" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-white/50 hover:text-white/70 transition-colors" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          strength.strength === 1 ? 'bg-red-400 w-1/4' :
                          strength.strength === 2 ? 'bg-orange-400 w-2/4' :
                          strength.strength === 3 ? 'bg-yellow-400 w-3/4' :
                          strength.strength === 4 ? 'bg-green-400 w-full' : 'w-0'
                        }`}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${strength.color}`}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="text-xs text-white/50">
                    Password must be at least 6 characters long
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="w-5 h-5 text-white/50" />
                </div>
                <input 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Confirm new password"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-5 h-5 text-white/50 hover:text-white/70 transition-colors" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-white/50 hover:text-white/70 transition-colors" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center space-x-2">
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-xs">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400 rounded-full"></div>
                      <span className="text-red-400 text-xs">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            {message && (
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                <p className="text-green-200 text-sm flex items-center">
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword} 
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Setting password...
                </div>
              ) : (
                'Set Password'
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/student/login')}
              className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
            >
              Back to login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-sm">
            Library Connekto Student Portal
          </p>
        </div>
      </div>
      </main>
      
      <Footer />
    </div>
  )
}
