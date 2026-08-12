import { SourceConnectorCategory } from '@manaratak/domain';
import { BaseSourceConnector } from './BaseSourceConnector';

export class SitemapSourceConnector extends BaseSourceConnector {
  readonly connectorId = 'sitemap-stub';
  readonly connectorVersion = '1.0.0';
  readonly category = SourceConnectorCategory.SITEMAP;
}
