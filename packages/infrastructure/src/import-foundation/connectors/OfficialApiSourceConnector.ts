import { SourceConnectorCategory } from '@manaratak/domain';
import { BaseSourceConnector } from './BaseSourceConnector';

export class OfficialApiSourceConnector extends BaseSourceConnector {
  readonly connectorId = 'official-api-stub';
  readonly connectorVersion = '1.0.0';
  readonly category = SourceConnectorCategory.OFFICIAL_API;
}
