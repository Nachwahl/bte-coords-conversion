import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import inject from '@rollup/plugin-inject'
import fixConformalPlugin from './fix-conformal-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    inject({
      Buffer: ['buffer', 'Buffer'],
    }),
    fixConformalPlugin(),
  ],
  base: '/bte-coords-conversion/',
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'buffer': 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer', '@bte-germany/terraconvert'],
    exclude: [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      esmExternals: false,
      requireReturnsDefault: 'auto',
      defaultIsModuleExports: true,
    },
  },
})
