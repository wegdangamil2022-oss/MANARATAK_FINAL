import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class PrismaImportRepository {
  public readonly persistenceClassification: 'DURABLE' | 'DEVELOPMENT_ONLY';
  private inMemoryBatches: Map<string, any> = new Map();
  private inMemoryRecords: Map<string, any> = new Map();

  constructor(
    private readonly prisma?: PrismaClient,
    mode: 'DURABLE' | 'DEVELOPMENT_ONLY' = 'DURABLE'
  ) {
    if (mode === 'DURABLE' && !prisma) {
      throw new Error('Durable import persistence is unavailable: PrismaClient is required.');
    }
    if (mode === 'DEVELOPMENT_ONLY' && prisma) {
      throw new Error('DEVELOPMENT_ONLY import persistence must not receive PrismaClient.');
    }
    this.persistenceClassification = mode;
  }

  async createBatch(data: {
    sourceSystem?: string;
    dataType: string;
    batchStatus?: string;
    totalRecords?: number;
    processedRecords?: number;
    failedRecords?: number;
  }): Promise<any> {
    const batch = {
      id: `batch-${uuidv4().substring(0, 8)}`,
      sourceSystem: data.sourceSystem || 'ADMIN_CONSOLE',
      dataType: data.dataType,
      batchStatus: data.batchStatus || 'PROCESSING',
      totalRecords: data.totalRecords || 0,
      processedRecords: data.processedRecords || 0,
      failedRecords: data.failedRecords || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.prisma) {
      const created = await this.prisma.importBatch.create({
        data: {
          id: batch.id,
          sourceSystem: batch.sourceSystem,
          dataType: batch.dataType,
          batchStatus: batch.batchStatus,
          totalRecords: batch.totalRecords,
          processedRecords: batch.processedRecords,
          failedRecords: batch.failedRecords,
        },
      });
      return created;
    }

    this.inMemoryBatches.set(batch.id, batch);
    return batch;
  }

  async getBatchById(id: string): Promise<any | null> {
    if (this.prisma) {
      const batch = await this.prisma.importBatch.findUnique({
        where: { id },
        include: { records: true },
      });
      return batch;
    }

    return this.inMemoryBatches.get(id) || null;
  }

  async listBatches(filters?: { dataType?: string; limit?: number }): Promise<any[]> {
    let limit = filters?.limit ? parseInt(filters.limit as any, 10) : 50;
    if (isNaN(limit) || limit < 1) limit = 50;
    if (limit > 100) limit = 100;

    if (this.prisma) {
      const where: any = {};
      if (filters?.dataType) where.dataType = filters.dataType;

      const batches = await this.prisma.importBatch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return batches;
    }

    let list = Array.from(this.inMemoryBatches.values());
    if (filters?.dataType) {
      list = list.filter(b => b.dataType === filters.dataType);
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createRecord(data: {
    batchId: string;
    status: string;
    rawPayload: any;
    validationErrors?: any;
    processingNotes?: string;
    sourceDedupKey?: string;
    promotedEntityId?: string;
  }): Promise<any> {
    const record = {
      id: `rec-${uuidv4().substring(0, 8)}`,
      batchId: data.batchId,
      status: data.status,
      rawPayload: data.rawPayload,
      validationErrors: data.validationErrors || null,
      processingNotes: data.processingNotes || null,
      sourceDedupKey: data.sourceDedupKey || null,
      promotedEntityId: data.promotedEntityId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.prisma) {
      const created = await this.prisma.importRecord.create({
        data: {
          id: record.id,
          batchId: record.batchId,
          status: record.status,
          rawPayload: record.rawPayload,
          validationErrors: record.validationErrors,
          processingNotes: record.processingNotes,
          sourceDedupKey: record.sourceDedupKey,
          promotedEntityId: record.promotedEntityId,
        },
      });
      return created;
    }

    this.inMemoryRecords.set(record.id, record);
    return record;
  }

  async bulkCreateRecords(records: Array<{
    batchId: string;
    status: string;
    rawPayload: any;
    validationErrors?: any;
    processingNotes?: string;
    sourceDedupKey?: string;
    promotedEntityId?: string;
    chunkIndex?: number;
    recordOffset?: number;
    sourceRowNumber?: number;
    retentionExpiresAt?: Date;
    id?: string;
  }>): Promise<{ count: number }> {
    for (const r of records) {
      if (!r.id) {
        (r as any).id = `rec-${uuidv4().substring(0, 8)}`;
      }
    }

    if (this.prisma) {
      const created = await this.prisma.importRecord.createMany({
        data: records.map(r => ({
          id: r.id!,
          batchId: r.batchId,
          status: r.status,
          rawPayload: r.rawPayload,
          validationErrors: r.validationErrors || null,
          processingNotes: r.processingNotes || null,
          sourceDedupKey: r.sourceDedupKey || null,
          promotedEntityId: r.promotedEntityId || null,
          chunkIndex: r.chunkIndex ?? null,
          recordOffset: r.recordOffset ?? null,
          sourceRowNumber: r.sourceRowNumber ?? null,
          retentionExpiresAt: r.retentionExpiresAt ?? null,
        })),
      });
      return { count: created.count };
    }

    for (const r of records) {
      const id = r.id!;
      this.inMemoryRecords.set(id, {
        id,
        batchId: r.batchId,
        status: r.status,
        rawPayload: r.rawPayload,
        validationErrors: r.validationErrors || null,
        processingNotes: r.processingNotes || null,
        sourceDedupKey: r.sourceDedupKey || null,
        promotedEntityId: r.promotedEntityId || null,
        chunkIndex: r.chunkIndex ?? null,
        recordOffset: r.recordOffset ?? null,
        sourceRowNumber: r.sourceRowNumber ?? null,
        retentionExpiresAt: r.retentionExpiresAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return { count: records.length };
  }

  async listRecords(filters?: {
    batchId?: string;
    status?: string;
    dataType?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    const DEFAULT_PAGE = 1;
    const DEFAULT_PAGE_SIZE = 50;
    const MAX_PAGE_SIZE = 100;

    let page = filters?.page ? parseInt(filters.page as any, 10) : DEFAULT_PAGE;
    if (isNaN(page) || page < 1) page = DEFAULT_PAGE;

    let pageSize = filters?.pageSize ? parseInt(filters.pageSize as any, 10) : DEFAULT_PAGE_SIZE;
    if (isNaN(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    if (this.prisma) {
      const where: any = {};
      if (filters?.batchId) where.batchId = filters.batchId;
      if (filters?.status) where.status = filters.status;
      if (filters?.dataType) {
        where.batch = { dataType: filters.dataType };
      }

      const [data, total] = await Promise.all([
        this.prisma.importRecord.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: { batch: true },
        }),
        this.prisma.importRecord.count({ where }),
      ]);
      return { data, total, page, pageSize };
    }

    let records = Array.from(this.inMemoryRecords.values());
    if (filters?.batchId) {
      records = records.filter(r => r.batchId === filters.batchId);
    }
    if (filters?.status) {
      records = records.filter(r => r.status === filters.status);
    }
    if (filters?.dataType) {
      records = records.filter(r => {
        const batch = this.inMemoryBatches.get(r.batchId);
        return batch && batch.dataType === filters.dataType;
      });
    }

    const total = records.length;
    const rawData = records.slice((page - 1) * pageSize, page * pageSize);
    const data = rawData.map(r => ({
      ...r,
      batch: this.inMemoryBatches.get(r.batchId) || null
    }));

    return { data, total, page, pageSize };
  }

  async getRecordById(id: string): Promise<any | null> {
    if (this.prisma) {
      return this.prisma.importRecord.findUnique({ where: { id } });
    }

    return this.inMemoryRecords.get(id) || null;
  }

  async findBySourceDedupKey(sourceDedupKey: string, batchId?: string): Promise<any | null> {
    if (this.prisma) {
      const where: any = { sourceDedupKey };
      if (batchId) {
        where.batchId = batchId;
      }
      const record = await this.prisma.importRecord.findFirst({ where });
      return record;
    }

    for (const record of this.inMemoryRecords.values()) {
      if (record.sourceDedupKey === sourceDedupKey) {
        if (batchId && record.batchId !== batchId) {
          continue;
        }
        return record;
      }
    }
    return null;
  }

  async updateRecord(id: string, updates: {
    status?: string;
    validationErrors?: any;
    promotedEntityId?: string;
    processingNotes?: string;
  }): Promise<any> {
    if (this.prisma) {
      const record = await this.prisma.importRecord.update({
        where: { id },
        data: {
          status: updates.status,
          validationErrors: updates.validationErrors,
          promotedEntityId: updates.promotedEntityId,
          processingNotes: updates.processingNotes,
        },
      });
      return record;
    }

    const existing = this.inMemoryRecords.get(id);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date(),
      };
      this.inMemoryRecords.set(id, updated);
      return updated;
    }
    return null;
  }

  async updateBatchStats(batchId: string, stats: {
    totalRecords?: number;
    processedRecords?: number;
    failedRecords?: number;
    batchStatus?: string;
  }): Promise<any> {
    if (this.prisma) {
      const batch = await this.prisma.importBatch.update({
        where: { id: batchId },
        data: {
          totalRecords: stats.totalRecords,
          processedRecords: stats.processedRecords,
          failedRecords: stats.failedRecords,
          batchStatus: stats.batchStatus,
        },
      });
      return batch;
    }

    const existing = this.inMemoryBatches.get(batchId);
    if (existing) {
      const updated = {
        ...existing,
        ...stats,
        updatedAt: new Date(),
      };
      this.inMemoryBatches.set(batchId, updated);
      return updated;
    }
    return null;
  }
}
