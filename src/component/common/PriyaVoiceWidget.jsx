import { useCallback, useEffect, useState } from 'react';
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

function loadRetellWidget({
  publicKey,
  voiceAgentId,
  agentVersion,
  widgetTitle,
  whiteLabelToken,
  autoOpen = false,
}) {
  removeRetellWidgetArtifacts();

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
  setWidgetAttr(script, 'data-fab-text', 'Call to Priya');
  setWidgetAttr(script, 'data-color', '#9333ea');
  setWidgetAttr(script, 'data-auto-open', autoOpen ? 'true' : 'false');
  setWidgetAttr(script, 'data-show-ai-popup', 'false');

  if (whiteLabelToken) {
    setWidgetAttr(script, 'data-white-label', whiteLabelToken);
  }

  document.head.appendChild(script);
}

function getRetellConfig() {
  return {
    publicKey: import.meta.env.VITE_RETELL_PUBLIC_KEY,
    voiceAgentId: import.meta.env.VITE_RETELL_VOICE_AGENT_ID,
    agentVersion: import.meta.env.VITE_RETELL_AGENT_VERSION || '1',
    widgetTitle: import.meta.env.VITE_RETELL_WIDGET_TITLE || 'Priya',
    whiteLabelToken:
      import.meta.env.VITE_RETELL_WHITE_LABEL ||
      import.meta.env.VITE_RETELL_WHITE_LABEL_TOKEN,
  };
}

/**
 * Always-visible "Call to Priya" button on public pages.
 * Retell env vars must be set in Vercel before build (VITE_* are baked at build time).
 */
export default function PriyaVoiceWidget() {
  const { pathname } = useLocation();
  const [isStarting, setIsStarting] = useState(false);
  const config = getRetellConfig();
  const isConfigured = Boolean(config.publicKey && config.voiceAgentId);

  useEffect(() => {
    if (!shouldShowPriyaWidget(pathname)) {
      removeRetellWidgetArtifacts();
      return undefined;
    }

    if (!isConfigured && import.meta.env.PROD) {
      console.error(
        '[Call to Priya] Missing VITE_RETELL_PUBLIC_KEY or VITE_RETELL_VOICE_AGENT_ID in production build. ' +
          'Add them in Vercel → Settings → Environment Variables → redeploy.',
      );
    }

    return undefined;
  }, [pathname, isConfigured]);

  const handleCallClick = useCallback(() => {
    if (!isConfigured) {
      window.alert(
        'Call assistant is not configured yet. Please use the Contact page or try again later.',
      );
      return;
    }

    setIsStarting(true);
    loadRetellWidget({ ...config, autoOpen: true });

    window.setTimeout(() => {
      setIsStarting(false);
    }, 2500);
  }, [config, isConfigured]);

  if (!shouldShowPriyaWidget(pathname)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleCallClick}
      disabled={isStarting}
      aria-label="Call to Priya for library management enquiry"
      className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-105 hover:shadow-purple-500/50 disabled:cursor-wait disabled:opacity-80"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {isStarting ? '⏳' : '📞'}
      </span>
      <span>{isStarting ? 'Connecting...' : 'Call to Priya'}</span>
    </button>
  );
}
