import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic',
    include: ['**/*.jsx', '**/*.js']
  })],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      input: './index.html'
    }
  },
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  }
})
