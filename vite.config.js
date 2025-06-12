import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // FIX: Directly define the URL string here
    // This bypasses any issues with process.env.VITE_API_URL not being read by Vite's define
    'import.meta.env.VITE_API_URL': JSON.stringify('https://konarcard-backend-331608269918.europe-west1.run.app')
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})