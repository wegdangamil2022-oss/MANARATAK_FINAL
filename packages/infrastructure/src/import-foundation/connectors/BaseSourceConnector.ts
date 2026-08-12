import { ISourceConnector } from '@manaratak/application';
import { 
  ImportSourceDefinition, 
  ConnectorSignature, 
  SourceConnectorCategory,
  SourceStatus,
  SourceAccessClassification
} from '@manaratak/domain';

export abstract class BaseSourceConnector implements ISourceConnector {
  abstract readonly connectorId: string;
  abstract readonly connectorVersion: string;
  abstract readonly category: SourceConnectorCategory;

  supports(source: ImportSourceDefinition): boolean {
    if (source.category !== this.category) return false;
    if (source.status === SourceStatus.BLOCKED || source.status === SourceStatus.DISABLED) return false;
    if (source.accessClassification === SourceAccessClassification.BLOCKED) return false;
    return true;
  }

  async getSignature(_source: ImportSourceDefinition): Promise<ConnectorSignature> {
    return new ConnectorSignature({
      connectorId: this.connectorId,
      connectorVersion: this.connectorVersion,
      expectedSchemaShape: { type: 'stub' }
    });
  }

  async acquire(_source: ImportSourceDefinition): Promise<never> {
    throw new Error('External acquisition is not implemented in Phase 06 P4E connector stubs.');
  }
}
