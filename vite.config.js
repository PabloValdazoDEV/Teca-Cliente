import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import { fileURLToPath } from "node:url";
import tailwindcss from '@tailwindcss/vite'

const projectDirectory = fileURLToPath(new URL('.', import.meta.url));
const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export default defineConfig({
  plugins: [react(),  tailwindcss()],
  base: "/",
  server: {
    headers: isolationHeaders,
    // Solo en desarrollo: con VITE_API_URL=/api la web y la API comparten origen,
    // lo que permite probar desde el móvil en la misma Wi-Fi (npm run dev:lan).
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      },
    },
  },
  preview: { headers: isolationHeaders },
  resolve:{

    alias: {
      '@': path.resolve(projectDirectory, './src'),
    }
  }
})
