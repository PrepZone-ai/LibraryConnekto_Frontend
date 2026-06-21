import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useNearbyLibraries from '../../hooks/useNearbyLibraries';
import SelectRoleModal from '../Auth/SelectRoleModal';
import AnonymousBookingForm from '../Booking/AnonymousBookingForm';
import LibraryCard from '../Library/LibraryCard';

function QuickAction({ to, label, description, color = 'purple' }) {
  const colorMap = {
    purple: 'from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-400/50',
    emerald: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 hover:border-emerald-400/50',
    blue: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30 hover:border-blue-400/50',
    amber: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 hover:border-amber-400/50',
  };

  return (
    <Link
      to={to}
      className={`block rounded-xl p-4 border bg-gradient-to-br transition-all duration-200 ${colorMap[color]}`}
    >
      <div className="font-semibold text-white">{label}</div>
      {description && <div className="text-sm text-slate-400 mt-1">{description}</div>}
    </Link>
  );
}

function StudentGuestHome({ userLocation, libraries, loading }) {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6 space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-white mb-2">Find a library near you</h1>
        <p className="text-slate-400 text-sm">
          {userLocation
            ? 'Libraries sorted by distance. Book a seat without signing in.'
            : 'Browse libraries and book a seat. Enable location for nearest results.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/book-seat')}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg"
          >
            Book Your Seat
          </button>
          <Link
            to="/student/login"
            className="inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-600 text-slate-200 text-sm font-semibold hover:bg-slate-800/60"
          >
            Already registered? Sign In
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Nearby libraries</h2>
          <Link to="/libraries" className="text-sm text-purple-400 hover:text-purple-300">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : libraries.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {libraries.map((library, index) => (
              <LibraryCard key={library.id} library={library} animationIndex={index} />
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No libraries found. Try again later.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Book without an account</h2>
        <AnonymousBookingForm />
      </section>
    </div>
  );
}

function StudentLoggedInHome({ userLocation, libraries, loading }) {
  return (
    <div className="px-4 py-6 space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-white mb-4">Welcome back</h1>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/student/dashboard" label="Dashboard" description="Your overview" />
          <QuickAction to="/student/book-seat" label="Book Seat" description="Reserve a seat" color="emerald" />
          <QuickAction to="/student/messages" label="Messages" description="Chat with admin" color="blue" />
          <QuickAction to="/student/attendance" label="Attendance" description="Mark attendance" color="amber" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Libraries near you</h2>
          <Link to="/libraries" className="text-sm text-purple-400 hover:text-purple-300">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : libraries.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {libraries.map((library, index) => (
              <LibraryCard key={library.id} library={library} animationIndex={index} />
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No libraries found.</p>
        )}
        {userLocation && (
          <p className="text-xs text-slate-500 mt-2 text-center">Sorted by distance from your location</p>
        )}
      </section>
    </div>
  );
}

function AdminLoggedInHome() {
  return (
    <div className="px-4 py-6 space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Home</h1>
        <p className="text-slate-400 text-sm mb-4">Quick access to your library management tools.</p>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/admin/dashboard" label="Dashboard" description="Stats & overview" />
          <QuickAction to="/admin/students" label="Students" description="Manage students" color="emerald" />
          <QuickAction to="/admin/messages" label="Messages" description="Student chat" color="blue" />
          <QuickAction to="/admin/scanner" label="QR Scanner" description="Attendance" color="amber" />
          <QuickAction to="/admin/seats" label="Seats" description="Seat layout" />
          <QuickAction to="/admin/platform-subscription" label="Subscription" description="Platform plan" color="emerald" />
        </div>
      </section>
    </div>
  );
}

export default function AppHome() {
  const navigate = useNavigate();
  const { isLoggedIn, userType, selectedRole, setRole } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { libraries, loading, userLocation } = useNearbyLibraries(6);

  useEffect(() => {
    if (selectedRole === 'admin' && !isLoggedIn) {
      navigate('/admin/auth', { replace: true });
    }
  }, [selectedRole, isLoggedIn, navigate]);

  useEffect(() => {
    if (!selectedRole && !isLoggedIn) {
      setShowRoleModal(true);
    }
  }, [selectedRole, isLoggedIn]);

  const handleSelectRole = (role) => {
    setRole(role);
    setShowRoleModal(false);
  };

  if (selectedRole === 'admin' && !isLoggedIn) {
    return null;
  }

  if (!selectedRole && !isLoggedIn) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Library Connekto</h1>
          <p className="text-slate-400 mb-6">Choose how you want to continue</p>
          <button
            type="button"
            onClick={() => setShowRoleModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
          >
            Choose Your Role
          </button>
        </div>
        <SelectRoleModal
          open={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          onSelect={handleSelectRole}
          appMode
        />
      </>
    );
  }

  if (isLoggedIn && userType === 'admin') {
    return <AdminLoggedInHome />;
  }

  if (isLoggedIn && userType === 'student') {
    return <StudentLoggedInHome userLocation={userLocation} libraries={libraries} loading={loading} />;
  }

  if (selectedRole === 'student') {
    return (
      <>
        <StudentGuestHome userLocation={userLocation} libraries={libraries} loading={loading} />
        <SelectRoleModal
          open={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          onSelect={handleSelectRole}
          appMode
        />
      </>
    );
  }

  return null;
}
