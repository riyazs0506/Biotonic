/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Release builds must not contain demo content, even unrendered: resolve the demo module to
 * an empty stand-in so its text never reaches the client or SSR bundle.
 */
function stripDemoContent(): Plugin {
  const demoIndex = path.resolve(__dirname, 'src/content/demo/index.ts');
  const empty = path.resolve(__dirname, 'src/content/demo/empty.ts');
  return {
    name: 'biotonic:strip-demo-content',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (process.env.VITE_CONTENT_MODE !== 'release' || !importer) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      return resolved?.id === demoIndex ? empty : null;
    },
  };
}

export default defineConfig({
  plugins: [react(), stripDemoContent()],
  server: {
    port: 5173,
    // During development the enquiry API runs separately (`npm run dev:server`).
    proxy: { '/api': 'http://localhost:8787' },
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts', 'scripts/**/*.test.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
