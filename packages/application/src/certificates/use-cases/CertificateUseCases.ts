import { createHash, createHmac, randomUUID } from 'crypto';
import {
  AssetId,
  AssetLifecycleState,
  CertificateDto,
  CertificateListQuery,
  CertificateStatus,
  CertificateTemplateStatus,
  CertificateVerificationDto,
  CourseCompletedEventPayload,
  ICertificateRepository,
  ICourseRepository,
  IAssetRecordRepository,
  UpdateCertificateTemplateDto,
} from '@manaratak/domain';

export interface IssueCertificateFromCourseCompletionCommand extends CourseCompletedEventPayload {
  recipientDisplayName?: string | null;
  templateId?: string;
  grade?: string;
  score?: number;
  skills?: string[];
  competencies?: string[];
  actorId?: string;
  correlationId?: string;
}

const templateTransitions: Record<CertificateTemplateStatus, CertificateTemplateStatus[]> = {
  DRAFT: [CertificateTemplateStatus.PENDING_APPROVAL],
  PENDING_APPROVAL: [CertificateTemplateStatus.DRAFT, CertificateTemplateStatus.APPROVED],
  APPROVED: [CertificateTemplateStatus.ACTIVE, CertificateTemplateStatus.DRAFT],
  ACTIVE: [CertificateTemplateStatus.DEPRECATED],
  DEPRECATED: [CertificateTemplateStatus.ARCHIVED],
  ARCHIVED: [],
  RETIRED: [],
};

