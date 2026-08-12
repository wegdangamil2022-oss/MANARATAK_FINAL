import { IRateLimiter } from './IRateLimiter';

export interface ISecurityService {
  readonly isProductionReady?: boolean;
  readonly kind?: 'real' | 'demo';
  getRateLimiter(): IRateLimiter;
  generateCsrfToken(sessionSecret: string): string;
  validateCsrfToken(token: string, sessionSecret: string): boolean;
}
