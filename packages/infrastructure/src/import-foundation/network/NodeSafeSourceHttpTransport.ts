import https from 'node:https';
import type { ImportSourceDefinition } from '@manaratak/domain';
import type { ISafeSourceHttpTransport, SafeSourceHttpResponse, SourceAcquisitionRequest } from '@manaratak/application';
import { SourceNetworkSecurityPolicy } from './SourceNetworkSecurityPolicy';
export class NodeSafeSourceHttpTransport implements ISafeSourceHttpTransport {
  constructor(private readonly policy = new SourceNetworkSecurityPolicy()) {}
  async get(source: ImportSourceDefinition, request: SourceAcquisitionRequest): Promise<SafeSourceHttpResponse> {
    const requestedUrl = request.targetUrl ?? source.baseUrl; let current = requestedUrl;
    const maxRedirects = Math.min(request.maxRedirects ?? 5, 5); const maxBytes = request.maxResponseBytes ?? 5 * 1024 * 1024; const timeoutMs = request.timeoutMs ?? 15_000;
    for (let redirects = 0; redirects <= maxRedirects; redirects++) {
      const target = await this.policy.validate(source, current); const response = await this.request(target.url, target.addresses[0], timeoutMs, maxBytes);
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        if (!response.location || redirects === maxRedirects) throw new Error('SOURCE_REDIRECT_LIMIT');
        current = new URL(response.location, target.url).toString(); continue;
      }
      return { requestedUrl, finalUrl: current, statusCode: response.statusCode, contentType: response.contentType, rawBytes: response.rawBytes, fetchedAt: new Date(), etag: response.etag, lastModified: response.lastModified };
    }
    throw new Error('SOURCE_REDIRECT_LIMIT');
  }
  private request(url: URL, pinnedAddress: string, timeoutMs: number, maxBytes: number): Promise<{ statusCode: number; location?: string; contentType?: string; rawBytes: Uint8Array; etag?: string; lastModified?: string }> {
    return new Promise((resolve, reject) => {
      const req = https.request(url, { servername: url.hostname, lookup: (_host, _options, callback) => callback(null, pinnedAddress, pinnedAddress.includes(':') ? 6 : 4) }, (res) => {
        const chunks: Buffer[] = []; let size = 0;
        res.on('data', (chunk: Buffer) => { size += chunk.length; if (size > maxBytes) req.destroy(new Error('SOURCE_RESPONSE_TOO_LARGE')); else chunks.push(chunk); });
        res.on('end', () => resolve({ statusCode: res.statusCode ?? 0, location: res.headers.location, contentType: res.headers['content-type'], rawBytes: Buffer.concat(chunks), etag: res.headers.etag, lastModified: res.headers['last-modified'] }));
      });
      req.setTimeout(timeoutMs, () => req.destroy(new Error('SOURCE_REQUEST_TIMEOUT'))); req.on('error', reject); req.end();
    });
  }
}
