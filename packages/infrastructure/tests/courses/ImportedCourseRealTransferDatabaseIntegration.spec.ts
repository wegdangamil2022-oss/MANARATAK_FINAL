import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  AtomicAuditedOutboxMutationExecutor,
  AtomicDomainMutationCoordinator,
  CourseImportCoordinator,
  CourseImportIdentityDiffUseCase,
} from '@manaratak/application';
import { PrismaAuditRecordRepository } from '../../src/audit/PrismaAuditRecordRepository';
import { PrismaAtomicPersistenceUnitOfWork } from '../../src/event-foundation/PrismaAtomicPersistenceUnitOfWork';
import { PrismaTransactionalOutboxStore } from '../../src/event-foundation/PrismaTransactionalOutboxStore';
import { PrismaCourseImportAnalysisRepository } from '../../src/courses/PrismaCourseImportAnalysisRepository';
import { PrismaCourseImportTransferGateway } from '../../src/courses/PrismaCourseImportTransferGateway';
import { PrismaCourseRepository } from '../../src/courses/PrismaCourseRepository';
import { PrismaExternalCourseProviderRepository } from '../../src/courses/PrismaExternalCourseProviderRepository';

const describeWithDatabase = process.env.RUN_DATABASE_INTEGRATION_TESTS === 'true' && process.env.DATABASE_URL
  ? describe
  : describe.skip;

