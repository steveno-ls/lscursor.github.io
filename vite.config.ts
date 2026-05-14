import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Project Pages URL: https://steveno-ls.github.io/lscursor.github.io/ — base must match repo name + slashes.
// If you move this app to a user/org root site (https://steveno-ls.github.io/ only), set base to '/'.
export default defineConfig({
  base: '/lscursor.github.io/',
  plugins: [react()],
})
