import { CertificateStatus } from '../enums/CertificateStatus';
import { CertificateTemplateStatus } from '../enums/CertificateTemplateStatus';

export type CertificateLanguage = 'ARABIC' | 'ENGLISH' | 'BILINGUAL';
export type CertificateLayout = 'LANDSCAPE' | 'PORTRAIT';
export type CertificateValidityPolicy = 'PERMANENT' | 'EXPIRING' | 'RENEWABLE';
export type CertificateType =
  | 'COURSE'
  | 'LEARNING_PATH'
  | 'PROGRAM'
  | 'WORKSHOP'
  | 'BOOTCAMP'
  | 'PARTICIPATION'
  | 'ACHIEVEMENT'
  | 'HONOR';

export interface CreateCertificateTemplateDto {
  publicId: string;
  code: string;
  name: string;
  nameAr: string;
  nameEn: string;
  templateVersion: string;
  status: CertificateTemplateStatus;
  issuerName: string;
  issuerReferenceId?: string | null;
  language: CertificateLanguage;
  layout: CertificateLayout;
  accentColor: string;
  secondaryColor: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  signatoryNameAr?: string | null;
  signatoryNameEn?: string | null;
  signatoryTitleAr?: string | null;
  signatoryTitleEn?: string | null;
  logoAssetId?: string | null;
  sealAssetId?: string | null;
  signatureAssetId?: string | null;
  designAssetId?: string | null;
  metadata?: Record<string, unknown> | null;
}
export type UpdateCertificateTemplateDto = Partial<
  Omit<CreateCertificateTemplateDto, 'publicId' | 'code'>
>;
export interface CertificateTemplateDto extends CreateCertificateTemplateDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueCertificateDto {
  publicId: string;
  serialNumber: string;
  verificationCode: string;
  verificationHash: string;
  status: CertificateStatus;
  certificateType: CertificateType;
  studentReferenceId: string;
  recipientDisplayName?: string | null;
  courseId: string;
  courseDisplayName: string;
  courseCompletionId: string;
  courseCompletedAt: Date;
  issuedAt?: Date;
  expiresAt?: Date | null;
  validityPolicy?: CertificateValidityPolicy;
  templateId?: string | null;
  templateVersion?: string | null;
  certificatePdfAssetId?: string | null;
  previewImageAssetId?: string | null;
  verificationQrAssetId?: string | null;
  signatureAssetId?: string | null;
  digitalSignature?: string | null;
  signingKeyReference?: string | null;
  issuerName?: string | null;
  issuerReferenceId?: string | null;
  grade?: string | null;
  score?: number | null;
  skills?: string[];
  competencies?: string[];
  metadata?: Record<string, unknown> | null;
  correlationId?: string | null;
  actorId?: string | null;
}

export interface CertificateDto extends IssueCertificateDto {
  id: string;
  issuedAt: Date;
  validityPolicy: CertificateValidityPolicy;
  skills: string[];
  competencies: string[];
  revokedAt?: Date | null;
  revocationReason?: string | null;
  revokedBy?: string | null;
  replacesCertificateId?: string | null;
  replacedByCertificateId?: string | null;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificateVerificationDto {
  publicId: string;
  serialNumber: string;
  verificationCode: string;
  verificationHash: string;
  status: CertificateStatus;
  certificateType: CertificateType;
  recipientDisplayName?: string | null;
  courseDisplayName: string;
  courseCompletedAt: Date;
  issuedAt: Date;
  expiresAt?: Date | null;
  issuerName?: string | null;
  grade?: string | null;
  skills: string[];
  competencies: string[];
  templateVersion?: string | null;
  revokedAt?: Date | null;
  revocationReason?: string | null;
  isValid: boolean;
  integrityVerified: boolean;
}

export interface RevokeCertificateDto {
  certificateId: string;
  reason: string;
  actorId: string;
  correlationId?: string | null;
}
export interface ReissueCertificateDto {
  certificateId: string;
  reason: string;
  actorId: string;
  recipientDisplayName?: string | null;
  templateId?: string | null;
  correlationId?: string | null;
}
export interface CertificateLedgerEntryDto {
  id: string;
  certificateId: string;
  action: string;
  actorId: string;
  reason?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt: Date;
}
export interface CertificateAnalyticsDto {
  total: number;
  active: number;
  revoked: number;
  archived: number;
  expiringSoon: number;
  templates: number;
  verifications: number;
}
export interface CertificateListQuery {
  search?: string;
  status?: CertificateStatus;
  templateId?: string;
  page?: number;
  pageSize?: number;
}
export interface CertificateListResult {
  data: CertificateDto[];
  total: number;
  page: number;
  pageSize: number;
}
