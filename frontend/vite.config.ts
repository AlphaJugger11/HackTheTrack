import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'plotly': ['react-plotly.js', 'plotly.js'],
          'vendor': ['react', 'react-dom'],
          'd3': ['d3'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
