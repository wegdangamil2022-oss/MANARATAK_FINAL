import { createHash, createHmac } from 'crypto';
import {
  CertificateNumberingInput,
  CertificateVerificationQrPayload,
  ICertificateNumberingService,
  ICertificateSignatureService,
  ICertificateVerificationQrService,
} from '@manaratak/domain';

export interface CertificateSigningRuntimeConfiguration {
  signingKeyReference?: string;
  signingSecret?: string;
  productionLike?: boolean;
}

/**
 * Default source-level Phase 14 trust policy. Production key custody remains a
 * KMS/HSM runtime concern; the source contract fails closed in production-like
 * mode when no signing provider secret is configured.
 */
export class CertificateTrustPolicy
  implements ICertificateNumberingService, ICertificateSignatureService, ICertificateVerificationQrService {
  constructor(private readonly runtime: CertificateSigningRuntimeConfiguration = {}) {}

  public generate(input: CertificateNumberingInput): string {
    const year = input.issuedAt.getUTCFullYear();
    const entropy = this.digest(`${input.studentReferenceId}:${input.completionIdentity}`).slice(0, 12).toUpperCase();
    return `${input.issuerPrefix}-${input.certificateTypePrefix}-${year}-${entropy}`;
  }

  public assertIssuerKeyAvailable(signingKeyReference: string): void {
    if (!signingKeyReference.trim()) throw new Error('CERTIFICATE_ISSUER_SIGNING_KEY_REQUIRED');
    if (this.runtime.signingKeyReference && this.runtime.signingKeyReference !== signingKeyReference) {
      throw new Error('CERTIFICATE_ISSUER_SIGNING_KEY_NOT_CONFIGURED');
    }
    if (!this.runtime.signingSecret && this.runtime.productionLike) {
      throw new Error('CERTIFICATE_SIGNING_PROVIDER_NOT_CONFIGURED');
    }
  }

  public signHash(hash: string, signingKeyReference: string): string {
    this.assertIssuerKeyAvailable(signingKeyReference);
    return createHmac('sha256', this.runtime.signingSecret ?? 'source-only-development-signing-key')
      .update(`${signingKeyReference}:${hash}`)
      .digest('hex');
  }

  public verifyHash(hash: string, signature: string | null | undefined, signingKeyReference: string): boolean {
    if (!signature) return false;
    try {
      return signature === this.signHash(hash, signingKeyReference);
    } catch {
      return false;
    }
  }

  public createPayload(verificationCode: string, verificationUrl: string): CertificateVerificationQrPayload {
    if (!verificationCode.trim() || !verificationUrl.trim()) throw new Error('CERTIFICATE_VERIFICATION_QR_INPUT_REQUIRED');
    return {
      schemaVersion: 'certificate-verification-qr-v1',
      verificationCode,
      verificationUrl,
      payload: verificationUrl,
    };
  }

  private digest(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
