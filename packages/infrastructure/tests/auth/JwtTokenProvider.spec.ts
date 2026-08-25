import { describe, expect, it } from 'vitest';
import { JwtTokenProvider } from '../../src/auth/JwtTokenProvider';

describe('JwtTokenProvider infrastructure adapter', () => {
  it('generates and verifies access and refresh tokens', async () => {
    const provider = new JwtTokenProvider('test-secret-key-must-be-long-enough-32-chars');
    const tokens = await provider.generateTokens({ userId: 'user-123' });
    await expect(provider.verifyAccessToken(tokens.accessToken)).resolves.toMatchObject({ userId: 'user-123' });
    await expect(provider.verifyRefreshToken(tokens.refreshToken)).resolves.toMatchObject({ userId: 'user-123' });
  });

  it('rejects a tampered JWT signature', async () => {
    const provider = new JwtTokenProvider('another-very-long-secret-key-32-chars-at-least');
    const { accessToken } = await provider.generateTokens({ userId: 'user-123' });
    const parts = accessToken.split('.');
    const tampered = `${parts[0]}.eyJ1c2VySWQiOiJ1c2VyLTQ1NiJ9.${parts[2]}`;
    await expect(provider.verifyAccessToken(tampered)).rejects.toThrow(/Invalid access token/);
  });
});
