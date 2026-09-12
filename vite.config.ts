/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    // Skip type checking during build - only transpile
    target: 'esnext',
    minify: 'esbuild',
  },
  esbuild: {
    // Disable type checking in esbuild
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
