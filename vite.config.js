import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (no prefix filtering) so we can configure the dev proxy.
  const env = loadEnv(mode, process.cwd(), '')
  const cloudflarePublicApi = env.CLOUDFLARE_PUBLIC_API || env.VITE_CLOUDFLARE_PUBLIC_API

  return {
    plugins: [react()],
    // Vite only exposes env vars with the configured prefix to the client (default: VITE_).
    // Since this is a public URL, it's safe to also expose CLOUDFLARE_* variables.
    envPrefix: ['VITE_', 'CLOUDFLARE_'],

    // Dev-only: proxy requests through the Vite server to avoid CORS when fetching JSON.
    // Used by `src/services/cloudflareGallery.js` as `/__cf_r2__/*` in DEV.
    server: cloudflarePublicApi && /^https?:\/\//i.test(cloudflarePublicApi) ? {
      proxy: {
        '/__cf_r2__': {
          target: cloudflarePublicApi,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__cf_r2__/, ''),
        },
      },
    } : undefined,
  }
})
