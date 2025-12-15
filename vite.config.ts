import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { catalogApiPlugin } from './server/catalogApi'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), catalogApiPlugin],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
