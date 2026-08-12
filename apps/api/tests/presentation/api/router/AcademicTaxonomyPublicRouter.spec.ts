import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { AcademicTaxonomyPublicRouter } from '../../../../src/presentation/api/router/AcademicTaxonomyPublicRouter';
import {
  AcademicTaxonomyNodeType,
  AcademicTaxonomyStatus,
  AcademicStandardType,
  AcademicTaxonomyNodeDto,
} from '@manaratak/domain';

describe('AcademicTaxonomyPublicRouter', () => {
  const mockNode: AcademicTaxonomyNodeDto = {
    nodeId: 'node_001',
    nodeType: AcademicTaxonomyNodeType.DISCIPLINE,
    canonicalCode: '0611',
    canonicalName: 'Computer Science',
    status: AcademicTaxonomyStatus.ACTIVE,
    standardType: AcademicStandardType.CUSTOM_NATIONAL,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createUseCases = () => ({
    listNodes: vi.fn(),
    getNode: vi.fn(),
    getNodeByCanonicalKey: vi.fn(),
    searchNodes: vi.fn(),
    listChildren: vi.fn(),
    listParents: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use(
      '/academic-taxonomy',
      AcademicTaxonomyPublicRouter.create({
        publicAcademicTaxonomyUseCases: useCases as any,
      })
    );
    return app;
  };

  it('GET /academic-taxonomy/nodes returns list of nodes with optional filters', async () => {
    const useCases = createUseCases();
    useCases.listNodes.mockResolvedValue([mockNode]);
    const app = createApp(useCases);

    const res = await request(app).get(
      '/academic-taxonomy/nodes?nodeType=DISCIPLINE&status=ACTIVE'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].nodeId).toBe('node_001');
    expect(useCases.listNodes).toHaveBeenCalledWith({
      nodeType: AcademicTaxonomyNodeType.DISCIPLINE,
      status: AcademicTaxonomyStatus.ACTIVE,
    });
  });

  it('GET /academic-taxonomy/nodes/by-key returns node when found', async () => {
    const useCases = createUseCases();
    useCases.getNodeByCanonicalKey.mockResolvedValue(mockNode);
    const app = createApp(useCases);

    const res = await request(app).get(
      '/academic-taxonomy/nodes/by-key?nodeType=DISCIPLINE&canonicalCode=0611'
    );

    expect(res.status).toBe(200);
    expect(res.body.nodeId).toBe('node_001');
    expect(useCases.getNodeByCanonicalKey).toHaveBeenCalledWith({
      nodeType: AcademicTaxonomyNodeType.DISCIPLINE,
      canonicalCode: '0611',
    });
  });

  it('GET /academic-taxonomy/nodes/by-key returns 404 when not found', async () => {
    const useCases = createUseCases();
    useCases.getNodeByCanonicalKey.mockResolvedValue(null);
    const app = createApp(useCases);

    const res = await request(app).get(
      '/academic-taxonomy/nodes/by-key?nodeType=DISCIPLINE&canonicalCode=9999'
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Academic taxonomy node not found');
  });

  it('GET /academic-taxonomy/nodes/:nodeId returns node when found', async () => {
    const useCases = createUseCases();
    useCases.getNode.mockResolvedValue(mockNode);
    const app = createApp(useCases);

    const res = await request(app).get('/academic-taxonomy/nodes/node_001');

    expect(res.status).toBe(200);
    expect(res.body.nodeId).toBe('node_001');
    expect(useCases.getNode).toHaveBeenCalledWith('node_001');
  });

  it('GET /academic-taxonomy/nodes/:nodeId returns 404 when node does not exist', async () => {
    const useCases = createUseCases();
    useCases.getNode.mockResolvedValue(null);
    const app = createApp(useCases);

    const res = await request(app).get('/academic-taxonomy/nodes/non_existent');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Academic taxonomy node not found');
  });

  it('GET /academic-taxonomy/nodes/:nodeId/children returns child nodes', async () => {
    const useCases = createUseCases();
    useCases.listChildren.mockResolvedValue([mockNode]);
    const app = createApp(useCases);

    const res = await request(app).get('/academic-taxonomy/nodes/parent_node/children');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(useCases.listChildren).toHaveBeenCalledWith('parent_node');
  });

  it('GET /academic-taxonomy/nodes/:nodeId/parents returns parent nodes', async () => {
    const useCases = createUseCases();
    useCases.listParents.mockResolvedValue([mockNode]);
    const app = createApp(useCases);

    const res = await request(app).get('/academic-taxonomy/nodes/child_node/parents');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(useCases.listParents).toHaveBeenCalledWith('child_node');
  });

  it('GET /academic-taxonomy/search calls searchNodes with query and filters', async () => {
    const useCases = createUseCases();
    useCases.searchNodes.mockResolvedValue([mockNode]);
    const app = createApp(useCases);

    const res = await request(app).get(
      '/academic-taxonomy/search?q=computer&nodeType=DISCIPLINE'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(useCases.searchNodes).toHaveBeenCalledWith('computer', {
      nodeType: AcademicTaxonomyNodeType.DISCIPLINE,
    });
  });

  it('returns 400 when query parameter fails enum validation', async () => {
    const useCases = createUseCases();
    const app = createApp(useCases);

    const res = await request(app).get(
      '/academic-taxonomy/nodes?nodeType=INVALID_NODE_TYPE'
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  it('public router does not expose mutation endpoints', async () => {
    const useCases = createUseCases();
    const app = createApp(useCases);

    const postRes = await request(app).post('/academic-taxonomy/nodes').send({});
    const putRes = await request(app).put('/academic-taxonomy/nodes').send({});
    const deleteRes = await request(app).delete('/academic-taxonomy/nodes/123');

    expect(postRes.status).toBe(404);
    expect(putRes.status).toBe(404);
    expect(deleteRes.status).toBe(404);
  });
});
