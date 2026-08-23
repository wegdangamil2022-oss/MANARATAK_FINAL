import type { IImportHandoffConsumer, UniversalImportHandoff } from '@manaratak/domain';

/** Generic Phase 6 dispatcher. It routes owner domains and knows no domain semantics. */
export class ImportHandoffDispatcher {
  constructor(private readonly consumers: Readonly<Record<string, IImportHandoffConsumer>> = {}) {}
  async dispatch(handoff: UniversalImportHandoff): Promise<unknown | null> {
    const consumer = this.consumers[handoff.ownerDomain.trim().toUpperCase()];
    return consumer ? consumer.accept(handoff) : null;
  }
}
