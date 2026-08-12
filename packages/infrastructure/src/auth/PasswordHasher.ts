import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

export class PasswordHasher {
  private static readonly KEY_LEN = 64;
  private static readonly SALT_LEN = 16;
  // Default scrypt parameters
  private static readonly DEFAULT_N = 16384; // Cost factor
  private static readonly DEFAULT_R = 8;     // Block size
  private static readonly DEFAULT_P = 1;     // Parallelization

  /**
   * Hashes a plaintext password using scrypt KDF.
   */
  public static async hash(password: string, costParams?: { N?: number; r?: number; p?: number }): Promise<string> {
    const N = costParams?.N ?? this.DEFAULT_N;
    const r = costParams?.r ?? this.DEFAULT_R;
    const p = costParams?.p ?? this.DEFAULT_P;

    const salt = randomBytes(this.SALT_LEN);
    const derivedKey = scryptSync(password, salt, this.KEY_LEN, { N, r, p });

    // Encoded format: scrypt:N:r:p:saltHex:hashHex
    return `scrypt:${N}:${r}:${p}:${salt.toString('hex')}:${derivedKey.toString('hex')}`;
  }

  /**
   * Verifies a plaintext password against a formatted scrypt hash in a timing-safe manner.
   */
  public static async verify(password: string, hashedPasswordFormat: string): Promise<boolean> {
    try {
      if (!hashedPasswordFormat || typeof hashedPasswordFormat !== 'string') {
        return false;
      }
      if (!hashedPasswordFormat.startsWith('scrypt:')) {
        return false; // Deterministic malformed-hash rejection
      }
      const parts = hashedPasswordFormat.split(':');
      if (parts.length !== 6) {
        return false; // Deterministic malformed-hash rejection
      }

      const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
      const N = parseInt(nStr, 10);
      const r = parseInt(rStr, 10);
      const p = parseInt(pStr, 10);

      if (isNaN(N) || isNaN(r) || isNaN(p) || !saltHex || !hashHex) {
        return false;
      }

      const salt = Buffer.from(saltHex, 'hex');
      const originalHash = Buffer.from(hashHex, 'hex');

      const derivedKey = scryptSync(password, salt, originalHash.length, { N, r, p });

      return timingSafeEqual(originalHash, derivedKey);
    } catch {
      return false; // Fail closed safely
    }
  }
}
