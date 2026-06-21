import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useNearbyLibraries from '../../hooks/useNearbyLibraries';
import { APP_LOGO_URL } from '../../lib/assets';
import SelectRoleModal from '../Auth/SelectRoleModal';
import AnonymousBookingForm from '../Booking/AnonymousBookingForm';
import LibraryCard from '../Library/LibraryCard';
import AppAdminHomePanels from './AppAdminHomePanels';
import AppHomeHero from './AppHomeHero';

const NEARBY_LIBRARY_COUNT = 4;

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
      className={`block rounded-xl p-4 border bg-gradient-to-br transition-all duration-200 active:scale-[0.98] ${colorMap[color]}`}
    >
      <div className="font-semibold text-white">{label}</div>
      {description && <div className="text-sm text-slate-400 mt-1">{description}</div>}
    </Link>
  );
}

function NearbyLibrariesSection({ libraries, loading, userLocation, usingFallbackList }) {
  const hasDistanceSort =
    userLocation &&
    !usingFallbackList &&
    libraries.some((lib) => lib.distance != null && lib.distance !== undefined);

  const sectionHint = hasDistanceSort
    ? 'Sorted by distance from you'
    : libraries.length > 0
      ? 'Showing available libraries'
      : null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Nearby libraries</h2>
          {sectionHint && (
            <p className="text-xs text-slate-400 mt-0.5">{sectionHint}</p>
          )}
        </div>
        <Link to="/libraries" className="text-sm text-purple-400 hover:text-purple-300 shrink-0">
          View all
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : libraries.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {libraries.map((library) => (
            <LibraryCard key={library.id} library={library} disableReveal />
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-center py-8 rounded-xl border border-slate-700/50 bg-slate-800/30">
          No libraries available right now. Please try again later.
        </p>
      )}
    </section>
  );
}

function SeatBookingSection({ isLoggedIn = false }) {
  const navigate = useNavigate();

  if (isLoggedIn) {
    return (
      <section className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 p-5">
        <h2 className="text-lg font-semibold text-white mb-2">Book your seat</h2>
        <p className="text-sm text-slate-300 mb-4">
          Reserve a seat at your library, pick a plan, and complete payment in a few steps.
        </p>
        <button
          type="button"
          onClick={() => navigate('/student/book-seat')}
          className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg active:scale-[0.98] transition-transform"
        >
          Open seat booking
        </button>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-1">Book without an account</h2>
      <p className="text-sm text-slate-400 mb-4">Select a library, choose a plan, and pay securely.</p>
      <AnonymousBookingForm />
    </section>
  );
}

function StudentGuestHome({ userLocation, libraries, loading, usingFallbackList }) {
  const navigate = useNavigate();

  return (
    <div className="pb-8">
      <AppHomeHero
        badge="Find your study space"
        title="Discover libraries near you"
        subtitle="Browse nearby libraries, compare availability, and book a seat without signing in."
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/book-seat')}
            className="hero-cta-primary inline-flex items-center px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
          >
            Book Your Seat
          </button>
          <Link
            to="/student/login"
            className="hero-cta-secondary inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Sign In
          </Link>
        </div>
      </AppHomeHero>

      <div className="px-4 pt-6 space-y-8">
        <NearbyLibrariesSection
          libraries={libraries}
          loading={loading}
          userLocation={userLocation}
          usingFallbackList={usingFallbackList}
        />
        <SeatBookingSection />
      </div>
    </div>
  );
}

function StudentLoggedInHome({ user, userLocation, libraries, loading, usingFallbackList }) {
  const displayName = user?.name || user?.email || 'Student';

  return (
    <div className="pb-8">
      <AppHomeHero
        badge="Student portal"
        title={`Welcome back, ${displayName.split('@')[0]}`}
        subtitle="Explore nearby libraries and manage your study space from one place."
      />

      <div className="px-4 pt-6 space-y-8">
        <NearbyLibrariesSection
          libraries={libraries}
          loading={loading}
          userLocation={userLocation}
          usingFallbackList={usingFallbackList}
        />
        <SeatBookingSection isLoggedIn />
      </div>
    </div>
  );
}

function AdminLoggedInHome({ user }) {
  const libraryName = user?.library_name || 'Your Library';
  const adminName = user?.admin_name || user?.name || user?.email || 'Admin';

  return (
    <div className="pb-8">
      <AppHomeHero
        badge={libraryName}
        title={`Welcome, ${adminName.split('@')[0]}`}
        subtitle="Manage bookings, students, seats, and messages from your library dashboard."
      />

      <div className="px-4 pt-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Quick access</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction to="/admin/dashboard" label="Dashboard" description="Stats & overview" />
            <QuickAction to="/admin/students" label="Students" description="Manage students" color="emerald" />
            <QuickAction to="/admin/messages" label="Messages" description="Student chat" color="blue" />
            <QuickAction to="/admin/scanner" label="QR Scanner" description="Attendance" color="amber" />
            <QuickAction to="/admin/seats" label="Seats" description="Seat layout" />
            <QuickAction to="/admin/booking-management" label="Bookings" description="Approve requests" color="amber" />
            <QuickAction to="/admin/platform-subscription" label="Subscription" description="Platform plan" color="emerald" />
            <QuickAction to="/admin/student-removal-requests" label="Removals" description="Review requests" color="blue" />
          </div>
        </section>

        <AppAdminHomePanels />
      </div>
    </div>
  );
}

export default function AppHome() {
  const navigate = useNavigate();
  const { isLoggedIn, userType, selectedRole, setRole, user } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { libraries, loading, userLocation, usingFallbackList } = useNearbyLibraries(NEARBY_LIBRARY_COUNT);

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
        <div className="pb-8">
          <AppHomeHero
            badge="Smart library management"
            title="Welcome to Library Connekto"
            subtitle="Choose your role to access the student portal or manage your library."
          >
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="hero-cta-primary inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold"
            >
              Choose Your Role
            </button>
          </AppHomeHero>
          <div className="px-4 pt-6 flex flex-col items-center text-center">
            <img
              src={APP_LOGO_URL}
              alt="Library Connekto"
              className="h-20 w-20 rounded-2xl shadow-xl ring-2 ring-purple-500/30 bg-white object-contain p-1 mb-4"
            />
            <p className="text-slate-400 text-sm max-w-xs">
              Students can find libraries and book seats. Admins can run their library from anywhere.
            </p>
          </div>
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
    return <AdminLoggedInHome user={user} />;
  }

  if (isLoggedIn && userType === 'student') {
    return (
      <StudentLoggedInHome
        user={user}
        userLocation={userLocation}
        libraries={libraries}
        loading={loading}
        usingFallbackList={usingFallbackList}
      />
    );
  }

  if (selectedRole === 'student') {
    return (
      <>
        <StudentGuestHome
          userLocation={userLocation}
          libraries={libraries}
          loading={loading}
          usingFallbackList={usingFallbackList}
        />
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
