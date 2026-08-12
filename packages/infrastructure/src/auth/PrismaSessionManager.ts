import { ISessionManager } from '@manaratak/core';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

export class PrismaSessionManager implements ISessionManager {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly sessionTtlSeconds: number = 86400 * 7 // default 7 days
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public async createSession(userId: string, refreshToken: string): Promise<void> {
    const hashed = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.sessionTtlSeconds * 1000);

    await this.prisma.sessionRecord.create({
      data: {
        identityId: userId,
        refreshTokenHash: hashed,
        expiresAt,
      },
    });
  }

  public async revokeSession(userId: string, refreshToken: string): Promise<void> {
    const hashed = this.hashToken(refreshToken);
    
    // Use updateMany to safely revoke if it exists, matching both userId and hash
    await this.prisma.sessionRecord.updateMany({
      where: {
        identityId: userId,
        refreshTokenHash: hashed,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  public async revokeAllSessions(userId: string): Promise<void> {
    await this.prisma.sessionRecord.updateMany({
      where: {
        identityId: userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  public async isValidSession(userId: string, refreshToken: string): Promise<boolean> {
    const hashed = this.hashToken(refreshToken);
    
    const session = await this.prisma.sessionRecord.findFirst({
      where: {
        identityId: userId,
        refreshTokenHash: hashed,
        revokedAt: null,
        expiresAt: {
          gt: new Date(), // Must not be expired
        },
      },
    });

    return !!session;
  }
}
