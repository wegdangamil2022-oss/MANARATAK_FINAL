export interface ISessionManager {
  createSession(userId: string, refreshToken: string): Promise<void>;
  revokeSession(userId: string, refreshToken: string): Promise<void>;
  revokeAllSessions(userId: string): Promise<void>;
  isValidSession(userId: string, refreshToken: string): Promise<boolean>;
}
