/// <reference types="vitest" />
import { defineConfig } from 'vite';

module.exports = defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/vitest-setup.ts'],
  },
});
