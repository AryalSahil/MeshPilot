import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file from workspace root
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    // Ensure VITE_CLERK_PUBLISHABLE_KEY is loaded in client even when served through Express middleware
    define: {
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(
        env.VITE_CLERK_PUBLISHABLE_KEY || 
        process.env.VITE_CLERK_PUBLISHABLE_KEY || 
        'pk_live_Y2xlcmsubWVzaHBpbG90LnZlcmNlbC5hcHAk'
      ),
      'import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': JSON.stringify(
        env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
        'pk_live_Y2xlcmsubWVzaHBpbG90LnZlcmNlbC5hcHAk'
      )
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