export class CertificateUseCases {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly assetRepository?: IAssetRecordRepository,
  ) {}

  public async ensureDefaultCourseTemplate(): Promise<void> {
    if (
      await this.certificateRepository.findActiveTemplateByName('MANARATAK Signature Certificate')
    )
      return;
    await this.certificateRepository.createTemplate({
      publicId: `cert-template-${randomUUID()}`,
      code: 'MNR-SIGNATURE',
      name: 'MANARATAK Signature Certificate',
      nameAr: 'قالب مناراتك الاحترافي',
      nameEn: 'MANARATAK Signature Certificate',
      templateVersion: '1.0.0',
      status: CertificateTemplateStatus.ACTIVE,
      issuerName: 'MANARATAK',
      language: 'BILINGUAL',
      layout: 'LANDSCAPE',
      accentColor: '#075E45',
      secondaryColor: '#C9A227',
      titleAr: 'شهادة إتمام معتمدة',
      titleEn: 'CERTIFICATE OF COMPLETION',
      bodyAr:
        'تشهد منصة مناراتك بأن المتعلم قد أتم بنجاح جميع متطلبات البرنامج واستحق هذه الشهادة الموثقة.',
      bodyEn:
        'MANARATAK certifies that the learner has successfully completed all program requirements and earned this verified credential.',
      signatoryNameAr: 'إدارة الاعتماد الأكاديمي',
      signatoryNameEn: 'Academic Credentialing Office',
      signatoryTitleAr: 'التوقيع الرقمي المعتمد',
      signatoryTitleEn: 'Authorized Digital Signature',
      metadata: {
        phase: 'Phase 14',
        placeholders: [
          'recipientName',
          'courseName',
          'issuedAt',
          'serialNumber',
          'verificationCode',
        ],
        eapAssetsRequiredForProduction: true,
      },
    });
  }

  public async issueFromCourseCompletion(
    command: IssueCertificateFromCourseCompletionCommand,
  ): Promise<CertificateDto> {
    if (!command.eligibleForCertificate)
      throw new Error('Course completion is not eligible (COURSE_COMPLETION_NOT_ELIGIBLE)');
    const existing = await this.certificateRepository.findByCourseCompletionId(
      command.completionId,
    );
    if (existing) return existing;
    const course = await this.courseRepository.findById(command.courseId);
    if (!course) throw new Error('COURSE_NOT_FOUND');
    if (!course.certificateAvailable) throw new Error('COURSE_CERTIFICATE_DISABLED');
    await this.ensureDefaultCourseTemplate();
    const template = command.templateId
      ? await this.certificateRepository.findTemplateById(command.templateId)
      : await this.certificateRepository.findActiveTemplateByName(
          'MANARATAK Signature Certificate',
        );
    if (!template || template.status !== CertificateTemplateStatus.ACTIVE)
      throw new Error('ACTIVE_CERTIFICATE_TEMPLATE_REQUIRED');
    const issuedAt = new Date();
    const serialNumber = this.serial(
      'MNR',
      'CRS',
      issuedAt,
      command.studentReferenceId,
      command.completionId,
    );
    const verificationCode = `MNR-${this.digest(`${command.completionId}:${serialNumber}`).slice(0, 18).toUpperCase()}`;
    const sealed = {
      studentReferenceId: command.studentReferenceId,
      courseId: command.courseId,
      completionId: command.completionId,
      completedAt: new Date(command.completedAt).toISOString(),
      issuedAt: issuedAt.toISOString(),
      templateId: template.id,
      templateVersion: template.templateVersion,
      grade: command.grade ?? null,
      score: command.score ?? null,
      skills: command.skills ?? [],
      competencies: command.competencies ?? [],
    };
    const verificationHash = this.digest(JSON.stringify(sealed));
    return this.certificateRepository.issue({
      publicId: `cert-${randomUUID()}`,
      serialNumber,
      verificationCode,
      verificationHash,
      status: CertificateStatus.ACTIVE,
      certificateType: 'COURSE',
      studentReferenceId: command.studentReferenceId,
      recipientDisplayName: command.recipientDisplayName,
      courseId: command.courseId,
      courseDisplayName: course.displayName,
      courseCompletionId: command.completionId,
      courseCompletedAt: new Date(command.completedAt),
      issuedAt,
      validityPolicy: 'PERMANENT',
      templateId: template.id,
      templateVersion: template.templateVersion,
      issuerName: template.issuerName,
      issuerReferenceId: template.issuerReferenceId,
      grade: command.grade,
      score: command.score,
      skills: command.skills ?? [],
      competencies: command.competencies ?? [],
      digitalSignature: this.sign(verificationHash),
      signingKeyReference:
        process.env.CERTIFICATE_SIGNING_KEY_REFERENCE ?? 'runtime-kms-key-required',
      metadata: {
        sealed,
        issuedFromEvent: 'CourseCompleted',
        sourcePhase: command.sourcePhase,
        certificateOwnerPhase: command.certificateOwnerPhase,
        artifactState: 'AWAITING_EAP_RENDER',
      },
      actorId: command.actorId ?? 'phase14-system',
      correlationId: command.correlationId,
    });
  }

  public async verifyByCode(code: string): Promise<CertificateVerificationDto> {
    const certificate = await this.certificateRepository.findByVerificationCode(code.trim());
    if (!certificate) throw new Error('Certificate not found');
    const sealed = certificate.metadata?.sealed;
    const integrityVerified = Boolean(
      sealed &&
      this.digest(JSON.stringify(sealed)) === certificate.verificationHash &&
      certificate.digitalSignature === this.sign(certificate.verificationHash),
    );
    const expired = Boolean(certificate.expiresAt && certificate.expiresAt <= new Date());
    const isValid =
      certificate.status === CertificateStatus.ACTIVE && !expired && integrityVerified;
    await this.certificateRepository.recordVerification(
      certificate.id,
      isValid ? 'VALID' : expired ? 'EXPIRED' : certificate.status,
      'PUBLIC_CODE',
    );
    return {
      publicId: certificate.publicId,
      serialNumber: certificate.serialNumber,
      verificationCode: certificate.verificationCode,
      verificationHash: certificate.verificationHash,
      status: expired ? CertificateStatus.EXPIRED : certificate.status,
      certificateType: certificate.certificateType,
      recipientDisplayName: certificate.recipientDisplayName,
      courseDisplayName: certificate.courseDisplayName,
      courseCompletedAt: certificate.courseCompletedAt,
      issuedAt: certificate.issuedAt,
      expiresAt: certificate.expiresAt,
      issuerName: certificate.issuerName,
      grade: certificate.grade,
      skills: certificate.skills,
      competencies: certificate.competencies,
      templateVersion: certificate.templateVersion,
      revokedAt: certificate.revokedAt,
      revocationReason: certificate.revocationReason,
      isValid,
      integrityVerified,
    };
  }

  public list(query: CertificateListQuery) {
    return this.certificateRepository.list(query);
  }
  public analytics() {
    return this.certificateRepository.analytics();
  }
  public listTemplates() {
    return this.certificateRepository.listTemplates();
  }
  public getCertificate(id: string) {
    return this.certificateRepository.findById(id);
  }
  public listLedger(id: string) {
    return this.certificateRepository.listLedger(id);
  }
  public listStudentCertificates(studentReferenceId: string) {
    return this.certificateRepository.listByStudent(studentReferenceId);
  }

  public async createTemplate(
    input: Omit<Parameters<ICertificateRepository['createTemplate']>[0], 'publicId' | 'status'>,
  ) {
    this.validateTemplate(input);
    await this.ensureActiveAssets(input);
    return this.certificateRepository.createTemplate({
      ...input,
      publicId: `cert-template-${randomUUID()}`,
      status: CertificateTemplateStatus.DRAFT,
    });
  }

  public async updateTemplate(id: string, input: UpdateCertificateTemplateDto) {
    this.validateTemplate(input);
    await this.ensureActiveAssets(input);
    return this.certificateRepository.updateTemplate(id, input);
  }
  public async transitionTemplate(id: string, status: CertificateTemplateStatus) {
    const template = await this.certificateRepository.findTemplateById(id);
    if (!template) throw new Error('CERTIFICATE_TEMPLATE_NOT_FOUND');
    if (!templateTransitions[template.status].includes(status))
      throw new Error('CERTIFICATE_TEMPLATE_TRANSITION_INVALID');
    return this.certificateRepository.updateTemplate(id, { status });
  }
  public revoke(id: string, reason: string, actorId = 'admin') {
    if (reason.trim().length < 8) throw new Error('REVOCATION_REASON_TOO_SHORT');
    return this.certificateRepository.revoke({ certificateId: id, reason: reason.trim(), actorId });
  }
  public archive(id: string, reason: string, actorId = 'admin') {
    if (!reason.trim()) throw new Error('ARCHIVE_REASON_REQUIRED');
    return this.certificateRepository.archive(id, actorId, reason.trim());
  }

  public async reissue(
    id: string,
    reason: string,
    actorId = 'admin',
    recipientDisplayName?: string,
    templateId?: string,
  ) {
    if (reason.trim().length < 8) throw new Error('REISSUE_REASON_TOO_SHORT');
    const source = await this.certificateRepository.findById(id);
    if (!source) throw new Error('CERTIFICATE_NOT_FOUND');
    const template = templateId
      ? await this.certificateRepository.findTemplateById(templateId)
      : source.templateId
        ? await this.certificateRepository.findTemplateById(source.templateId)
        : null;
    if (!template || template.status !== CertificateTemplateStatus.ACTIVE)
      throw new Error('ACTIVE_CERTIFICATE_TEMPLATE_REQUIRED');
    const issuedAt = new Date();
    const completionId = `${source.courseCompletionId}:reissue:${randomUUID()}`;
    const serialNumber = this.serial(
      'MNR',
      'CRS',
      issuedAt,
      source.studentReferenceId,
      completionId,
    );
    const verificationCode = `MNR-${this.digest(completionId).slice(0, 18).toUpperCase()}`;
    const sealed = {
      replacesCertificateId: source.id,
      studentReferenceId: source.studentReferenceId,
      courseId: source.courseId,
      completionId,
      issuedAt: issuedAt.toISOString(),
      templateId: template.id,
      templateVersion: template.templateVersion,
    };
    const verificationHash = this.digest(JSON.stringify(sealed));
    return this.certificateRepository.reissue({
      certificateId: id,
      reason: reason.trim(),
      actorId,
      recipientDisplayName,
      templateId,
      replacement: {
        ...source,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        publicId: `cert-${randomUUID()}`,
        serialNumber,
        verificationCode,
        verificationHash,
        status: CertificateStatus.ACTIVE,
        courseCompletionId: completionId,
        issuedAt,
        templateId: template.id,
        templateVersion: template.templateVersion,
        recipientDisplayName: recipientDisplayName ?? source.recipientDisplayName,
        digitalSignature: this.sign(verificationHash),
        metadata: { ...(source.metadata ?? {}), sealed, reissueReason: reason },
        actorId,
      } as any,
    });
  }

  private validateTemplate(input: UpdateCertificateTemplateDto): void {
    for (const color of [input.accentColor, input.secondaryColor])
      if (color && !/^#[0-9A-F]{6}$/i.test(color))
        throw new Error('CERTIFICATE_TEMPLATE_COLOR_INVALID');
    for (const asset of [
      input.logoAssetId,
      input.sealAssetId,
      input.signatureAssetId,
      input.designAssetId,
    ])
      if (asset && /^https?:|^file:|[\\/]/i.test(asset))
        throw new Error('CERTIFICATE_TEMPLATE_RAW_ASSET_FORBIDDEN');
  }

  private async ensureActiveAssets(input: UpdateCertificateTemplateDto): Promise<void> {
    const assetIds = [
      input.logoAssetId,
      input.sealAssetId,
      input.signatureAssetId,
      input.designAssetId,
    ].filter((value): value is string => Boolean(value));
    if (assetIds.length === 0) return;
    if (!this.assetRepository) throw new Error('CERTIFICATE_ASSET_PLATFORM_NOT_CONFIGURED');
    for (const assetId of assetIds) {
      const asset = await this.assetRepository.findById(new AssetId(assetId));
      if (!asset) throw new Error('CERTIFICATE_TEMPLATE_ASSET_NOT_FOUND');
      if (asset.state !== AssetLifecycleState.ACTIVE)
        throw new Error(`CERTIFICATE_TEMPLATE_ASSET_NOT_ACTIVE:${asset.state}`);
    }
  }
  private digest(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
  private sign(hash: string): string {
    const secret = process.env.CERTIFICATE_SIGNING_SECRET;
    if (!secret && process.env.NODE_ENV === 'production')
      throw new Error('CERTIFICATE_SIGNING_PROVIDER_NOT_CONFIGURED');
    return createHmac('sha256', secret ?? 'source-only-development-signing-key')
      .update(hash)
      .digest('hex');
  }
  private serial(
    issuer: string,
    type: string,
    date: Date,
    student: string,
    completion: string,
  ): string {
    return `${issuer}-${type}-${date.getUTCFullYear()}-${this.digest(`${student}:${completion}`).slice(0, 12).toUpperCase()}`;
  }
}
