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
    expect(res.body.output).toBe('Suggested majors');
    expect(executionUseCases.execute).toHaveBeenCalledWith('major-fit-helper', { input: 'I like science.' });
  });
});
