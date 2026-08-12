import { describe, expect, it, vi, beforeEach } from 'vitest';
import { 
  Role, 
  PermissionReference, 
  RoleAssignment, 
  AuthorizationEvaluatorService, 
  AccessDecision 
} from '@manaratak/domain';
import { 
  InMemoryRoleRepository, 
  InMemoryPolicyRepository, 
  InMemoryRoleAssignmentRepository,
  DefaultPolicyEvaluator 
} from '@manaratak/infrastructure';
import { SecurityMiddlewareFactory } from '../../../src/presentation/security/SecurityMiddlewareFactory';

function createResponse() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    locals: {} as Record<string, unknown>,
    payload: undefined as unknown,
    setHeader: vi.fn(function (this: any, key: string, value: string) {
      this.headers[key] = value;
    }),
    status: vi.fn(function (this: any, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn(function (this: any, payload: unknown) {
      this.payload = payload;
      return this;
    }),
  };
}

describe('Runtime RBAC Authority & Permission Evaluation', () => {
  let roleRepo: InMemoryRoleRepository;
  let policyRepo: InMemoryPolicyRepository;
  let assignmentRepo: InMemoryRoleAssignmentRepository;
  let policyEvaluator: DefaultPolicyEvaluator;
  let evaluatorService: AuthorizationEvaluatorService;

  beforeEach(() => {
    roleRepo = new InMemoryRoleRepository();
    policyRepo = new InMemoryPolicyRepository();
    assignmentRepo = new InMemoryRoleAssignmentRepository();
    policyEvaluator = new DefaultPolicyEvaluator();

    evaluatorService = new AuthorizationEvaluatorService(
      roleRepo,
      policyRepo,
      assignmentRepo,
      policyEvaluator
    );
  });

  it('ALLOWS admin when principal has persisted administrator role with wildcard permission', async () => {
    // 1. Seed database with role and assignment
    const adminRole = new Role({
      id: 'administrator',
      name: 'Administrator',
      description: 'Full admin access',
      permissions: [new PermissionReference('admin:*')],
      policyIds: [],
    });
    await roleRepo.save(adminRole);

    const assignment = new RoleAssignment({
      id: 'assign-admin-1',
      identityId: 'admin-root-id',
      roleId: 'administrator',
      assignedAt: new Date(),
    });
    await assignmentRepo.save(assignment);

    // 2. Guard evaluation for admin:assets:manage
    const guard = SecurityMiddlewareFactory.createAdminPermissionGuard('admin:assets:manage', evaluatorService);
    const req = { authUserId: 'admin-root-id', headers: {} } as any;
    const res = createResponse();
    const next = vi.fn();

    await guard(req, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(res.headers['X-Admin-Required-Permission']).toBe('admin:assets:manage');
  });

  it('DENIES access when user has a different role without required permission', async () => {
    // Seed student role and assignment
    const studentRole = new Role({
      id: 'student',
      name: 'Student',
      description: 'Student access',
      permissions: [new PermissionReference('student:workspace:read')],
      policyIds: [],
    });
    await roleRepo.save(studentRole);

    const assignment = new RoleAssignment({
      id: 'assign-student-1',
      identityId: 'student-id-100',
      roleId: 'student',
      assignedAt: new Date(),
    });
    await assignmentRepo.save(assignment);

    const guard = SecurityMiddlewareFactory.createAdminPermissionGuard('admin:assets:manage', evaluatorService);
    const req = { authUserId: 'student-id-100', headers: {} } as any;
    const res = createResponse();
    const next = vi.fn();

    await guard(req, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.payload).toEqual({
      error: {
        code: 'ADMIN_PERMISSION_DENIED',
        message: 'Admin permission is denied.',
      },
      meta: {
        timestamp: expect.any(String),
        requiredPermission: 'admin:assets:manage',
      },
    });
  });

  it('DENIES access when user has NO role assignment in database', async () => {
    const guard = SecurityMiddlewareFactory.createAdminPermissionGuard('admin:imports:manage', evaluatorService);
    const req = { authUserId: 'unassigned-user-id', headers: {} } as any;
    const res = createResponse();
    const next = vi.fn();

    await guard(req, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.payload.error.code).toBe('ADMIN_PERMISSION_DENIED');
  });

  it('DENIES access immediately when role assignment is revoked (deleted)', async () => {
    // 1. Grant role
    const role = new Role({
      id: 'custom-admin',
      name: 'Custom Admin',
      description: 'Temp admin',
      permissions: [new PermissionReference('admin:imports:manage')],
      policyIds: [],
    });
    await roleRepo.save(role);

    const assignment = new RoleAssignment({
      id: 'assign-temp',
      identityId: 'temp-user-id',
      roleId: 'custom-admin',
      assignedAt: new Date(),
    });
    await assignmentRepo.save(assignment);

    const guard = SecurityMiddlewareFactory.createAdminPermissionGuard('admin:imports:manage', evaluatorService);

    // Initial check: ALLOW
    const req1 = { authUserId: 'temp-user-id', headers: {} } as any;
    const res1 = createResponse();
    const next1 = vi.fn();
    await guard(req1, res1 as any, next1);
    expect(next1).toHaveBeenCalled();

    // Revoke assignment
    await assignmentRepo.delete('assign-temp');

    // Subsequent check: DENIED
    const req2 = { authUserId: 'temp-user-id', headers: {} } as any;
    const res2 = createResponse();
    const next2 = vi.fn();
    await guard(req2, res2 as any, next2);

    expect(next2).not.toHaveBeenCalled();
    expect(res2.statusCode).toBe(403);
    expect(res2.payload.error.code).toBe('ADMIN_PERMISSION_DENIED');
  });

  it('IGNORES fake client headers trying to claim admin permissions', async () => {
    const guard = SecurityMiddlewareFactory.createAdminPermissionGuard('admin:universities:manage', evaluatorService);

    // Client passes spoofed headers
    const req = {
      authUserId: 'ordinary-user-id',
      headers: {
        'x-admin-role': 'DEMO_SUPER_ADMIN',
        'x-admin-permissions': 'admin:*',
        'manaratak_demo_role': 'administrator',
      },
    } as any;
    const res = createResponse();
    const next = vi.fn();

    await guard(req, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.payload.error.code).toBe('ADMIN_PERMISSION_DENIED');
  });

  it('REJECTS unauthenticated requests with HTTP 401', async () => {
    const guard = SecurityMiddlewareFactory.createAdminPermissionGuard('admin:majors:manage', evaluatorService);

    const req = { headers: {} } as any; // No authUserId
    const res = createResponse();
    const next = vi.fn();

    await guard(req, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.payload.error.code).toBe('ADMIN_AUTH_REQUIRED');
  });

  it('ENFORCES permission evaluation across all 11 active Phase 2-10 admin domains', async () => {
    const domains = [
      'admin:identities:manage',
      'admin:authorization:manage',
      'admin:settings:manage',
      'admin:imports:manage',
      'admin:reference-data:manage',
      'admin:academic-taxonomy:manage',
      'admin:international-tests:manage',
      'admin:universities:manage',
      'admin:majors:manage',
      'admin:assets:manage',
      'admin:audit:manage',
    ];

    for (const permission of domains) {
      const guard = SecurityMiddlewareFactory.createAdminPermissionGuard(permission, evaluatorService);
      const req = { authUserId: 'unauthorized-user', headers: {} } as any;
      const res = createResponse();
      const next = vi.fn();

      await guard(req, res as any, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
      expect(res.payload.error.code).toBe('ADMIN_PERMISSION_DENIED');
    }
  });

  it('BEARER SAFETY: Static bearer token identifies principal but DOES NOT bypass persisted RBAC evaluation', async () => {
    // Principal identified via bearer, but has no DB role assignments
    const guard = SecurityMiddlewareFactory.createAdminPermissionGuard('admin:settings:manage', evaluatorService);
    const req = {
      authUserId: 'admin-root',
      headers: {
        authorization: 'Bearer static-valid-admin-token'
      }
    } as any;
    const res = createResponse();
    const next = vi.fn();

    await guard(req, res as any, next);

    // DENIED because no persisted role assignment exists in DB for 'admin-root'
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.payload.error.code).toBe('ADMIN_PERMISSION_DENIED');
  });
});
