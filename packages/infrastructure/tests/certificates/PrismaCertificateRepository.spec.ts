import { describe, expect, it, vi } from 'vitest';
import { CertificateStatus } from '@manaratak/domain';
import { PrismaCertificateRepository } from '../../src/certificates/PrismaCertificateRepository';

describe('PrismaCertificateRepository', () => {
  it('writes certificate, ledger, audit and outbox in one transaction', async () => {
    const tx: any = {
      certificate: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi
          .fn()
          .mockImplementation(({ data }) => ({
            id: 'cert-1',
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
      },
      certificateLedgerEntry: { create: vi.fn() },
      auditRecord: { create: vi.fn() },
      transactionalOutboxRecord: { create: vi.fn() },
    };
    const prisma: any = { $transaction: vi.fn((callback) => callback(tx)) };
    const repository = new PrismaCertificateRepository(prisma);
    const result = await repository.issue({
      publicId: 'public-1',
      serialNumber: 'MNR-CRS-2026-1',
      verificationCode: 'MNR-VERIFY-1',
      verificationHash: 'hash',
      status: CertificateStatus.ACTIVE,
      certificateType: 'COURSE',
      studentReferenceId: 'student-1',
      courseId: 'course-1',
      courseDisplayName: 'Course',
      courseCompletionId: 'completion-1',
      courseCompletedAt: new Date(),
      skills: [],
      competencies: [],
    });
    expect(result.id).toBe('cert-1');
    expect(tx.certificateLedgerEntry.create).toHaveBeenCalledOnce();
    expect(tx.auditRecord.create).toHaveBeenCalledOnce();
    expect(tx.transactionalOutboxRecord.create).toHaveBeenCalledOnce();
  });

  it('returns the existing receipt for a repeated completion', async () => {
    const existing = {
      id: 'cert-existing',
      status: CertificateStatus.ACTIVE,
      skills: [],
      competencies: [],
      metadata: null,
    };
    const tx: any = {
      certificate: { findUnique: vi.fn().mockResolvedValue(existing), create: vi.fn() },
    };
    const repository = new PrismaCertificateRepository({
      $transaction: (callback: any) => callback(tx),
    } as any);
    expect((await repository.issue({ courseCompletionId: 'same' } as any)).id).toBe(
      'cert-existing',
    );
    expect(tx.certificate.create).not.toHaveBeenCalled();
  });
});
