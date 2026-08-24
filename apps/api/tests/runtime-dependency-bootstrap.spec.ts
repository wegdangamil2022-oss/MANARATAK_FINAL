import { describe, expect, it } from 'vitest';
import { createApiApp } from '../src/app';

describe('API runtime dependency bootstrap', () => {
  it('allows normal source-only development to start without DATABASE_URL', async () => {
    await expect(createApiApp({ resetCache: true, env: { NODE_ENV: 'development' } })).resolves.toBeDefined();
  });

  it('stops development-like runtime closure when DATABASE_URL is absent', async () => {
    await expect(createApiApp({ resetCache: true, env: { NODE_ENV: 'development', RUNTIME_CLOSURE_MODE: 'true' } }))
      .rejects.toThrow('DATABASE_URL is required for this runtime mode');
  });
});
