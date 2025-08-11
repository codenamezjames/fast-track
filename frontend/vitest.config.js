import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import path from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/css/quasar.variables.scss',
    }),
  ],

  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['test/setup.js'],
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.quasar', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.quasar/', 'test/', '**/*.config.js', '**/*.config.mjs'],
    },
    reporter: ['verbose', 'json'],
    outputFile: 'test-results.json',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      src: path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components'),
      layouts: path.resolve(__dirname, './src/layouts'),
      pages: path.resolve(__dirname, './src/pages'),
      assets: path.resolve(__dirname, './src/assets'),
      boot: path.resolve(__dirname, './src/boot'),
      stores: path.resolve(__dirname, './src/stores'),
      router: path.resolve(__dirname, './src/router'),
      services: path.resolve(__dirname, './src/services'),
    },
  },

  define: {
    __QUASAR_VERSION__: JSON.stringify('2.16.0'),
    __QUASAR_SSR__: false,
    __QUASAR_SSR_SERVER__: false,
    __QUASAR_SSR_CLIENT__: false,
    __QUASAR_SSR_PWA__: false,
  },
})
