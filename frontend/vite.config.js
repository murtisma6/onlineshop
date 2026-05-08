import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 80,
    host: '192.168.0.105',
    allowedHosts: [
      "deaths-feeding-trinity-reporter.trycloudflare.com"
    ]
  }
})