describeWithDatabase('WP-IC-10R1 real imported-course transfer on disposable PostgreSQL', () => {
  const prisma = new PrismaClient();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const providerPublicId = `wpic10r1-provider-${suffix}`;
  const providerName = `WPIC10R1 Provider ${suffix}`;
  const batchSource = `WPIC10R1_DB_INTEGRATION:${suffix}`;
  let providerId = '';
  let batchId = '';
  let recordId = '';
  let courseId = '';
  let sourceIdentityId = '';

  beforeAll(async () => {
    await prisma.$connect();
    const provider = await prisma.externalCourseProvider.create({
      data: {
        publicId: providerPublicId,
        slug: providerPublicId,
        canonicalName: providerName,
        normalizedCanonicalName: providerName.toLowerCase(),
        displayName: providerName,
        status: 'APPROVED',
        sourceTrustLevel: 'TEST_REVIEWED',
        importStrategy: 'FILE',
        allowedDomains: {
          create: { domain: 'example.org', normalizedDomain: 'example.org' },
        },
      },
    });
    providerId = provider.id;

    const batch = await prisma.importBatch.create({
      data: {
        sourceSystem: batchSource,
        dataType: 'COURSES',
        batchStatus: 'COMPLETED',
        totalRecords: 1,
        processedRecords: 1,
        failedRecords: 0,
      },
    });
    batchId = batch.id;

    const record = await prisma.importRecord.create({
      data: {
        batchId,
        status: 'COMPLETE',
        sourceDedupKey: `wpic10r1:${suffix}`,
        sourceRowNumber: 2,
        rawPayload: {
          sourceOrder: 1,
          providerLabel: providerName,
          courseName: `WPIC10R1 Course ${suffix}`,
          directCourseUrl: `https://example.org/course/${suffix}`,
          studyFreeRaw: 'Yes',
          freeCertificateRaw: 'No',
          certificateTypeRaw: 'None',
          languageRaw: 'English',
          studyLevelRaw: 'Beginner',
          courseDurationRaw: '1 hour',
          shortCourseTopicsRaw: 'Runtime; Import; PostgreSQL',
          _artifactSha256: 'c'.repeat(64),
          _sourceFilename: 'wpic10r1-integration.xlsx',
          _sourceSheetName: 'Courses',
          _worksheetRowNumber: 2,
        },
      },
    });
    recordId = record.id;
  });

  afterAll(async () => {
    if (recordId) {
      await prisma.transactionalOutboxRecord.deleteMany({ where: { aggregateId: recordId } });
      await prisma.auditRecord.deleteMany({ where: { targetId: recordId } });
      await prisma.courseFieldProvenance.deleteMany({ where: { importRecordId: recordId } });
      await prisma.courseImportAnalysis.deleteMany({ where: { importRecordId: recordId } });
    }
    if (sourceIdentityId) {
      await prisma.courseSourceUrlHistory.deleteMany({ where: { courseSourceIdentityId: sourceIdentityId } });
      await prisma.courseSourceIdentity.deleteMany({ where: { id: sourceIdentityId } });
    }
    if (courseId) await prisma.course.deleteMany({ where: { id: courseId } });
    if (recordId) await prisma.importRecord.deleteMany({ where: { id: recordId } });
    if (batchId) await prisma.importBatch.deleteMany({ where: { id: batchId } });
    if (providerId) {
      await prisma.externalCourseProviderDomain.deleteMany({ where: { providerId } });
      await prisma.externalCourseProvider.deleteMany({ where: { id: providerId } });
    }
    await prisma.$disconnect();
  });

  it('runs staged record -> identity analysis -> atomic coordinator transfer without a parallel Course write path', async () => {
    const providerRepository = new PrismaExternalCourseProviderRepository(prisma);
    const analysisRepository = new PrismaCourseImportAnalysisRepository(prisma);
    const batchReader = {
      async listRecords(filters: Record<string, unknown> = {}) {
        const page = Number(filters.page ?? 1);
        const pageSize = Number(filters.pageSize ?? 100);
        const where = { batchId: String(filters.batchId ?? '') };
        const [data, total] = await Promise.all([
          prisma.importRecord.findMany({
            where,
            orderBy: { createdAt: 'asc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
          prisma.importRecord.count({ where }),
        ]);
        return { data, total, page, pageSize };
      },
    };

    const identityDiff = new CourseImportIdentityDiffUseCase(
      batchReader,
      providerRepository,
      analysisRepository,
    );
    const analysis = await identityDiff.analyzeBatch(batchId);
    expect(analysis.analyses).toHaveLength(1);
    expect(analysis.analyses[0].changeState).toBe('NEW');
    expect(analysis.analyses[0].requiresReview).toBe(false);

    const sourceIdentityProposal = analysis.analyses[0].relationshipProposals?.sourceIdentityId;
    expect(typeof sourceIdentityProposal).toBe('string');
    sourceIdentityId = String(sourceIdentityProposal);

    const mutationExecutor = new AtomicAuditedOutboxMutationExecutor(
      new PrismaAtomicPersistenceUnitOfWork(prisma),
      new PrismaAuditRecordRepository(prisma),
      new PrismaTransactionalOutboxStore(prisma),
    );
    const coordinator = new CourseImportCoordinator(
      new PrismaCourseImportTransferGateway(prisma),
      new PrismaCourseRepository(prisma),
      new AtomicDomainMutationCoordinator(mutationExecutor),
    );

    const preview = await coordinator.preview(recordId);
    expect(preview.state).toBe('READY_TO_TRANSFER');

    const transferred = await coordinator.transfer({
      recordId,
      actorId: 'wpic10r1-integration-test',
      correlationId: `wpic10r1-${suffix}`,
    });
    expect(transferred.state).toBe('TRANSFERRED_CREATED');
    expect(transferred.publicationStatus).toBe('IMPORTED');
    courseId = transferred.courseId;

    const [course, identity, record, provenanceCount, auditCount, outboxCount] = await Promise.all([
      prisma.course.findUnique({ where: { id: courseId } }),
      prisma.courseSourceIdentity.findUnique({ where: { id: sourceIdentityId } }),
      prisma.importRecord.findUnique({ where: { id: recordId } }),
      prisma.courseFieldProvenance.count({ where: { courseId } }),
      prisma.auditRecord.count({ where: { targetId: recordId, action: 'COURSE_IMPORT_TRANSFERRED' } }),
      prisma.transactionalOutboxRecord.count({ where: { aggregateId: recordId, eventType: 'COURSE_IMPORT_TRANSFERRED' } }),
    ]);

    expect(course?.status).toBe('IMPORTED');
    expect(course?.externalProviderId).toBe(providerId);
    expect(course?.directCourseUrl).toBe(`https://example.org/course/${suffix}`);
    expect(identity?.courseId).toBe(courseId);
    expect(record?.promotedEntityId).toBe(courseId);
    expect(provenanceCount).toBeGreaterThan(0);
    expect(auditCount).toBe(1);
    expect(outboxCount).toBe(1);

    const replay = await coordinator.transfer({
      recordId,
      actorId: 'wpic10r1-integration-test',
    });
    expect(replay.state).toBe('TRANSFERRED_UNCHANGED');
    expect(replay.courseId).toBe(courseId);
    expect(await prisma.course.count({ where: { id: courseId } })).toBe(1);
  }, 60_000);
});
