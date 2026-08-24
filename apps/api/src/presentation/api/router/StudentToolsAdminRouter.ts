import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { StudentToolExecutionUseCases, StudentToolRegistryUseCases } from '@manaratak/application';
import { StudentToolLifecycleStatus } from '@manaratak/domain';
export class StudentToolsAdminRouter {
  static create(cradle: {
    studentToolRegistryUseCases: StudentToolRegistryUseCases;
    studentToolExecutionUseCases: StudentToolExecutionUseCases;
  }) {
    const router = Router();
    const actor = (req: Request) => {
      if (!req.authUserId) throw new Error('AUTHENTICATED_ADMIN_ACTOR_REQUIRED');
      return req.authUserId;
    };
    const safe =
      (fn: (req: Request, res: Response) => Promise<unknown>) =>
      (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res)).catch(next);
    router.get(
      '/overview',
      safe(async (_req, res) => {
        const [tools, telemetry] = await Promise.all([
          cradle.studentToolRegistryUseCases.listAdminTools(),
          cradle.studentToolRegistryUseCases.telemetry(),
        ]);
        res.json({
          data: {
            total: tools.length,
            implemented: tools.filter((item) => item.implementationStatus === 'IMPLEMENTED').length,
            active: tools.filter(
              (item) => item.lifecycle === 'ACTIVE' && item.visibility === 'ACTIVE',
            ).length,
            planned: tools.filter((item) => item.implementationStatus === 'PLANNED').length,
            telemetry,
          },
        });
      }),
    );
    router.get(
      '/',
      safe(async (req, res) => {
        res.json({
          data: await cradle.studentToolRegistryUseCases.listAdminTools({
            category: typeof req.query.category === 'string' ? req.query.category : undefined,
            visibility: typeof req.query.visibility === 'string' ? req.query.visibility : undefined,
            implementationStatus:
              typeof req.query.implementationStatus === 'string'
                ? req.query.implementationStatus
                : undefined,
            search: typeof req.query.search === 'string' ? req.query.search : undefined,
          }),
        });
      }),
    );
    router.get(
      '/:toolKey',
      safe(async (req, res) => {
        const [tool, telemetry, executions, audit] = await Promise.all([
          cradle.studentToolRegistryUseCases.findTool(req.params.toolKey),
          cradle.studentToolRegistryUseCases.telemetry(req.params.toolKey),
          cradle.studentToolRegistryUseCases.executions(req.params.toolKey, 1, 25),
          cradle.studentToolRegistryUseCases.audit(req.params.toolKey),
        ]);
        if (!tool) return void res.status(404).json({ error: 'TOOL_NOT_FOUND' });
        res.json({ data: { tool, telemetry, executions, audit } });
      }),
    );
    router.patch(
      '/:toolKey/metadata',
      safe(async (req, res) => {
        const patch = z
          .object({
            nameAr: z.string().min(1).optional(),
            nameEn: z.string().min(1).optional(),
            descriptionAr: z.string().optional(),
            descriptionEn: z.string().optional(),
            estimatedMinutes: z.number().int().min(0).optional(),
            iconAssetId: z.string().nullable().optional(),
          })
          .parse(req.body);
        res.json({
          data: await cradle.studentToolRegistryUseCases.update(
            req.params.toolKey,
            patch,
            actor(req),
          ),
        });
      }),
    );
    router.patch(
      '/:toolKey/availability',
      safe(async (req, res) => {
        const availability = z
          .object({
            publicEnabled: z.boolean(),
            anonymousEnabled: z.boolean(),
            authenticatedEnabled: z.boolean(),
            adminOnly: z.boolean(),
            allowedLocales: z.array(z.enum(['ar', 'en'])),
            allowedRegions: z.array(z.string()),
            maintenanceMode: z.boolean(),
          })
          .parse(req.body);
        res.json({
          data: await cradle.studentToolRegistryUseCases.update(
            req.params.toolKey,
            { availability },
            actor(req),
          ),
        });
      }),
    );
    router.patch(
      '/:toolKey/flags',
      safe(async (req, res) => {
        const featureFlags = z
          .object({
            globallyEnabled: z.boolean(),
            anonymousEnabled: z.boolean(),
            authenticatedEnabled: z.boolean(),
            maintenanceMode: z.boolean(),
          })
          .parse(req.body);
        res.json({
          data: await cradle.studentToolRegistryUseCases.update(
            req.params.toolKey,
            { featureFlags },
            actor(req),
          ),
        });
      }),
    );
    router.post(
      '/:toolKey/lifecycle/:action',
      safe(async (req, res) => {
        const actions: Record<string, StudentToolLifecycleStatus> = {
          activate: StudentToolLifecycleStatus.ACTIVE,
          testing: StudentToolLifecycleStatus.TESTING,
          deprecate: StudentToolLifecycleStatus.DEPRECATED,
          retire: StudentToolLifecycleStatus.RETIRED,
        };
        const lifecycle = actions[req.params.action];
        if (!lifecycle) throw new Error('INVALID_LIFECYCLE_ACTION');
        res.json({
          data: await cradle.studentToolRegistryUseCases.transition(
            req.params.toolKey,
            lifecycle,
            actor(req),
          ),
        });
      }),
    );
    router.post(
      '/:toolKey/test',
      safe(async (req, res) => {
        actor(req);
        const result = await cradle.studentToolExecutionUseCases.execute(req.params.toolKey, {
          input: req.body.input,
          locale: req.body.locale === 'en' ? 'en' : 'ar',
          consumerType: 'ADMIN_TEST',
          authenticatedStudentReference: req.authUserId,
          isTest: true,
        });
        res.json({ data: result });
      }),
    );
    router.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (error instanceof z.ZodError)
        return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.issues });
      const code = error instanceof Error ? error.message : 'STUDENT_TOOL_ADMIN_ERROR';
      res.status(code.includes('NOT_FOUND') ? 404 : 400).json({ error: code });
    });
    return router;
  }
}
