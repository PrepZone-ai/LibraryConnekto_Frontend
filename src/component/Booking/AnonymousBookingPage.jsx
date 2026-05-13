import { useLocation, useNavigate } from 'react-router-dom';
import AnonymousBookingForm from './AnonymousBookingForm';

const AnonymousBookingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialLibraryId = state?.libraryId || '';
  const initialLibraryName = state?.libraryName || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-800 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            {initialLibraryName || 'Book a Seat'}
          </h1>
        </div>

        <AnonymousBookingForm initialLibraryId={initialLibraryId} />
      </div>
    </div>
  );
};

export default AnonymousBookingPage;
