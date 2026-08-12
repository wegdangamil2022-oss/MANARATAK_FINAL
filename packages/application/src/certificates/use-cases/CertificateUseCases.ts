import { randomUUID } from 'crypto';
import {
  CertificateDto,
  CertificateStatus,
  CertificateTemplateStatus,
  CertificateVerificationDto,
  CourseCompletedEventPayload,
  ICertificateRepository,
  ICourseRepository
} from '@manaratak/domain';

export interface IssueCertificateFromCourseCompletionCommand extends CourseCompletedEventPayload {
  recipientDisplayName?: string | null;
  templateName?: string;
}

export class CertificateUseCases {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly courseRepository: ICourseRepository
  ) {}

  public async ensureDefaultCourseTemplate(): Promise<void> {
    const existing = await this.certificateRepository.findActiveTemplateByName('MANARATAK Course Completion');
    if (existing) {
      return;
    }

    await this.certificateRepository.createTemplate({
      publicId: `cert-template-${randomUUID()}`,
      name: 'MANARATAK Course Completion',
      templateVersion: '1.0.0',
      status: CertificateTemplateStatus.ACTIVE,
      issuerName: 'MANARATAK',
      metadata: {
        phase: 'Phase 14 - Enterprise Certificates Platform',
        assetBoundary: 'Certificate PDFs, QR codes, signatures, and visual templates must use Phase 05 EAP asset handles.'
      }
    });
  }

  public async issueFromCourseCompletion(command: IssueCertificateFromCourseCompletionCommand): Promise<CertificateDto> {
    if (!command.eligibleForCertificate) {
      throw new Error('Course completion is not eligible for certificate issuance');
    }

    const existing = await this.certificateRepository.findByCourseCompletionId(command.completionId);
    if (existing) {
      return existing;
    }

    const course = await this.courseRepository.findById(command.courseId);
    if (!course) {
      throw new Error(`Course with id ${command.courseId} not found`);
    }
    if (!course.certificateAvailable) {
      throw new Error('Course is not configured for certificate issuance');
    }

    await this.ensureDefaultCourseTemplate();
    const template = await this.certificateRepository.findActiveTemplateByName(command.templateName || 'MANARATAK Course Completion');

    return this.certificateRepository.issue({
      publicId: `cert-${randomUUID()}`,
      serialNumber: this.generateSerialNumber(command.courseId),
      verificationCode: this.generateVerificationCode(),
      status: CertificateStatus.ACTIVE,
      studentReferenceId: command.studentReferenceId,
      recipientDisplayName: command.recipientDisplayName,
      courseId: command.courseId,
      courseDisplayName: course.displayName,
      courseCompletionId: command.completionId,
      courseCompletedAt: new Date(command.completedAt),
      templateId: template?.id,
      metadata: {
        issuedFromEvent: 'CourseCompleted',
        sourcePhase: command.sourcePhase,
        completionOwnerPhase: command.certificateOwnerPhase,
        phase05EapAssetBoundary: true
      }
    });
  }

  public async verifyByCode(verificationCode: string): Promise<CertificateVerificationDto> {
    const certificate = await this.certificateRepository.findByVerificationCode(verificationCode.trim());
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    return {
      publicId: certificate.publicId,
      serialNumber: certificate.serialNumber,
      verificationCode: certificate.verificationCode,
      status: certificate.status,
      studentReferenceId: certificate.studentReferenceId,
      recipientDisplayName: certificate.recipientDisplayName,
      courseId: certificate.courseId,
      courseDisplayName: certificate.courseDisplayName,
      courseCompletedAt: certificate.courseCompletedAt,
      issuedAt: certificate.issuedAt,
      revokedAt: certificate.revokedAt,
      revocationReason: certificate.revocationReason,
      isValid: certificate.status === CertificateStatus.ACTIVE
    };
  }

  public async listStudentCertificates(studentReferenceId: string): Promise<CertificateDto[]> {
    return this.certificateRepository.listByStudent(studentReferenceId);
  }

  public async revoke(certificateId: string, reason: string): Promise<CertificateDto> {
    if (!reason.trim()) {
      throw new Error('Revocation reason is required');
    }
    return this.certificateRepository.revoke({ certificateId, reason: reason.trim() });
  }

  private generateSerialNumber(courseId: string): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const courseFragment = courseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'COURSE';
    return `MNR-CERT-${date}-${courseFragment}-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  private generateVerificationCode(): string {
    return `MNR-${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
  }
}
