import { 
  ImportSourceDefinition, 
  ConnectorSignature, 
  SourceConnectorCategory 
} from '@manaratak/domain';

export interface ISourceConnector {
  readonly connectorId: string;
  readonly connectorVersion: string;
  readonly category: SourceConnectorCategory;
  
  supports(source: ImportSourceDefinition): boolean;
  
  getSignature(source: ImportSourceDefinition): Promise<ConnectorSignature>;
  
  acquire(source: ImportSourceDefinition): Promise<never>;
}
