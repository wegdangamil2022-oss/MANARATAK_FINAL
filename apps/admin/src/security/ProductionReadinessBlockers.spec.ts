import { describe, expect, it } from 'vitest';
import { getBlockingReadinessCount, productionReadinessBlockers } from './ProductionReadinessBlockers';

describe('production readiness blockers', () => {
  it('tracks launch-critical admin and session blockers', () => {
    expect(productionReadinessBlockers.some((item) => item.id === 'redis-session-manager' && item.severity === 'BLOCKER')).toBe(true);
    expect(productionReadinessBlockers.some((item) => item.id === 'production-secrets' && item.severity === 'WARNING')).toBe(true);
  });

  it('reports the active blocking count', () => {
    expect(getBlockingReadinessCount()).toBe(2);
  });
});
