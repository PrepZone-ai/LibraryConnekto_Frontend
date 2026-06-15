import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

import { useAdminDetails } from '../../lib/queries';



const SETUP_PATH = '/admin/details';

const DASHBOARD_PATH = '/admin/dashboard';



/** Only these routes are reachable before admin library setup is complete */

const ALLOWED_BEFORE_SETUP = [

  SETUP_PATH,

  '/admin/platform-subscription',

  '/admin/auth',

  '/admin/reset-password',

  '/admin/login',

  '/login',

];



function isAllowedBeforeSetup(pathname) {

  return ALLOWED_BEFORE_SETUP.some(

    (p) => pathname === p || pathname.startsWith(`${p}/`)

  );

}



function isSetupPath(pathname) {

  return pathname === SETUP_PATH || pathname.startsWith(`${SETUP_PATH}/`);

}



export default function AdminDetailsGate() {

  const { pathname } = useLocation();

  const { isLoggedIn, userType, loading: authLoading } = useAuth();



  const isAdminSession = isLoggedIn && userType === 'admin';

  const { data: adminDetails, isLoading, isFetching } = useAdminDetails({

    enabled: isAdminSession,

  });



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



  const isComplete = Boolean(adminDetails?.is_complete);

  const detailsPending = isLoading || (isFetching && !adminDetails);



  if (detailsPending) {

    return (

      <div className="app-page-bg min-h-screen flex items-center justify-center">

        <p className="text-white/80 text-sm">Checking library setup...</p>

      </div>

    );

  }



  // Profile already complete — never keep user on the one-time setup page

  if (isComplete && isSetupPath(pathname)) {

    return <Navigate to={DASHBOARD_PATH} replace />;

  }



  if (isComplete) {

    return <Outlet />;

  }



  if (!isAllowedBeforeSetup(pathname)) {
    return <Navigate to={SETUP_PATH} replace />;
  }

  return <Outlet />;

}


