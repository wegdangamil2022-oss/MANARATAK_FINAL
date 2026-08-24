import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { StudentToolsPublicRouter } from '../../../../src/presentation/api/router/StudentToolsPublicRouter';

describe('StudentToolsPublicRouter', () => {
  const createUseCases = () => ({
    listPublicTools: vi.fn(),
  });

  const createExecutionUseCases = () => ({
    execute: vi.fn(),
    findExecutionForRequester: vi.fn(),
    saveExecutionForStudent: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createUseCases>, executionUseCases = createExecutionUseCases()) => {
    const app = express();
    app.use(express.json());
    app.use('/tools', StudentToolsPublicRouter.create({
      studentToolRegistryUseCases: useCases as any,
      studentToolExecutionUseCases: executionUseCases as any
    }));
    return app;
  };

  it('returns public student tools', async () => {
    const useCases = createUseCases();
    useCases.listPublicTools.mockResolvedValue([{ toolKey: 'document-checklist', displayName: 'Document Checklist' }]);
    const app = createApp(useCases);

    const res = await request(app).get('/tools?category=Documents');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(useCases.listPublicTools).toHaveBeenCalledWith({ category: 'Documents' });
  });

  it('executes a student tool through the governed execution use case', async () => {
    const useCases = createUseCases();
    const executionUseCases = createExecutionUseCases();
    executionUseCases.execute.mockResolvedValue({ toolKey: 'major-fit-helper', executionPublicId: 'ai-1', status: 'COMPLETED', output: 'Suggested majors' });
    const app = createApp(useCases, executionUseCases);

    const res = await request(app).post('/tools/major-fit-helper/execute').send({ input: 'I like science.' });

    expect(res.status).toBe(200);
    expect(res.body.data.output).toBe('Suggested majors');
    expect(executionUseCases.execute).toHaveBeenCalledWith('major-fit-helper', expect.objectContaining({
      input: 'I like science.',
      consumerType: 'ANONYMOUS',
      anonymousSessionReference: expect.any(String),
    }));
  });

  it('derives receipt ownership from the request instead of query input', async () => {
    const useCases = createUseCases();
    const executionUseCases = createExecutionUseCases();
    executionUseCases.findExecutionForRequester.mockResolvedValue(null);
    const app = createApp(useCases, executionUseCases);
    const res = await request(app).get('/tools/executions/stx_private?authenticatedStudentReference=attacker').set('x-student-tools-session', 'session-owner');
    expect(res.status).toBe(404);
    expect(executionUseCases.findExecutionForRequester).toHaveBeenCalledWith('stx_private', {
      consumerType: 'ANONYMOUS',
      authenticatedStudentReference: undefined,
      anonymousSessionReference: 'session-owner',
    });
  });

  it('requires authentication before saving an execution reference', async () => {
    const useCases = createUseCases();
    const executionUseCases = createExecutionUseCases();
    const res = await request(createApp(useCases, executionUseCases)).post('/tools/executions/stx_1/save');
    expect(res.status).toBe(401);
    expect(executionUseCases.saveExecutionForStudent).not.toHaveBeenCalled();
  });
});
