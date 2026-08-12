import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../src/auth/AuthService';
import { JwtTokenProvider } from '../../src/auth/JwtTokenProvider';
import { InMemorySessionManager } from '../../src/auth/InMemorySessionManager';
import { ICredentialVerifier } from '../../src/auth/ICredentialVerifier';

describe('AuthService and Package Helpers', () => {
  describe('ICredentialVerifier and Login', () => {
    it('login without credential fails', async () => {
      const tokenProvider = new JwtTokenProvider('test-secret-key-must-be-long-enough-32-chars');
      const sessionManager = new InMemorySessionManager();
      const authService = new AuthService(tokenProvider, sessionManager);

      await expect(authService.login('user-123')).rejects.toThrow('Credential required for verification');
    });

    it('login with known email but invalid credential fails', async () => {
      const tokenProvider = new JwtTokenProvider('test-secret-key-must-be-long-enough-32-chars');
      const sessionManager = new InMemorySessionManager();
      const fakeVerifier: ICredentialVerifier = {
        verify: async (_userId, credentialValue) => credentialValue === 'correct-password',
      };
      const authService = new AuthService(tokenProvider, sessionManager, fakeVerifier);

      await expect(authService.login('user-123', 'wrong-password')).rejects.toThrow('Credential verification failed');
    });

    it('login with known email and verified credential succeeds using injected fake verifier', async () => {
      const tokenProvider = new JwtTokenProvider('test-secret-key-must-be-long-enough-32-chars');
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
      expect(userSessions.has(expectedHashed)).toBe(true);

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
  });

  describe('JwtTokenProvider Signature Verification', () => {
    it('JWT signature verification rejects tampered tokens', async () => {
      const secret = 'another-very-long-secret-key-32-chars-at-least';
      const tokenProvider = new JwtTokenProvider(secret);

      const tokens = await tokenProvider.generateTokens({ userId: 'user-123' });
      const validToken = tokens.accessToken;

      // Tamper with payload segment
      const parts = validToken.split('.');
      const tamperedToken = `${parts[0]}.eyJ1c2VySWQiOiJ1c2VyLTQ1NiIsImlhdCI6MTY5MDcyNDAwMCwiZXhwIjoxNjkwNzI3NjAwfQ.${parts[2]}`;

      await expect(tokenProvider.verifyAccessToken(tamperedToken)).rejects.toThrow();
    });
  });
});
