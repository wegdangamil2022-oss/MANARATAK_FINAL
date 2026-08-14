import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'apps/api/tests/presentation/api/router/MajorImportE2E.spec.ts',
      'packages/infrastructure/tests/auth/RealDatabaseIntegration.spec.ts',
    ],
    testTimeout: 20_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
