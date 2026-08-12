import { SourceConnectorCategory } from '@manaratak/domain';
import { BaseSourceConnector } from './BaseSourceConnector';

export class StaticHtmlSourceConnector extends BaseSourceConnector {
  readonly connectorId = 'static-html-stub';
  readonly connectorVersion = '1.0.0';
  readonly category = SourceConnectorCategory.STATIC_HTML;
}
