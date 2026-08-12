import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { AIExecutionStatus, AIRequestPurpose } from '@manaratak/domain';
import { AIGatewayRouter } from '../../../../src/presentation/api/router/AIGatewayRouter';

describe('AIGatewayRouter', () => {
  const createUseCases = () => ({
    execute: vi.fn(),
    listLogs: vi.fn()
  });

  const createApp = (useCases: ReturnType<typeof createUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use('/ai', AIGatewayRouter.create({ aiExecutionUseCases: useCases as any }));
    return app;
  };

  it('executes a governed AI request', async () => {
    const useCases = createUseCases();
    useCases.execute.mockResolvedValue({ executionPublicId: 'ai-1', status: AIExecutionStatus.COMPLETED });
    const app = createApp(useCases);

    const res = await request(app)
      .post('/ai/execute')
      .send({
        purpose: AIRequestPurpose.SUMMARIZATION,
        promptKey: 'summary.generic',
        input: 'Summarize this guide.',
        sourceDomain: 'CMS'
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(AIExecutionStatus.COMPLETED);
    expect(useCases.execute).toHaveBeenCalledWith(expect.objectContaining({
      purpose: AIRequestPurpose.SUMMARIZATION,
      promptKey: 'summary.generic'
    }));
  });

  it('lists AI execution logs for administration', async () => {
    const useCases = createUseCases();
    useCases.listLogs.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
    const app = createApp(useCases);

    const res = await request(app).get('/ai/logs?status=COMPLETED');

    expect(res.status).toBe(200);
    expect(useCases.listLogs).toHaveBeenCalledWith(expect.objectContaining({ status: AIExecutionStatus.COMPLETED }));
  });
});
