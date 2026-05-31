import { defineConfig } from 'vite'

export default defineConfig({
  // Set base to '/' for Netlify, or '/krishnasongs/' for GitHub Pages
  // Change to your repo name if deploying to GitHub Pages:
  // base: '/krishnasongs/',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
