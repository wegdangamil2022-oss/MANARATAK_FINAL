import * as crypto from 'crypto';
import { ITokenProvider, AuthTokens, TokenPayload } from '@manaratak/core';

export class JwtTokenProvider implements ITokenProvider {
  constructor(
    private readonly secret: string,
    private readonly options: { accessTokenTtl: number; refreshTokenTtl: number; issuer?: string; audience?: string } = { accessTokenTtl: 3600, refreshTokenTtl: 2592000 },
  ) {}

  private base64UrlEncode(str: string): string {
    return Buffer.from(str).toString('base64url');
  }

  private base64UrlDecode(str: string): string {
    return Buffer.from(str, 'base64url').toString('utf8');
  }

  private sign(payload: TokenPayload, tokenType: 'access' | 'refresh', expirySeconds: number): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expirySeconds;
    const fullPayload = {
      userId: payload.userId,
      ...(payload.sessionId ? { sessionId: payload.sessionId } : {}),
      tokenType,
      iss: this.options.issuer || 'manaratak-api',
      aud: this.options.audience || 'manaratak-browser',
      jti: crypto.randomUUID(),
      iat,
      exp,
    };

    const headerSegment = this.base64UrlEncode(JSON.stringify(header));
    const payloadSegment = this.base64UrlEncode(JSON.stringify(fullPayload));
    
    const signatureInput = `${headerSegment}.${payloadSegment}`;
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(signatureInput)
      .digest('base64url');

    return `${signatureInput}.${signature}`;
  }

  private verify(token: string, expectedType: 'access' | 'refresh'): TokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    const [headerSegment, payloadSegment, signatureSegment] = parts;
    if (![headerSegment, payloadSegment, signatureSegment].every((part) => /^[A-Za-z0-9_-]+$/.test(part))) {
      throw new Error('Invalid token');
    }
    const signatureInput = `${headerSegment}.${payloadSegment}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(signatureInput)
      .digest('base64url');

    const sigSegBuf = Buffer.from(signatureSegment, 'base64url');
    const expectedSigBuf = Buffer.from(expectedSignature, 'base64url');

    if (sigSegBuf.length !== expectedSigBuf.length || !crypto.timingSafeEqual(sigSegBuf, expectedSigBuf)) {
      throw new Error('Invalid signature');
    }

    let header: unknown;
    let payload: any;
    try {
      header = JSON.parse(this.base64UrlDecode(headerSegment));
      payload = JSON.parse(this.base64UrlDecode(payloadSegment));
    } catch {
      throw new Error('Invalid token');
    }
    if (!header || typeof header !== 'object' || (header as any).alg !== 'HS256' || (header as any).typ !== 'JWT') {
      throw new Error('Invalid token');
    }
    const now = Math.floor(Date.now() / 1000);
    const issuer = this.options.issuer || 'manaratak-api';
    const audience = this.options.audience || 'manaratak-browser';
    if (!payload || typeof payload !== 'object' || typeof payload.userId !== 'string' || !payload.userId ||
      typeof payload.jti !== 'string' || !payload.jti || payload.tokenType !== expectedType ||
      payload.iss !== issuer || payload.aud !== audience || !Number.isInteger(payload.iat) || !Number.isInteger(payload.exp) ||
      payload.exp <= payload.iat || payload.exp < now) {
      throw new Error('Invalid token');
    }
    return { userId: payload.userId, ...(typeof payload.sessionId === 'string' ? { sessionId: payload.sessionId } : {}) };
  }

  public async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessToken = this.sign(payload, 'access', this.options.accessTokenTtl);
    const refreshToken = this.sign(payload, 'refresh', this.options.refreshTokenTtl);
    return { accessToken, refreshToken };
  }

  public async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      return this.verify(token, 'access');
    } catch {
      throw new Error('Invalid access token');
    }
  }

  public async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      return this.verify(token, 'refresh');
    } catch {
      throw new Error('Invalid refresh token');
    }
  }
}
