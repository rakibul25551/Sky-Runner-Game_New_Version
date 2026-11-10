import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// assetsInlineLimit: the two bundled fonts (~10 KB each) are inlined into the CSS as data URIs,
// so `npm run build:single` (play/index.html) keeps working fully offline.
export default defineConfig({
  plugins: [react()],
  build: { assetsInlineLimit: 100000 },
})
