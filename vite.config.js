import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function retellEnvCheckPlugin(mode) {
  return {
    name: 'retell-env-check',
    buildStart() {
      const env = loadEnv(mode, process.cwd(), '')
      if (mode === 'production' && (!env.VITE_RETELL_PUBLIC_KEY || !env.VITE_RETELL_VOICE_AGENT_ID)) {
        console.warn(
          '\n[build] WARNING: VITE_RETELL_PUBLIC_KEY or VITE_RETELL_VOICE_AGENT_ID is missing.\n' +
            '       "Call to Priya" will not work until these are set in Vercel and you redeploy.\n',
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), retellEnvCheckPlugin(mode)],
  // Bind IPv4 as well as IPv6 so http://127.0.0.1:5173 matches email reset links (Windows [::1]-only listen can refuse 127.0.0.1).
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
}))
