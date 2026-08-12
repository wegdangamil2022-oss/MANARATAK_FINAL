import { ISessionManager } from '@manaratak/core';
import * as crypto from 'crypto';

export class InMemorySessionManager implements ISessionManager {
  private sessions = new Map<string, Set<string>>();

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public async createSession(userId: string, refreshToken: string): Promise<void> {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, new Set());
    }
    const hashed = this.hashToken(refreshToken);
    this.sessions.get(userId)!.add(hashed);
  }

  public async revokeSession(userId: string, refreshToken: string): Promise<void> {
    const userSessions = this.sessions.get(userId);
    if (userSessions) {
      const hashed = this.hashToken(refreshToken);
      userSessions.delete(hashed);
    }
  }

  public async revokeAllSessions(userId: string): Promise<void> {
    this.sessions.delete(userId);
  }

  public async isValidSession(userId: string, refreshToken: string): Promise<boolean> {
    const userSessions = this.sessions.get(userId);
    const hashed = this.hashToken(refreshToken);
    return !!userSessions && userSessions.has(hashed);
  }
}
