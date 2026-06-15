import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';

const BILLING_PATH = '/admin/platform-subscription';

const ALLOWED_WHEN_EXPIRED = [
  BILLING_PATH,
  '/admin/auth',
  '/admin/reset-password',
  '/admin/login',
  '/login',
];

function isAllowedWhenExpired(pathname) {
  return ALLOWED_WHEN_EXPIRED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function AdminPlatformSubscriptionGate() {
  const { pathname } = useLocation();
  const { isLoggedIn, userType, loading: authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const isAdminSession = isLoggedIn && userType === 'admin';

  useEffect(() => {
    if (!isAdminSession) return;
    let cancelled = false;
    setChecking(true);
    apiClient
      .get('/platform-subscription/status')
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdminSession, pathname]);

  if (authLoading) {
    return (
      <div className="app-page-bg min-h-screen flex items-center justify-center">
        <p className="text-white/80 text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAdminSession) {
    return <Outlet />;
  }

  if (checking && !status) {
    return (
      <div className="app-page-bg min-h-screen flex items-center justify-center">
        <p className="text-white/80 text-sm">Checking subscription...</p>
      </div>
    );
  }

  const isExpired = status?.status === 'expired' || status?.is_active === false;

  if (isExpired && !isAllowedWhenExpired(pathname)) {
    return <Navigate to={BILLING_PATH} replace />;
  }

  return <Outlet />;
}
