import { CertificateStatus } from '../enums/CertificateStatus';
import { CertificateTemplateStatus } from '../enums/CertificateTemplateStatus';

export interface CreateCertificateTemplateDto {
  publicId: string;
  name: string;
  templateVersion: string;
  status: CertificateTemplateStatus;
  issuerName: string;
  issuerReferenceId?: string | null;
  designAssetId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface CertificateTemplateDto extends CreateCertificateTemplateDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueCertificateDto {
  publicId: string;
  serialNumber: string;
  verificationCode: string;
  status: CertificateStatus;
  studentReferenceId: string;
  recipientDisplayName?: string | null;
  courseId: string;
  courseDisplayName: string;
  courseCompletionId: string;
  courseCompletedAt: Date;
  issuedAt?: Date;
  templateId?: string | null;
  certificatePdfAssetId?: string | null;
  verificationQrAssetId?: string | null;
  signatureAssetId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface CertificateDto extends Required<Omit<IssueCertificateDto, 'issuedAt' | 'templateId' | 'recipientDisplayName' | 'certificatePdfAssetId' | 'verificationQrAssetId' | 'signatureAssetId' | 'metadata'>> {
  id: string;
  issuedAt: Date;
  revokedAt?: Date | null;
  revocationReason?: string | null;
  templateId?: string | null;
  recipientDisplayName?: string | null;
  certificatePdfAssetId?: string | null;
  verificationQrAssetId?: string | null;
  signatureAssetId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificateVerificationDto {
  publicId: string;
  serialNumber: string;
  verificationCode: string;
  status: CertificateStatus;
  studentReferenceId: string;
  recipientDisplayName?: string | null;
  courseId: string;
  courseDisplayName: string;
  courseCompletedAt: Date;
  issuedAt: Date;
  revokedAt?: Date | null;
  revocationReason?: string | null;
  isValid: boolean;
}

export interface RevokeCertificateDto {
  certificateId: string;
  reason: string;
}
