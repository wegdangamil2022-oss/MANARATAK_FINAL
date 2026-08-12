export type ProductionReadinessSeverity = 'BLOCKER' | 'WARNING' | 'INFO';

export interface ProductionReadinessBlocker {
  id: string;
  title: string;
  severity: ProductionReadinessSeverity;
  area: 'Authentication' | 'Authorization' | 'Sessions' | 'Secrets' | 'Persistence' | 'Operations';
  description: string;
  requiredAction: string;
}

export const productionReadinessBlockers: ProductionReadinessBlocker[] = [
  {
    id: 'role-permission-enforcement',
    title: 'Role and permission enforcement',
    severity: 'BLOCKER',
    area: 'Authorization',
    description: 'Admin route authentication guard exists, but fine-grained role and permission policies are not yet enforced per domain action.',
    requiredAction: 'Enforce role-based access checks on admin API routes and UI route guards for each domain capability.',
  },
  {
    id: 'redis-session-manager',
    title: 'Redis session integration',
    severity: 'BLOCKER',
    area: 'Sessions',
    description: 'RedisSessionManager now supports persistence, revocation, expiry, and validation, but production auth wiring and rollout validation are still pending.',
    requiredAction: 'Wire RedisSessionManager into authenticated runtime flows and verify refresh-token rotation, logout, and revoke-all behavior end to end.',
  },
  {
    id: 'production-secrets',
    title: 'Production secrets and environment review',
    severity: 'WARNING',
    area: 'Secrets',
    description: 'Production readiness validator now reports environment blockers, but real deployment secrets must still come from the hosting secret manager.',
    requiredAction: 'Use the production readiness endpoint as the release gate and keep all real secrets outside the repository.',
  },
  {
    id: 'inmemory-repositories',
    title: 'Remaining in-memory repositories',
    severity: 'WARNING',
    area: 'Persistence',
    description: 'Several non-critical domains still use InMemory or Mock implementations in prototype mode.',
    requiredAction: 'Replace launch-critical repositories with Prisma-backed implementations before real production data entry.',
  },
  {
    id: 'uat-runbook',
    title: 'UAT launch runbook',
    severity: 'INFO',
    area: 'Operations',
    description: 'Public and admin features need a manual UAT checklist before pilot users access the system.',
    requiredAction: 'Prepare route-by-route UAT checklist, smoke credentials, rollback steps, and known limitations.',
  },
];

export function getBlockingReadinessCount() {
  return productionReadinessBlockers.filter((item) => item.severity === 'BLOCKER').length;
}
