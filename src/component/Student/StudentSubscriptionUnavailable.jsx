import { Link } from 'react-router-dom';

export default function StudentSubscriptionUnavailable() {
  return (
    <div className="app-page-bg min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-white mb-3">Software Unavailable</h1>
        <p className="text-slate-300 mb-6 leading-relaxed">
          Your admin needs to renew the software subscription. Please contact your library administrator.
        </p>
        <Link
          to="/student/login"
          className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white hover:opacity-90"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
