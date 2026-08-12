import { SourceConnectorCategory } from '@manaratak/domain';
import { BaseSourceConnector } from './BaseSourceConnector';

export class OfficialFeedSourceConnector extends BaseSourceConnector {
  readonly connectorId = 'official-feed-stub';
  readonly connectorVersion = '1.0.0';
  readonly category = SourceConnectorCategory.OFFICIAL_FEED;
}
