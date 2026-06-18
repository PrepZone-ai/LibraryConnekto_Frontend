import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  const values = {};
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const viteEnv = loadEnv(mode, process.cwd(), '');
const vercelEnv = parseEnvFile(resolve('.vercel/.env.production.local'));
const merged = { ...viteEnv, ...vercelEnv, ...process.env };

const config = {
  publicKey: merged.VITE_RETELL_PUBLIC_KEY || '',
  voiceAgentId: merged.VITE_RETELL_VOICE_AGENT_ID || '',
  agentVersion: merged.VITE_RETELL_AGENT_VERSION || '2',
  widgetTitle: merged.VITE_RETELL_WIDGET_TITLE || 'Priya',
  whiteLabelToken:
    merged.VITE_RETELL_WHITE_LABEL || merged.VITE_RETELL_WHITE_LABEL_TOKEN || '',
};

writeFileSync('public/retell-config.json', `${JSON.stringify(config, null, 2)}\n`);

console.log('[retell-config] wrote public/retell-config.json', {
  publicKey: config.publicKey ? 'set' : 'missing',
  voiceAgentId: config.voiceAgentId ? 'set' : 'missing',
  agentVersion: config.agentVersion,
});
