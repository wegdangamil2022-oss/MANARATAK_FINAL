import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { AIKnowledgeUseCases, AIPlatformAdminUseCases, AIEvaluationUseCases, AIWorkflowUseCases } from '@manaratak/application';

const resourceSchema = z.enum(['providers', 'models', 'modelPrices', 'capabilities', 'routingPolicies', 'prompts', 'guardrails', 'consumers', 'workflows', 'evaluations', 'knowledgeIndexes', 'knowledgeSources', 'incidents', 'platformSettings']);
const keySchema = z.string().trim().min(1).max(160).regex(/^[a-zA-Z0-9_.:-]+$/);
const safeRecord = z.record(z.string(), z.unknown()).superRefine((value, context) => {
  for (const key of Object.keys(value)) if (/api.?key|secretValue|accessToken|authorization|password/i.test(key)) context.addIssue({ code: 'custom', path: [key], message: 'Secret values are forbidden. Use secretReference.' });
});

export class AIAdminRouter {
  static create(cradle: { aiPlatformAdminUseCases: AIPlatformAdminUseCases; aiWorkflowUseCases: AIWorkflowUseCases; aiEvaluationUseCases: AIEvaluationUseCases; aiKnowledgeUseCases: AIKnowledgeUseCases }): Router {
    const router = Router();
    const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res)).catch(next);
    const actor = (req: Request) => { if (!req.authUserId) throw new Error('AI_AUTHENTICATED_ACTOR_REQUIRED'); return req.authUserId; };

    router.get('/overview', asyncHandler(async (_req, res) => { res.json(await cradle.aiPlatformAdminUseCases.overview()); }));
    router.get('/provider-statuses', asyncHandler(async (_req, res) => { res.json({ data: cradle.aiPlatformAdminUseCases.providerStatuses() }); }));
    router.get('/executions', asyncHandler(async (req, res) => { res.json(await cradle.aiPlatformAdminUseCases.executions(req.query as Record<string, unknown>)); }));
    router.get('/executions/:publicId', asyncHandler(async (req, res) => { const value = await cradle.aiPlatformAdminUseCases.execution(req.params.publicId); if (!value) { res.status(404).json({ error: 'AI_EXECUTION_NOT_FOUND' }); return; } res.json(value); }));
    router.get('/:resource', asyncHandler(async (req, res) => { const resource = resourceSchema.parse(req.params.resource); res.json({ data: await cradle.aiPlatformAdminUseCases.list(resource, req.query as Record<string, unknown>) }); }));
    router.get('/:resource/:key', asyncHandler(async (req, res) => { const resource = resourceSchema.parse(req.params.resource); const value = await cradle.aiPlatformAdminUseCases.find(resource, keySchema.parse(req.params.key)); if (!value) { res.status(404).json({ error: 'AI_RESOURCE_NOT_FOUND' }); return; } res.json(value); }));
    router.put('/:resource/:key', asyncHandler(async (req, res) => { const resource = resourceSchema.parse(req.params.resource); const key = keySchema.parse(req.params.key); const body = safeRecord.parse(req.body); res.json(await cradle.aiPlatformAdminUseCases.save(resource, { ...body, key } as any, actor(req))); }));
    router.post('/prompts/:key/versions', asyncHandler(async (req, res) => { const body = z.object({ version: z.number().int().positive(), template: z.string().min(1).max(100000), inputSchema: safeRecord.optional().nullable(), outputSchema: safeRecord.optional().nullable(), status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'RETIRED']).default('DRAFT'), approvedBy: z.string().optional().nullable() }).parse(req.body); res.status(201).json(await cradle.aiPlatformAdminUseCases.createPromptVersion({ ...body, promptKey: keySchema.parse(req.params.key), createdBy: actor(req) })); }));
    router.post('/prompts/:key/deployments', asyncHandler(async (req, res) => { const body = z.object({ version: z.number().int().positive() }).parse(req.body); res.json(await cradle.aiPlatformAdminUseCases.deployPrompt(keySchema.parse(req.params.key), body.version, actor(req))); }));
    router.post('/prompts/:key/rollback', asyncHandler(async (req, res) => { const body = z.object({ version: z.number().int().positive() }).parse(req.body); res.json(await cradle.aiPlatformAdminUseCases.rollbackPrompt(keySchema.parse(req.params.key), body.version, actor(req))); }));
    router.post('/workflows/:key/runs', asyncHandler(async (req, res) => { res.status(202).json(await cradle.aiWorkflowUseCases.start(keySchema.parse(req.params.key), safeRecord.parse(req.body))); }));
    router.post('/evaluations/:key/runs', asyncHandler(async (req, res) => { res.status(202).json(await cradle.aiEvaluationUseCases.start(keySchema.parse(req.params.key), z.object({ promptVersion: z.number().int().positive().optional(), modelKey: keySchema.optional() }).parse(req.body))); }));
    router.post('/knowledge-indexes/:key/index', asyncHandler(async (req, res) => { const body = z.object({ sourceType: keySchema, sourceReferenceId: z.string().min(1).max(500), sourceVersion: z.string().max(200).optional(), locale: z.string().max(20).optional(), content: z.string().min(1).max(2_000_000) }).parse(req.body); res.status(202).json(await cradle.aiKnowledgeUseCases.index({ indexKey: keySchema.parse(req.params.key), ...body, actorReferenceId: actor(req) })); }));
    router.post('/incidents/:publicId/events', asyncHandler(async (req, res) => { const body = z.object({ action: z.string().min(1), note: z.string().max(4000).optional() }).parse(req.body); res.json(await cradle.aiPlatformAdminUseCases.appendIncidentEvent(req.params.publicId, body.action, actor(req), body.note)); }));
    return router;
  }
}
