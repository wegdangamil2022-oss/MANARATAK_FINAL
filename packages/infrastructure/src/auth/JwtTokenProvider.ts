import * as crypto from 'crypto';
import { ITokenProvider, AuthTokens, TokenPayload } from '@manaratak/core';

export class JwtTokenProvider implements ITokenProvider {
  constructor(private readonly secret: string, private readonly options: { accessTokenTtl: number; refreshTokenTtl: number } = { accessTokenTtl: 3600, refreshTokenTtl: 2592000 }) {}

  private base64UrlEncode(str: string): string {
    return Buffer.from(str).toString('base64url');
  }

  private base64UrlDecode(str: string): string {
    return Buffer.from(str, 'base64url').toString('utf8');
  }

  private sign(payload: any, expirySeconds: number): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expirySeconds;
    const fullPayload = { ...payload, jti: crypto.randomUUID(), iat, exp };

    const headerSegment = this.base64UrlEncode(JSON.stringify(header));
    const payloadSegment = this.base64UrlEncode(JSON.stringify(fullPayload));
    
    const signatureInput = `${headerSegment}.${payloadSegment}`;
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(signatureInput)
      .digest('base64url');

    return `${signatureInput}.${signature}`;
  }

  private verify(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    const [headerSegment, payloadSegment, signatureSegment] = parts;
    const signatureInput = `${headerSegment}.${payloadSegment}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(signatureInput)
      .digest('base64url');

    const sigSegBuf = Buffer.from(signatureSegment);
    const expectedSigBuf = Buffer.from(expectedSignature);

    if (sigSegBuf.length !== expectedSigBuf.length || !crypto.timingSafeEqual(sigSegBuf, expectedSigBuf)) {
      throw new Error('Invalid signature');
    }

    const payload = JSON.parse(this.base64UrlDecode(payloadSegment));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error('Token expired');
    }

    return payload;
  }

  public async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessToken = this.sign({ userId: payload.userId }, this.options.accessTokenTtl);
    const refreshToken = this.sign({ userId: payload.userId, isRefresh: true }, this.options.refreshTokenTtl);
    return { accessToken, refreshToken };
  }

  public async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.verify(token);
      if (payload.isRefresh) {
        throw new Error('Not an access token');
      }
      return { userId: payload.userId, ...payload };
    } catch (e: any) {
      throw new Error(`Invalid access token: ${e.message}`);
    }
  }

  public async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.verify(token);
      if (!payload.isRefresh) {
        throw new Error('Not a refresh token');
      }
      return { userId: payload.userId, ...payload };
    } catch (e: any) {
      throw new Error(`Invalid refresh token: ${e.message}`);
    }
  }
}
