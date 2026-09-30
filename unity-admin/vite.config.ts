import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// The React admin is served UNDER the /admin path (mirroring the legacy panel URL),
// so every built asset must be requested from /admin/... . HashRouter is used for
// in-app routes, so the server only ever needs to serve the shell at /admin.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 8096,
    host: '0.0.0.0',
    // In `npm run dev`, proxy the data to the unity proxy on :8091 so requests
    // reach the live production backend with cookies attached.
    proxy: {
      '/rest': 'http://localhost:8091',
      '/customer': 'http://localhost:8091',
      '/orchestration': 'http://localhost:8091',
      '/task': 'http://localhost:8091',
      '/mcp': 'http://localhost:8091',
      // Admin tool endpoints that live OUTSIDE /rest (proxy cookies, importer, hijack).
      '/func': 'http://localhost:8091',
      '/tools': 'http://localhost:8091',
      '/hijack': 'http://localhost:8091',
      // Django two-factor wizard (account/two_factor).
      '/account': 'http://localhost:8091',
      '/salesforce': 'http://localhost:8091',
      '/static': 'http://localhost:8095',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
