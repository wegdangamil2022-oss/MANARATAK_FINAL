import { ICredentialVerifier } from '@manaratak/application';
import { LifeStatus, AccountAccessState } from '@manaratak/domain';
import { PasswordHasher } from './PasswordHasher';

export class PrismaCredentialVerifier implements ICredentialVerifier {
  constructor(private readonly prisma: any) {}

  public async verify(userId: string, credentialValue: string): Promise<boolean> {
    try {
      if (!userId || !credentialValue) {
        return false;
      }

      // 1. Identity lookup along with its credentials and account
      const identity = await this.prisma.identityRecord.findUnique({
        where: { id: userId },
        include: {
          account: true,
          credentials: {
            where: {
              type: 'password',
              disabled: false
            }
          }
        }
      });

      if (!identity) {
        return false; // Deterministic invalid-credential response without leakage
      }

      // 2. Disabled/inactive identity or account rejection
      if (![LifeStatus.PROVISIONED, LifeStatus.ACTIVE].includes(identity.status) || !identity.account || identity.account.accessState !== AccountAccessState.ACTIVE) {
        return false; // Rejects disabled/inactive principal
      }

      // 3. Credential lookup
      const credential = identity.credentials?.[0];
      if (!credential || !credential.passwordHash) {
        return false;
      }

      // 4. Password verification via timing-safe scrypt verification
      return await PasswordHasher.verify(credentialValue, credential.passwordHash);
    } catch (error) {
      // Fail closed deterministically without throwing or leaking database details
      return false;
    }
  }
}
