import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'

export default function SelectRoleModal({ open, onClose, onSelect }) {
  const navigate = useNavigate()
  
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null

  const select = (role) => {
    onSelect?.(role)
    onClose()
    // Don't redirect automatically - let user stay on home page
    // They can click the appropriate button to proceed with auth
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-md pointer-events-none" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-purple-500/25">
                <img 
                  src={new URL('../../assets/Logo.png', import.meta.url).href} 
                  alt="Library Connekto Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Choose Your Role</h2>
                <p className="text-slate-300 mt-1">Continue as a Student or Admin/Owner</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => select('student')} className="group text-left rounded-2xl p-6 border border-slate-700/60 bg-slate-800/40 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all duration-300 shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center text-white font-bold shadow-md group-hover:scale-105 transition">S</div>
                <div>
                  <div className="text-xl font-bold text-white group-hover:text-purple-200 transition">Student</div>
                  <div className="text-slate-400 text-sm">Log in to manage your study and bookings</div>
                </div>
              </div>
            </button>

            <button onClick={() => select('admin')} className="group text-left rounded-2xl p-6 border border-slate-700/60 bg-slate-800/40 hover:border-pink-500/50 hover:bg-slate-800/70 transition-all duration-300 shadow-lg hover:shadow-pink-500/20">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 grid place-items-center text-white font-bold shadow-md group-hover:scale-105 transition">A</div>
                <div>
                  <div className="text-xl font-bold text-white group-hover:text-pink-200 transition">Admin / Owner</div>
                  <div className="text-slate-400 text-sm">Sign in or sign up to manage your library</div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50">Close</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
