/// <reference types="vitest" />
import { defineConfig } from 'vite';

module.exports = defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/vitest-setup.ts'],
  },
});
