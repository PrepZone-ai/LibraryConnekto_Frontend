import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

/** Marketing link: https://libraryconnekto.me/?call=priya */
export const PRIYA_CALL_QUERY = 'call';
export const PRIYA_CALL_VALUE = 'priya';

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

const EMPTY_CONFIG = {
  publicKey: '',
  voiceAgentId: '',
  agentVersion: '2',
  widgetTitle: 'Priya',
  whiteLabelToken: '',
};

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

function getBuildTimeConfig() {
  return {
    publicKey: import.meta.env.VITE_RETELL_PUBLIC_KEY || '',
    voiceAgentId: import.meta.env.VITE_RETELL_VOICE_AGENT_ID || '',
    agentVersion: import.meta.env.VITE_RETELL_AGENT_VERSION || '2',
    widgetTitle: import.meta.env.VITE_RETELL_WIDGET_TITLE || 'Priya',
    whiteLabelToken:
      import.meta.env.VITE_RETELL_WHITE_LABEL ||
      import.meta.env.VITE_RETELL_WHITE_LABEL_TOKEN ||
      '',
  };
}

async function loadRuntimeConfig() {
  const buildTime = getBuildTimeConfig();
  if (buildTime.publicKey && buildTime.voiceAgentId) {
    return buildTime;
  }

  try {
    const response = await fetch('/retell-config.json', { cache: 'no-store' });
    if (!response.ok) return EMPTY_CONFIG;

    const json = await response.json();
    return {
      publicKey: json.publicKey || '',
      voiceAgentId: json.voiceAgentId || '',
      agentVersion: json.agentVersion || '2',
      widgetTitle: json.widgetTitle || 'Priya',
      whiteLabelToken: json.whiteLabelToken || '',
    };
  } catch {
    return EMPTY_CONFIG;
  }
}

/**
 * Always-visible "Call to Priya" button on public pages.
 * Config comes from /retell-config.json (generated at deploy) or VITE_* env.
 */
export default function PriyaVoiceWidget() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [configReady, setConfigReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const autoCallTriggered = useRef(false);
  const isConfigured = Boolean(config.publicKey && config.voiceAgentId);
  const shouldAutoCall = searchParams.get(PRIYA_CALL_QUERY) === PRIYA_CALL_VALUE;

  useEffect(() => {
    let active = true;

    if (!shouldShowPriyaWidget(pathname)) {
      removeRetellWidgetArtifacts();
      return undefined;
    }

    loadRuntimeConfig().then((nextConfig) => {
      if (!active) return;
      setConfig(nextConfig);
      setConfigReady(true);

      if (!nextConfig.publicKey || !nextConfig.voiceAgentId) {
        console.error(
          '[Call to Priya] Retell config missing. Ensure VITE_RETELL_* vars are set in Vercel ' +
            '(Production) and redeploy so public/retell-config.json is generated.',
        );
      }
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  const startPriyaCall = useCallback(() => {
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

  const handleCallClick = useCallback(() => {
    startPriyaCall();
  }, [startPriyaCall]);

  useEffect(() => {
    if (
      autoCallTriggered.current ||
      !shouldShowPriyaWidget(pathname) ||
      !shouldAutoCall ||
      !configReady ||
      !isConfigured
    ) {
      return;
    }

    autoCallTriggered.current = true;
    startPriyaCall();

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(PRIYA_CALL_QUERY);
    setSearchParams(nextParams, { replace: true });
  }, [
    pathname,
    shouldAutoCall,
    configReady,
    isConfigured,
    searchParams,
    setSearchParams,
    startPriyaCall,
  ]);

  if (!shouldShowPriyaWidget(pathname)) {
    return null;
  }

  return (
    <div className="group fixed bottom-6 right-6 z-[70]">
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 mb-3 w-64 rounded-xl border border-purple-400/30 bg-slate-900/95 px-4 py-3 text-sm leading-relaxed text-slate-100 shadow-xl shadow-purple-500/20 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
      >
        <p className="font-semibold text-purple-200">Namaste! Main Priya hoon.</p>
        <p className="mt-1 text-slate-300">
          Main aapki library ko digitalize karne mein help kar sakti hoon — online seat booking,
          Razorpay payments, GPS attendance aur revenue dashboard.
        </p>
      </div>
      <button
        type="button"
        onClick={handleCallClick}
        disabled={isStarting || !configReady}
        aria-label="Call to Priya for library management enquiry"
        title="Priya se baat karein — library digitalize karne mein help"
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-105 hover:shadow-purple-500/50 disabled:cursor-wait disabled:opacity-80"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {isStarting ? '⏳' : '📞'}
        </span>
        <span>
          {!configReady ? 'Loading...' : isStarting ? 'Connecting...' : 'Call to Priya'}
        </span>
      </button>
    </div>
  );
}
