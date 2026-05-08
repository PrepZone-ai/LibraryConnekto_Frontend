import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../lib/api'

const UserIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export default function StudentForgotPassword() {
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const sid = studentId.trim().toUpperCase()
    const em = email.trim()
    if (!sid && !em) {
      setError('Enter your student ID or the email on your account.')
      return
    }

    setLoading(true)
    try {
      const body = {}
      if (sid) body.student_id = sid
      if (em) body.email = em
      const res = await apiClient.postAnonymous('/auth/student/forgot-password', body)
      setMessage(res?.message || 'If we found your account, check your email for a reset link.')
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow relative flex items-center justify-center px-4 pt-20 pb-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={new URL('../../assets/Front.png', import.meta.url).href}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-cyan-900/80 to-teal-900/80" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 overflow-hidden shadow-lg shadow-cyan-500/25">
                <img
                  src={new URL('../../assets/Logo.png', import.meta.url).href}
                  alt="Library Connekto"
                  className="h-full w-full object-cover"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Forgot password</h1>
              <p className="text-white/70 text-sm">
                We will email a reset link to the address on file. Enter your student ID, your email, or both.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">Student ID (optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="w-5 h-5 text-white/50" />
                  </div>
                  <input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="LIBR25001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">Email (optional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/25"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/student/login')}
                className="text-white/70 hover:text-white text-sm"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
