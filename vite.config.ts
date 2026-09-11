import { defineConfig } from 'vitest/config';

const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  root: '.',
  publicDir: 'public',
  appType: 'spa',
  server: {
    port,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port,
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
