import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Tauri serves the dev server on a fixed port and loads the built files from dist
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  build: {
    target: 'safari15',
    outDir: 'dist',
  },
})
