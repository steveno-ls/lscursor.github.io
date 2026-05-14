import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// User/org Pages site (e.g. lscursor.github.io) is served from domain root — keep base '/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
