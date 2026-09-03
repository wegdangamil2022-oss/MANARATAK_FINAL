import { CertificateStatus } from '../enums/CertificateStatus';
import { CertificateType } from '../entities/Certificate';

/** Sanitized P14-owned private projection intended for authenticated P15 composition. */
export interface StudentCertificateReadModelDto {
  certificateId: string;
  publicId: string;
  serialNumber: string;
  verificationCode: string;
  verificationUrl: string;
  status: CertificateStatus;
  certificateType: CertificateType;
  achievementType: 'COURSE' | 'LEARNING_PATH';
  achievementId: string;
  achievementDisplayName: string;
  issuedAt: Date;
  expiresAt?: Date | null;
  certificatePdfAssetId?: string | null;
  previewImageAssetId?: string | null;
}
