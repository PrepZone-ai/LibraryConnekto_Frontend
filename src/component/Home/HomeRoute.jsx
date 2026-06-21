import { useAppMode } from '../../hooks/useAppMode';
import Home from '../Home/Home';
import AppHome from '../Home/AppHome';

/**
 * Website → marketing Home.jsx (header + footer)
 * Capacitor APK / ?app=1 preview → AppHome.jsx (app shell)
 */
export default function HomeRoute() {
  const { isApp, isCapacitor } = useAppMode();

  if (isApp) {
    return <AppHome key={isCapacitor ? 'capacitor' : 'preview'} />;
  }

  return <Home key="website" />;
}
