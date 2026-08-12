import {
  CertificateDto,
  CertificateTemplateDto,
  CreateCertificateTemplateDto,
  IssueCertificateDto,
  RevokeCertificateDto
} from '../entities/Certificate';

export interface ICertificateRepository {
  createTemplate(data: CreateCertificateTemplateDto): Promise<CertificateTemplateDto>;
  findActiveTemplateByName(name: string): Promise<CertificateTemplateDto | null>;
  listTemplates(): Promise<CertificateTemplateDto[]>;

  issue(data: IssueCertificateDto): Promise<CertificateDto>;
  findById(id: string): Promise<CertificateDto | null>;
  findByCourseCompletionId(courseCompletionId: string): Promise<CertificateDto | null>;
  findByVerificationCode(verificationCode: string): Promise<CertificateDto | null>;
  findBySerialNumber(serialNumber: string): Promise<CertificateDto | null>;
  listByStudent(studentReferenceId: string): Promise<CertificateDto[]>;
  revoke(data: RevokeCertificateDto): Promise<CertificateDto>;
}
