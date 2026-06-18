/**
 * Runtime Retell config for production.
 * Reads Vercel env vars at request time (not build time) so Priya always gets fresh keys.
 */
export default function handler(_request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json');

  response.status(200).json({
    publicKey: process.env.VITE_RETELL_PUBLIC_KEY || '',
    voiceAgentId: process.env.VITE_RETELL_VOICE_AGENT_ID || '',
    agentVersion: process.env.VITE_RETELL_AGENT_VERSION || '2',
    widgetTitle: process.env.VITE_RETELL_WIDGET_TITLE || 'Priya',
    whiteLabelToken:
      process.env.VITE_RETELL_WHITE_LABEL ||
      process.env.VITE_RETELL_WHITE_LABEL_TOKEN ||
      '',
  });
}
