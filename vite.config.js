import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Bind IPv4 as well as IPv6 so http://127.0.0.1:5173 matches email reset links (Windows [::1]-only listen can refuse 127.0.0.1).
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
})
