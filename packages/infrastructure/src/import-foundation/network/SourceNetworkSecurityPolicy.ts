import { isIP } from 'node:net';
import { promises as dns } from 'node:dns';
import type { ImportSourceDefinition } from '@manaratak/domain';

export interface SourceAddressResolver { resolve(hostname: string): Promise<string[]>; }
export class NodeSourceAddressResolver implements SourceAddressResolver {
  async resolve(hostname: string): Promise<string[]> { return (await dns.lookup(hostname, { all: true, verbatim: true })).map(({ address }) => address); }
}
export interface ValidatedSourceTarget { url: URL; addresses: string[]; }
export class SourceNetworkSecurityPolicy {
  constructor(private readonly resolver: SourceAddressResolver = new NodeSourceAddressResolver()) {}
  async validate(source: ImportSourceDefinition, value: string): Promise<ValidatedSourceTarget> {
    let url: URL; try { url = new URL(value); } catch { throw new Error('SOURCE_URL_INVALID'); }
    if (url.protocol !== 'https:') throw new Error('SOURCE_URL_SCHEME_BLOCKED');
    if (url.username || url.password) throw new Error('SOURCE_URL_CREDENTIALS_BLOCKED');
    this.validateScope(source, url);
    const addresses = isIP(url.hostname) ? [url.hostname] : await this.resolver.resolve(url.hostname);
    if (!addresses.length || addresses.some((address) => !this.isPublic(address))) throw new Error('SOURCE_ADDRESS_BLOCKED');
    return { url, addresses };
  }
  private validateScope(source: ImportSourceDefinition, url: URL): void {
    const raw = source.metadata?.allowedUrlScope as { allowedOrigins?: string[]; allowedPathPrefixes?: string[]; allowSubdomains?: boolean } | undefined;
    const base = new URL(source.baseUrl);
    const origins = raw?.allowedOrigins?.length ? raw.allowedOrigins : [base.origin];
    const allowed = origins.some((origin) => {
      const candidate = new URL(origin); const exact = url.origin === candidate.origin;
      const subdomain = raw?.allowSubdomains === true && url.protocol === candidate.protocol && url.port === candidate.port && url.hostname.endsWith(`.${candidate.hostname}`);
      return exact || subdomain;
    });
    if (!allowed) throw new Error('SOURCE_URL_OUT_OF_SCOPE');
    const prefixes = raw?.allowedPathPrefixes?.length ? raw.allowedPathPrefixes : ['/'];
    if (!prefixes.some((prefix) => url.pathname.startsWith(prefix))) throw new Error('SOURCE_PATH_OUT_OF_SCOPE');
  }
  private isPublic(address: string): boolean {
    if (address.includes(':')) {
      const normalized = address.toLowerCase();
      return !(normalized === '::1' || normalized === '::' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb') || normalized.startsWith('ff') || normalized.startsWith('2001:db8'));
    }
    const parts = address.split('.').map(Number); if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
    const [a, b] = parts;
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)));
  }
}
