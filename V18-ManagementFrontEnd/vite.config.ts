import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  css: {
    // point Vite to the CommonJS postcss config so PostCSS loads under "type: module"
    postcss: './postcss.config.cjs',
  },
});
