import { describe, expect, it } from 'vitest';
import { AuthService } from '../../src/auth/AuthService';
import type { ITokenProvider, TokenPayload, AuthTokens } from '@manaratak/core';
import { InMemorySessionManager } from '../../src/auth/InMemorySessionManager';
import { ICredentialVerifier } from '../../src/auth/ICredentialVerifier';


class TestTokenProvider implements ITokenProvider {
  private counter = 0;
  async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    this.counter += 1;
    return {
      accessToken: `access:${payload.userId}:${this.counter}`,
      refreshToken: `refresh:${payload.userId}:${this.counter}`,
    };
  }
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const [, userId] = token.split(':');
    if (!token.startsWith('access:') || !userId) throw new Error('Invalid access token');
    return { userId };
  }
  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const [, userId] = token.split(':');
    if (!token.startsWith('refresh:') || !userId) throw new Error('Invalid refresh token');
    return { userId };
  }
}

describe('AuthService and Package Helpers', () => {
  describe('ICredentialVerifier and Login', () => {
    it('login without credential fails', async () => {
      const tokenProvider = new TestTokenProvider();
      const sessionManager = new InMemorySessionManager();
      const authService = new AuthService(tokenProvider, sessionManager);

      await expect(authService.login('user-123')).rejects.toThrow('Credential required for verification');
    });

    it('login with known email but invalid credential fails', async () => {
      const tokenProvider = new TestTokenProvider();
      const sessionManager = new InMemorySessionManager();
      const fakeVerifier: ICredentialVerifier = {
        verify: async (_userId, credentialValue) => credentialValue === 'correct-password',
      };
      const authService = new AuthService(tokenProvider, sessionManager, fakeVerifier);

      await expect(authService.login('user-123', 'wrong-password')).rejects.toThrow('Credential verification failed');
    });

    it('login with known email and verified credential succeeds using injected fake verifier', async () => {
      const tokenProvider = new TestTokenProvider();
      const sessionManager = new InMemorySessionManager();
      const fakeVerifier: ICredentialVerifier = {
        verify: async (_userId, credentialValue) => credentialValue === 'correct-password',
      };
      const authService = new AuthService(tokenProvider, sessionManager, fakeVerifier);

      const tokens = await authService.login('user-123', 'correct-password');
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });
  });

  describe('InMemorySessionManager Hashing', () => {
    it('raw refresh tokens are not stored directly in InMemorySessionManager internals', async () => {
      const sessionManager = new InMemorySessionManager() as any;
      const userId = 'user-123';
      const rawRefreshToken = 'super-secret-refresh-token';

      await sessionManager.createSession(userId, rawRefreshToken);

      const userSessions = sessionManager.sessions.get(userId);
      expect(userSessions).toBeDefined();
      expect(userSessions.has(rawRefreshToken)).toBe(false); // does not store raw token

      // Should contain the hashed version
      const expectedHashed = require('crypto')
        .createHash('sha256')
        .update(rawRefreshToken)
        .digest('hex');
      expect(Array.from(userSessions.values())).toContain(expectedHashed);

      // isValidSession should work with raw token input
      const isValid = await sessionManager.isValidSession(userId, rawRefreshToken);
      expect(isValid).toBe(true);
    });

    it('logout revokes session', async () => {
      const sessionManager = new InMemorySessionManager();
      const userId = 'user-123';
      const rawRefreshToken = 'super-secret-refresh-token';

      await sessionManager.createSession(userId, rawRefreshToken);
      expect(await sessionManager.isValidSession(userId, rawRefreshToken)).toBe(true);

      await sessionManager.revokeSession(userId, rawRefreshToken);
      expect(await sessionManager.isValidSession(userId, rawRefreshToken)).toBe(false);
    });

    it('tracks the access token session identifier and invalidates it on logout', async () => {
      const sessionManager = new InMemorySessionManager();
      await sessionManager.createSession('user-123', 'refresh-token', 'session-123');
      expect(await sessionManager.isSessionActive('user-123', 'session-123')).toBe(true);

      await sessionManager.revokeSession('user-123', 'refresh-token');
      expect(await sessionManager.isSessionActive('user-123', 'session-123')).toBe(false);
    });
  });

});
