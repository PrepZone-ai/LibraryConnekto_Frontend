import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute - data stays fresh for 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes - cache persists for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry failed requests once
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

// Keep PWA service worker only in production.
// In dev, remove old registrations/caches so Vite module requests are not intercepted.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (import.meta.env.PROD) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })

        // Force an update check on every load so a redeployed sw.js is picked
        // up immediately instead of being served from the HTTP cache.
        reg.update().catch(() => {})

        // When a brand new SW takes control (e.g. user is upgrading from a
        // broken v1/v2), reload once so they run the freshest app code paired
        // with the freshest SW. Guarded against reload loops.
        let hasReloaded = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (hasReloaded) return
          hasReloaded = true
          window.location.reload()
        })
      } catch {
        // no-op: registration failure can be ignored for non-HTTPS dev
      }
      return
    }

    try {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((reg) => reg.unregister()))

      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.map((key) => caches.delete(key)))
    } catch {
      // no-op: cleanup failure should not break local development
    }
  })
}
