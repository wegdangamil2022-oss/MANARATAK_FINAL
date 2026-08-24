import {
  CertificateAnalyticsDto,
  CertificateDto,
  CertificateLedgerEntryDto,
  CertificateListQuery,
  CertificateListResult,
  CertificateTemplateDto,
  CreateCertificateTemplateDto,
  IssueCertificateDto,
  ReissueCertificateDto,
  RevokeCertificateDto,
  UpdateCertificateTemplateDto,
} from '../entities/Certificate';

export interface ICertificateRepository {
  createTemplate(data: CreateCertificateTemplateDto): Promise<CertificateTemplateDto>;
  updateTemplate(id: string, data: UpdateCertificateTemplateDto): Promise<CertificateTemplateDto>;
  findTemplateById(id: string): Promise<CertificateTemplateDto | null>;
  findActiveTemplateByName(name: string): Promise<CertificateTemplateDto | null>;
  listTemplates(): Promise<CertificateTemplateDto[]>;
  issue(data: IssueCertificateDto): Promise<CertificateDto>;
  findById(id: string): Promise<CertificateDto | null>;
  findByCourseCompletionId(courseCompletionId: string): Promise<CertificateDto | null>;
  findByVerificationCode(verificationCode: string): Promise<CertificateDto | null>;
  findBySerialNumber(serialNumber: string): Promise<CertificateDto | null>;
  listByStudent(studentReferenceId: string): Promise<CertificateDto[]>;
  list(query: CertificateListQuery): Promise<CertificateListResult>;
  analytics(): Promise<CertificateAnalyticsDto>;
  revoke(data: RevokeCertificateDto): Promise<CertificateDto>;
  reissue(
    data: ReissueCertificateDto & { replacement: IssueCertificateDto },
  ): Promise<CertificateDto>;
  archive(certificateId: string, actorId: string, reason: string): Promise<CertificateDto>;
  recordVerification(certificateId: string, result: string, channel: string): Promise<void>;
  listLedger(certificateId: string): Promise<CertificateLedgerEntryDto[]>;
}
