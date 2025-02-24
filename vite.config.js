import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"; // Optional, but useful

export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve:{

    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
