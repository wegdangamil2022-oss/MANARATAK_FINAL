import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      'apps/api/tests/presentation/api/router/MajorImportE2E.spec.ts',
      'apps/api/tests/presentation/api/router/CheckDbE2E.spec.ts',
      'packages/infrastructure/tests/auth/RealDatabaseIntegration.spec.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
