import { 
  IAuthService, 
  ITokenProvider, 
  ISessionManager, 
  AuthTokens,
  InvalidTokenException
} from '@manaratak/core';
import { ICredentialVerifier, DenyAllCredentialVerifier } from './ICredentialVerifier';
import { randomUUID } from 'node:crypto';

export * from './InMemorySessionManager';
export * from './ICredentialVerifier';

export class AuthService implements IAuthService {
  constructor(
    private readonly tokenProvider: ITokenProvider,
    private readonly sessionManager: ISessionManager,
    private readonly credentialVerifier: ICredentialVerifier = new DenyAllCredentialVerifier()
  ) {}

  public async login(userId: string, credential?: string): Promise<AuthTokens> {
    if (!credential) {
      throw new Error('Credential required for verification');
    }
    const isVerified = await this.credentialVerifier.verify(userId, credential);
    if (!isVerified) {
      throw new Error('Credential verification failed');
    }

    const sessionId = randomUUID();
    const tokens = await this.tokenProvider.generateTokens({ userId, sessionId });
    await this.sessionManager.createSession(userId, tokens.refreshToken, sessionId);
    return tokens;
  }

  public async logout(userId: string, refreshToken: string): Promise<void> {
    await this.sessionManager.revokeSession(userId, refreshToken);
  }

  public async logoutCurrentSession(refreshToken: string): Promise<void> {
    const payload = await this.tokenProvider.verifyRefreshToken(refreshToken);
    await this.sessionManager.revokeSession(payload.userId, refreshToken);
  }

  public async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.tokenProvider.verifyRefreshToken(refreshToken);
    const isValid = await this.sessionManager.isValidSession(payload.userId, refreshToken);
    
    if (!isValid) {
      throw new InvalidTokenException('Session revoked or invalid');
    }

    await this.sessionManager.revokeSession(payload.userId, refreshToken);
    
    const sessionId = randomUUID();
    const newTokens = await this.tokenProvider.generateTokens({ userId: payload.userId, sessionId });
    await this.sessionManager.createSession(payload.userId, newTokens.refreshToken, sessionId);
    
    return newTokens;
  }
}
