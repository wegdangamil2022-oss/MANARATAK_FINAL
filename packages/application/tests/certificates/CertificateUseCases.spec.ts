import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CertificateStatus,
  CertificateTemplateStatus,
  ICertificateRepository,
  ICourseRepository,
  CourseAccessType,
  CourseImportCompletenessState,
  CourseOriginType,
  CourseStatus
} from '@manaratak/domain';
import { CertificateUseCases } from '../../src/certificates/use-cases/CertificateUseCases';

describe('CertificateUseCases', () => {
  let certificateRepository: ICertificateRepository;
  let courseRepository: ICourseRepository;
  let useCases: CertificateUseCases;

  const course = {
    id: 'course-1',
    publicId: 'course-public-1',
    slug: 'native-course',
    canonicalName: 'Native Course',
    canonicalDedupKey: 'native-course',
    displayName: 'Native Course',
    accessType: CourseAccessType.FREE_CERTIFICATE,
    originType: CourseOriginType.NATIVE_MANARATAK_COURSE,
    directCourseUrl: '/courses/native-course',
    status: CourseStatus.PUBLISHED,
    completenessStatus: CourseImportCompletenessState.COMPLETE,
    certificateAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    certificateRepository = {
      createTemplate: vi.fn().mockResolvedValue({
        id: 'template-1',
        publicId: 'template-public-1',
        name: 'MANARATAK Course Completion',
        templateVersion: '1.0.0',
        status: CertificateTemplateStatus.ACTIVE,
        issuerName: 'MANARATAK',
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      findActiveTemplateByName: vi.fn().mockResolvedValue({
        id: 'template-1',
        publicId: 'template-public-1',
        name: 'MANARATAK Course Completion',
        templateVersion: '1.0.0',
        status: CertificateTemplateStatus.ACTIVE,
        issuerName: 'MANARATAK',
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      listTemplates: vi.fn(),
      issue: vi.fn().mockImplementation((data) => Promise.resolve({
        id: 'certificate-1',
        ...data,
        issuedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      findById: vi.fn(),
      findByCourseCompletionId: vi.fn().mockResolvedValue(null),
      findByVerificationCode: vi.fn(),
      findBySerialNumber: vi.fn(),
      listByStudent: vi.fn(),
      revoke: vi.fn(),
    };

    courseRepository = {
      create: vi.fn(),
      update: vi.fn(),
      findByDedupKey: vi.fn(),
      findById: vi.fn().mockResolvedValue(course),
      findByPublicId: vi.fn(),
      findBySlug: vi.fn(),
      updateStatus: vi.fn(),
      updateImportLink: vi.fn(),
      listByStatus: vi.fn(),
      list: vi.fn(),
      listPublished: vi.fn(),
    };

    useCases = new CertificateUseCases(certificateRepository, courseRepository);
  });

  it('issues a certificate from an eligible course completion', async () => {
    const certificate = await useCases.issueFromCourseCompletion({
      courseId: 'course-1',
      studentReferenceId: 'student-1',
      completedAt: new Date(),
      completionId: 'completion-1',
      eligibleForCertificate: true,
      certificateOwnerPhase: 'Phase 14 - Enterprise Certificates Platform',
      sourcePhase: 'Phase 13 - Learning Platform'
    });

    expect(certificate.status).toBe(CertificateStatus.ACTIVE);
    expect(certificate.courseDisplayName).toBe('Native Course');
    expect(certificateRepository.issue).toHaveBeenCalledWith(expect.objectContaining({
      courseCompletionId: 'completion-1',
      studentReferenceId: 'student-1',
      metadata: expect.objectContaining({ issuedFromEvent: 'CourseCompleted' })
    }));
  });

  it('does not issue duplicate certificates for the same completion', async () => {
    (certificateRepository.findByCourseCompletionId as any).mockResolvedValue({
      id: 'existing-certificate',
      publicId: 'cert-existing',
      serialNumber: 'MNR-CERT-1',
      verificationCode: 'MNR-VERIFY',
      status: CertificateStatus.ACTIVE,
      studentReferenceId: 'student-1',
      courseId: 'course-1',
      courseDisplayName: 'Native Course',
      courseCompletionId: 'completion-1',
      courseCompletedAt: new Date(),
      issuedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const certificate = await useCases.issueFromCourseCompletion({
      courseId: 'course-1',
      studentReferenceId: 'student-1',
      completedAt: new Date(),
      completionId: 'completion-1',
      eligibleForCertificate: true,
      certificateOwnerPhase: 'Phase 14 - Enterprise Certificates Platform',
      sourcePhase: 'Phase 13 - Learning Platform'
    });

    expect(certificate.id).toBe('existing-certificate');
    expect(certificateRepository.issue).not.toHaveBeenCalled();
  });

  it('rejects non-eligible course completions', async () => {
    await expect(useCases.issueFromCourseCompletion({
      courseId: 'course-1',
      studentReferenceId: 'student-1',
      completedAt: new Date(),
      completionId: 'completion-1',
      eligibleForCertificate: false,
      certificateOwnerPhase: 'Phase 14 - Enterprise Certificates Platform',
      sourcePhase: 'Phase 13 - Learning Platform'
    })).rejects.toThrow('not eligible');
  });
});
