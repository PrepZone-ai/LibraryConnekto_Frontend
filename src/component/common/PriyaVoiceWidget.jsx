import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RETELL_WIDGET_SCRIPT_ID = 'retell-widget';

const PUBLIC_WIDGET_PATHS = new Set([
  '/',
  '/services',
  '/about',
  '/contact',
  '/libraries',
  '/book-seat',
  '/admin/auth',
]);

function shouldShowPriyaWidget(pathname) {
  if (PUBLIC_WIDGET_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/library/')) return true;
  return false;
}

function removeRetellWidgetArtifacts() {
  document.getElementById(RETELL_WIDGET_SCRIPT_ID)?.remove();
  document.querySelectorAll('[class*="retell"], [id*="retell"]').forEach((node) => {
    if (node.id !== RETELL_WIDGET_SCRIPT_ID) node.remove();
  });
}

/**
 * Loads Retell voice widget (browser WebRTC call with Priya).
 * Requires VITE_RETELL_PUBLIC_KEY and VITE_RETELL_VOICE_AGENT_ID.
 */
export default function PriyaVoiceWidget() {
  const { pathname } = useLocation();
  const publicKey = import.meta.env.VITE_RETELL_PUBLIC_KEY;
  const voiceAgentId = import.meta.env.VITE_RETELL_VOICE_AGENT_ID;
  const agentVersion = import.meta.env.VITE_RETELL_AGENT_VERSION || '1';

  useEffect(() => {
    removeRetellWidgetArtifacts();

    if (!publicKey || !voiceAgentId || !shouldShowPriyaWidget(pathname)) {
      return undefined;
    }

    const script = document.createElement('script');
    script.id = RETELL_WIDGET_SCRIPT_ID;
    script.src = 'https://dashboard.retellai.com/retell-widget-v2.js';
    script.type = 'module';
    script.dataset.publicKey = publicKey;
    script.dataset.voicePublicKey = publicKey;
    script.dataset.voiceAgentId = voiceAgentId;
    script.dataset.agentVersion = agentVersion;
    script.dataset.title = 'Priya - LibraryConnekto';
    script.dataset.botName = 'Priya';
    script.dataset.fabText = 'Priya se baat karein';
    script.dataset.popupMessage =
      'Library owner hain? Priya se Hindi ya English mein enquiry karein — free trial ke baare mein.';
    script.dataset.showAiPopup = 'true';
    script.dataset.showAiPopupTime = '8';
    script.dataset.color = '#9333ea';
    script.dataset.autoOpen = 'false';

    document.head.appendChild(script);

    return () => {
      removeRetellWidgetArtifacts();
    };
  }, [pathname, publicKey, voiceAgentId, agentVersion]);

  return null;
}
