import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages project site: https://steveno-ls.github.io/lscursor/ — base must be `/repo-name/`.
// For a user/org root site (https://steveno-ls.github.io/ only), set base to '/'.
export default defineConfig({
  base: '/lscursor/',
  plugins: [react()],
})
