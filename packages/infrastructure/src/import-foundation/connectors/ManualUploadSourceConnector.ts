import { SourceConnectorCategory } from '@manaratak/domain';
import { BaseSourceConnector } from './BaseSourceConnector';

export class ManualUploadSourceConnector extends BaseSourceConnector {
  readonly connectorId = 'manual-upload-stub';
  readonly connectorVersion = '1.0.0';
  readonly category = SourceConnectorCategory.MANUAL_UPLOAD;
}
