import { ISessionManager } from '@manaratak/core';
import * as crypto from 'crypto';

export class InMemorySessionManager implements ISessionManager {
  private sessions = new Map<string, Map<string, string>>();

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public async createSession(userId: string, refreshToken: string, sessionId = crypto.randomUUID()): Promise<void> {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, new Map());
    }
    const hashed = this.hashToken(refreshToken);
    this.sessions.get(userId)!.set(sessionId, hashed);
  }

  public async revokeSession(userId: string, refreshToken: string): Promise<void> {
    const userSessions = this.sessions.get(userId);
    if (userSessions) {
      const hashed = this.hashToken(refreshToken);
      for (const [sessionId, tokenHash] of userSessions) {
        if (tokenHash === hashed) userSessions.delete(sessionId);
      }
    }
  }

  public async revokeAllSessions(userId: string): Promise<void> {
    this.sessions.delete(userId);
  }

  public async isValidSession(userId: string, refreshToken: string): Promise<boolean> {
    const userSessions = this.sessions.get(userId);
    const hashed = this.hashToken(refreshToken);
    return !!userSessions && Array.from(userSessions.values()).includes(hashed);
  }

  public async isSessionActive(userId: string, sessionId: string): Promise<boolean> {
    return this.sessions.get(userId)?.has(sessionId) ?? false;
  }
}
