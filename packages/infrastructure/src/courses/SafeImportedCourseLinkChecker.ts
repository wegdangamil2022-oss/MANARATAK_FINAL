import { lookup } from 'dns/promises';
import { request as httpsRequest } from 'https';
import { isIP } from 'net';
import {
  IImportedCourseLinkChecker,
  ImportedCourseLinkCheckResult,
} from '@manaratak/domain';

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 8_000;

function normalizeDomain(value: string): string {
  const raw = value.trim().toLowerCase();
  if (!raw) return '';
  try {
    return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.replace(/\.$/, '');
  } catch {
    return raw.split('/')[0].replace(/\.$/, '');
  }
}

function domainAllowed(hostname: string, allowedDomains: string[]): boolean {
  const host = normalizeDomain(hostname);
  return allowedDomains.some((value) => {
    const allowed = normalizeDomain(value);
    return Boolean(allowed) && (host === allowed || host.endsWith(`.${allowed}`));
  });
}

function isPrivateIpv4(address: string): boolean {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return true;
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();
  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb') ||
    normalized.startsWith('ff') ||
    normalized.startsWith('2001:db8:') ||
    normalized.startsWith('::ffff:127.') ||
    normalized.startsWith('::ffff:10.') ||
    normalized.startsWith('::ffff:192.168.')
  );
}

function publicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !isPrivateIpv4(address);
  if (family === 6) return !isPrivateIpv6(address);
  return false;
}

interface ResolvedAddress {
  address: string;
  family: 4 | 6;
}

interface HeaderResult {
  status: number;
  location?: string;
}

export class SafeImportedCourseLinkChecker implements IImportedCourseLinkChecker {
  public async check(input: { url: string; allowedDomains: string[] }): Promise<ImportedCourseLinkCheckResult> {
    const checkedAt = new Date();
    let current = this.parseHttps(input.url);
    let redirected = false;

    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
      if (!domainAllowed(current.hostname, input.allowedDomains)) {
        return {
          state: 'BLOCKED_DOMAIN',
          checkedAt,
          redirectTarget: redirected ? current.toString() : null,
          detail: 'COURSE_LINK_DOMAIN_NOT_APPROVED',
        };
      }

      const resolved = await this.resolvePublicAddress(current.hostname);
      let response: HeaderResult;
      try {
        response = await this.request(current, resolved);
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'COURSE_LINK_REQUEST_FAILED';
        return {
          state: 'NEEDS_REVIEW',
          checkedAt,
          redirectTarget: redirected ? current.toString() : null,
          detail: `COURSE_LINK_REQUEST_FAILED:${detail}`,
        };
      }
      const status = response.status;

      if (status >= 300 && status < 400) {
        const location = response.location;
        if (!location) {
          return {
            state: 'NEEDS_REVIEW',
            responseCode: status,
            checkedAt,
            redirectTarget: current.toString(),
            detail: 'COURSE_LINK_REDIRECT_LOCATION_MISSING',
          };
        }
        if (redirectCount === MAX_REDIRECTS) {
          return {
            state: 'NEEDS_REVIEW',
            responseCode: status,
            checkedAt,
            redirectTarget: new URL(location, current).toString(),
            detail: 'COURSE_LINK_REDIRECT_LIMIT_EXCEEDED',
          };
        }
        current = this.parseHttps(new URL(location, current).toString());
        redirected = true;
        continue;
      }

      if (status >= 200 && status < 300) {
        return {
          state: redirected ? 'REDIRECTED_VALID' : 'VERIFIED_DIRECT',
          responseCode: status,
          redirectTarget: redirected ? current.toString() : null,
          checkedAt,
        };
      }

      if (status === 404 || status === 410) {
        return {
          state: 'BROKEN',
          responseCode: status,
          redirectTarget: redirected ? current.toString() : null,
          checkedAt,
          detail: 'COURSE_LINK_NOT_FOUND',
        };
      }

      return {
        state: 'NEEDS_REVIEW',
        responseCode: status,
        redirectTarget: redirected ? current.toString() : null,
        checkedAt,
        detail: `COURSE_LINK_HTTP_STATUS:${status}`,
      };
    }

    return { state: 'NEEDS_REVIEW', checkedAt, detail: 'COURSE_LINK_CHECK_INDETERMINATE' };
  }

  private parseHttps(value: string): URL {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') throw new Error('COURSE_LINK_HTTPS_REQUIRED');
    if (parsed.username || parsed.password) throw new Error('COURSE_LINK_USERINFO_FORBIDDEN');
    if (parsed.port && parsed.port !== '443') throw new Error('COURSE_LINK_NON_STANDARD_PORT_FORBIDDEN');
    return parsed;
  }

  private async resolvePublicAddress(hostname: string): Promise<ResolvedAddress> {
    const literalFamily = isIP(hostname);
    if (literalFamily) {
      if (!publicAddress(hostname)) throw new Error('COURSE_LINK_PRIVATE_ADDRESS_BLOCKED');
      return { address: hostname, family: literalFamily as 4 | 6 };
    }

    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (!addresses.length) throw new Error('COURSE_LINK_DNS_EMPTY');
    if (addresses.some((entry) => !publicAddress(entry.address))) {
      throw new Error('COURSE_LINK_PRIVATE_DNS_TARGET_BLOCKED');
    }

    const selected = addresses[0];
    return {
      address: selected.address,
      family: selected.family as 4 | 6,
    };
  }

  private async request(url: URL, resolved: ResolvedAddress): Promise<HeaderResult> {
    const head = await this.requestOnce(url, resolved, 'HEAD');
    if (head.status === 405 || head.status === 501) {
      return this.requestOnce(url, resolved, 'GET');
    }
    return head;
  }

  private requestOnce(url: URL, resolved: ResolvedAddress, method: 'HEAD' | 'GET'): Promise<HeaderResult> {
    return new Promise((resolve, reject) => {
      const req = httpsRequest({
        protocol: 'https:',
        hostname: url.hostname,
        port: 443,
        path: `${url.pathname}${url.search}`,
        method,
        servername: url.hostname,
        headers: method === 'GET'
          ? { Range: 'bytes=0-0', 'User-Agent': 'MANARATAK-LinkVerifier/1.0' }
          : { 'User-Agent': 'MANARATAK-LinkVerifier/1.0' },
        lookup: (_hostname: string, _options: unknown, callback: Function) => {
          callback(null, resolved.address, resolved.family);
        },
      }, (response) => {
        const locationHeader = response.headers.location;
        const location = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader;
        const status = response.statusCode ?? 0;
        response.destroy();
        resolve({ status, location });
      });

      req.setTimeout(REQUEST_TIMEOUT_MS, () => {
        req.destroy(new Error('COURSE_LINK_REQUEST_TIMEOUT'));
      });
      req.once('error', reject);
      req.end();
    });
  }
}
