import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

export default function EmailVerificationError() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const urlMessage = searchParams.get('message')
    if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage))
    } else {
      setMessage('Invalid or expired verification token.')
    }
  }, [searchParams])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/admin/auth')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            Verification Failed
          </h1>

          {/* Message */}
          <p className="text-slate-300 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Additional Info */}
          <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
            <p className="text-slate-400 text-sm">
              This could happen if:
            </p>
            <ul className="text-slate-400 text-sm mt-2 space-y-1 text-left">
              <li>• The verification link has expired</li>
              <li>• The link has already been used</li>
              <li>• The link is invalid or corrupted</li>
            </ul>
          </div>

          {/* Countdown */}
          <p className="text-slate-400 text-sm mb-6">
            Redirecting to sign in page in {countdown} seconds...
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/auth?mode=signup')}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Try Signing Up Again
            </button>
            
            <button
              onClick={() => navigate('/admin/auth')}
              className="w-full px-6 py-3 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-700/70 transition-all duration-300"
            >
              Sign In Instead
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-slate-600/50 text-slate-400 font-medium rounded-xl hover:bg-slate-600/70 transition-all duration-300"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
