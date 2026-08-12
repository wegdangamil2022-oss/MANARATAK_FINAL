import { describe, expect, it, vi, beforeEach } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import { AuthRouter } from '../../../../src/presentation/api/router/AuthRouter';

describe('AuthRouter API endpoints', () => {
  let app: express.Express;
  let mockAuthService: any;
  let mockIdentityRepository: any;

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn(),
      logout: vi.fn(),
      refreshTokens: vi.fn(),
    };

    mockIdentityRepository = {
      findByEmail: vi.fn(),
    };

    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', AuthRouter.create({
      authService: mockAuthService,
      identityRepository: mockIdentityRepository,
    }));
  });

  describe('POST /api/v1/auth/login', () => {
    it('validates payload and rejects invalid email format', async () => {
      const response = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'some-password' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.data).toBeNull();
    });

    it('login without credential (email-only) fails with validation error and never returns tokens', async () => {
      const response = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@manaratak.local' }); // no password

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('returns unauthorized error for non-existent/unknown email identity', async () => {
      mockIdentityRepository.findByEmail.mockResolvedValue(null);

      const response = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@manaratak.local', password: 'some-password' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
      expect(response.body.data).toBeNull();
    });

    it('returns unauthorized error when email is known but password verification fails', async () => {
      const mockIdentity = {
        id: 'user-123',
        user: { contactRegistry: { primaryEmail: 'user@manaratak.local' } }
      };
      mockIdentityRepository.findByEmail.mockResolvedValue(mockIdentity);
      mockAuthService.login.mockRejectedValue(new Error('Credential verification failed'));

      const response = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@manaratak.local', password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
      expect(response.body.error.message).toBe('Invalid credentials or identity not found');
      expect(response.body.data).toBeNull();
    });

    it('returns only safe token/session fields on successful login', async () => {
      const mockIdentity = {
        id: 'user-123',
        user: { contactRegistry: { primaryEmail: 'user@manaratak.local' } }
      };
      mockIdentityRepository.findByEmail.mockResolvedValue(mockIdentity);
      mockAuthService.login.mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456'
      });

      const response = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@manaratak.local', password: 'correct-password' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456'
      });
      // Confirm safe fields only - no secrets or credentials leaked
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.passwordHash).toBeUndefined();
      expect(response.body.data.jwtSecret).toBeUndefined();
      expect(response.body.data.JWT_SECRET).toBeUndefined();
      expect(response.body.data.ADMIN_BEARER_TOKEN).toBeUndefined();
      expect(response.body.data.DATABASE_URL).toBeUndefined();
    });

    it('returns safe error without stack traces or secrets on login failure', async () => {
      mockIdentityRepository.findByEmail.mockRejectedValue(new Error('Sensitive database query failed or timeout'));

      const response = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@manaratak.local', password: 'some-password' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.body.error.message).toBe('An unexpected error occurred during login');
      expect(response.body.error.stack).toBeUndefined();
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('validates payload and rejects missing refresh token', async () => {
      const response = await supertest(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns new tokens on successful refresh', async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });

      const response = await supertest(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });
    });

    it('returns safe invalid token error on refresh failure', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(new Error('Token revoked'));

      const response = await supertest(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-or-revoked-token' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
      expect(response.body.error.message).toBe('Session revoked, expired, or invalid refresh token');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('validates payload and rejects missing fields', async () => {
      const response = await supertest(app)
        .post('/api/v1/auth/logout')
        .send({ userId: 'user-123' }); // missing refreshToken

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns success message on successful logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const response = await supertest(app)
        .post('/api/v1/auth/logout')
        .send({ userId: 'user-123', refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        message: 'Successfully logged out'
      });
    });

    it('returns safe error on logout failure', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Some logout internal error'));

      const response = await supertest(app)
        .post('/api/v1/auth/logout')
        .send({ userId: 'user-123', refreshToken: 'some-refresh-token' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('LOGOUT_FAILED');
    });
  });
});
