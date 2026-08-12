import { 
  IAuthService, 
  ITokenProvider, 
  ISessionManager, 
  AuthTokens,
  InvalidTokenException
} from '@manaratak/core';
import { ICredentialVerifier, DenyAllCredentialVerifier } from './ICredentialVerifier';

export * from './JwtTokenProvider';
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

    const tokens = await this.tokenProvider.generateTokens({ userId });
    await this.sessionManager.createSession(userId, tokens.refreshToken);
    return tokens;
  }

  public async logout(userId: string, refreshToken: string): Promise<void> {
    await this.sessionManager.revokeSession(userId, refreshToken);
  }

  public async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.tokenProvider.verifyRefreshToken(refreshToken);
    const isValid = await this.sessionManager.isValidSession(payload.userId, refreshToken);
    
    if (!isValid) {
      throw new InvalidTokenException('Session revoked or invalid');
    }

    await this.sessionManager.revokeSession(payload.userId, refreshToken);
    
    const newTokens = await this.tokenProvider.generateTokens({ userId: payload.userId });
    await this.sessionManager.createSession(payload.userId, newTokens.refreshToken);
    
    return newTokens;
  }
}
