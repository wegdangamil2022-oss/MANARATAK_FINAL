import { SourceConnectorCategory, ImportSourceDefinition } from '@manaratak/domain';
import { BaseSourceConnector } from './BaseSourceConnector';

export class BrowserAssistedSourceConnector extends BaseSourceConnector {
  readonly connectorId = 'browser-assisted-stub';
  readonly connectorVersion = '1.0.0';
  readonly category = SourceConnectorCategory.BROWSER_ASSISTED;
  
  async acquire(_source: ImportSourceDefinition): Promise<never> {
    throw new Error('External acquisition is not implemented in Phase 06 P4E connector stubs. Requires authorized human action and is not stealth scraping.');
  }
}
