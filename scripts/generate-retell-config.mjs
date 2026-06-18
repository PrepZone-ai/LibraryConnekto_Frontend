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

function readExistingConfig(outputPath) {
  if (!existsSync(outputPath)) return null;

  try {
    return JSON.parse(readFileSync(outputPath, 'utf8'));
  } catch {
    return null;
  }
}

function loadAllEnvSources() {
  const cwd = process.cwd();

  return Object.assign(
    {},
    loadEnv('development', cwd, ''),
    loadEnv('production', cwd, ''),
    parseEnvFile(resolve('.env')),
    parseEnvFile(resolve('.env.local')),
    parseEnvFile(resolve('.env.production')),
    parseEnvFile(resolve('.env.production.local')),
    parseEnvFile(resolve('.vercel/.env.production.local')),
    process.env,
  );
}

const merged = loadAllEnvSources();
const outputPath = resolve('public/retell-config.json');
const existing = readExistingConfig(outputPath);

const config = {
  publicKey: merged.VITE_RETELL_PUBLIC_KEY || '',
  voiceAgentId: merged.VITE_RETELL_VOICE_AGENT_ID || '',
  agentVersion: merged.VITE_RETELL_AGENT_VERSION || '2',
  widgetTitle: merged.VITE_RETELL_WIDGET_TITLE || 'Priya',
  whiteLabelToken:
    merged.VITE_RETELL_WHITE_LABEL || merged.VITE_RETELL_WHITE_LABEL_TOKEN || '',
};

const hasNewKeys = Boolean(config.publicKey && config.voiceAgentId);
const hasExistingKeys = Boolean(existing?.publicKey && existing?.voiceAgentId);

if (!hasNewKeys && hasExistingKeys) {
  console.warn(
    '[retell-config] env vars missing in this build step — keeping existing public/retell-config.json',
  );
  process.exit(0);
}

writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`);

console.log('[retell-config] wrote public/retell-config.json', {
  publicKey: config.publicKey ? 'set' : 'missing',
  voiceAgentId: config.voiceAgentId ? 'set' : 'missing',
  agentVersion: config.agentVersion,
});

if (!hasNewKeys && process.env.CI === 'true') {
  console.warn(
    '[retell-config] static file has no keys — production will use /api/retell-config at runtime if Vercel env is set.',
  );
}
