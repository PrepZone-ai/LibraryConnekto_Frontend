import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RETELL_WIDGET_SCRIPT_ID = 'retell-widget';
const RETELL_WIDGET_SCRIPT_SRC = 'https://dashboard.retellai.com/retell-widget-v2.js';

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
  return pathname.startsWith('/library/');
}

function removeRetellWidgetArtifacts() {
  document.getElementById(RETELL_WIDGET_SCRIPT_ID)?.remove();
  document.querySelectorAll('[class*="retell"]').forEach((node) => {
    if (node.id !== RETELL_WIDGET_SCRIPT_ID) node.remove();
  });
}

function setWidgetAttr(script, name, value) {
  if (value != null && value !== '') {
    script.setAttribute(name, String(value));
  }
}

function loadRetellWidget({ publicKey, voiceAgentId, agentVersion, widgetTitle, whiteLabelToken }) {
  if (document.getElementById(RETELL_WIDGET_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = RETELL_WIDGET_SCRIPT_ID;
  script.src = RETELL_WIDGET_SCRIPT_SRC;
  script.type = 'module';

  setWidgetAttr(script, 'data-public-key', publicKey);
  setWidgetAttr(script, 'data-voice-public-key', publicKey);
  setWidgetAttr(script, 'data-voice-agent-id', voiceAgentId);
  setWidgetAttr(script, 'data-agent-version', agentVersion);
  setWidgetAttr(script, 'data-title', widgetTitle);
  setWidgetAttr(script, 'data-bot-name', 'Priya');
  setWidgetAttr(script, 'data-fab-text', 'Priya se baat karein');
  setWidgetAttr(script, 'data-color', '#9333ea');
  setWidgetAttr(script, 'data-auto-open', 'false');
  setWidgetAttr(script, 'data-show-ai-popup', 'false');

  if (whiteLabelToken) {
    setWidgetAttr(script, 'data-white-label', whiteLabelToken);
  }

  document.head.appendChild(script);
}

/**
 * Retell voice widget for library-owner enquiries.
 * Requires VITE_RETELL_* vars at Vercel build time (not just local .env).
 */
export default function PriyaVoiceWidget() {
  const { pathname } = useLocation();
  const publicKey = import.meta.env.VITE_RETELL_PUBLIC_KEY;
  const voiceAgentId = import.meta.env.VITE_RETELL_VOICE_AGENT_ID;
  const agentVersion = import.meta.env.VITE_RETELL_AGENT_VERSION || '1';
  const widgetTitle = import.meta.env.VITE_RETELL_WIDGET_TITLE || 'Priya';
  const whiteLabelToken = import.meta.env.VITE_RETELL_WHITE_LABEL;
  const isConfigured = Boolean(publicKey && voiceAgentId);

  useEffect(() => {
    if (!shouldShowPriyaWidget(pathname)) {
      removeRetellWidgetArtifacts();
      return undefined;
    }

    if (!isConfigured) {
      if (import.meta.env.DEV) {
        console.warn(
          '[PriyaVoiceWidget] Missing VITE_RETELL_PUBLIC_KEY or VITE_RETELL_VOICE_AGENT_ID. ' +
            'Add them to Vercel Environment Variables and redeploy.',
        );
      }
      return undefined;
    }

    loadRetellWidget({
      publicKey,
      voiceAgentId,
      agentVersion,
      widgetTitle,
      whiteLabelToken,
    });

    return undefined;
  }, [pathname, isConfigured, publicKey, voiceAgentId, agentVersion, widgetTitle, whiteLabelToken]);

  return null;
}
