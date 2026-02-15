import path from 'node:path'

import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const shouldAnalyze = process.env.ANALYZE === 'true' || env.ANALYZE === 'true'

  return {
    plugins: [
      tailwindcss(),
      react(),
      shouldAnalyze &&
        visualizer({
          filename: 'bundle-analysis.html',
          emitFile: true,
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap',
        }),
    ],
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/graphql': path.resolve(__dirname, './src/graphql'),
      },
    },
    esbuild: {
      loader: 'tsx',
      include: /src\/.*\.[tj]sx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.ts': 'tsx',
          '.tsx': 'tsx',
        },
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      hmr: {
        overlay: true,
      },
      proxy: {
        '/graphql': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'build',
      sourcemap: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        treeshake: true,
        output: {
          manualChunks(id: string): string | undefined {
            return id.includes('node_modules') ? 'vendor' : undefined
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    },
  }
})
