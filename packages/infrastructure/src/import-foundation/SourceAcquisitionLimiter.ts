import type { ISourceAcquisitionLimiter } from '@manaratak/application';
import type { ImportSourceDefinition } from '@manaratak/domain';
export class SourceAcquisitionLimiter implements ISourceAcquisitionLimiter {
  private readonly last = new Map<string, number>();
  constructor(private readonly now: () => number = Date.now, private readonly sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms))) {}
  async wait(source: ImportSourceDefinition): Promise<void> {
    const policy = source.metadata?.rateLimitPolicy as { minimumDelayMs?: number } | undefined;
    const rpm = source.rateLimitPerMinute ?? 0;
    const interval = Math.max(policy?.minimumDelayMs ?? 0, rpm > 0 ? Math.ceil(60_000 / rpm) : 0);
    const delay = Math.max(0, interval - (this.now() - (this.last.get(source.sourceId) ?? -Infinity))); if (delay) await this.sleep(delay);
    this.last.set(source.sourceId, this.now());
  }
}
