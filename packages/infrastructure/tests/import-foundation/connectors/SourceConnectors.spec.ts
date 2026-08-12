import { describe, it, expect } from 'vitest';
import { 
  ImportSourceDefinition, 
  SourceConnectorCategory, 
  SourceAccessClassification, 
  SourceStatus 
} from '@manaratak/domain';
import { OfficialApiSourceConnector } from '../../../src/import-foundation/connectors/OfficialApiSourceConnector';
import { OfficialFeedSourceConnector } from '../../../src/import-foundation/connectors/OfficialFeedSourceConnector';
import { SitemapSourceConnector } from '../../../src/import-foundation/connectors/SitemapSourceConnector';
import { JsonLdSourceConnector } from '../../../src/import-foundation/connectors/JsonLdSourceConnector';
import { StaticHtmlSourceConnector } from '../../../src/import-foundation/connectors/StaticHtmlSourceConnector';
import { DocumentSourceConnector } from '../../../src/import-foundation/connectors/DocumentSourceConnector';
import { BrowserAssistedSourceConnector } from '../../../src/import-foundation/connectors/BrowserAssistedSourceConnector';
import { ManualUploadSourceConnector } from '../../../src/import-foundation/connectors/ManualUploadSourceConnector';

const allConnectors = [
  new OfficialApiSourceConnector(),
  new OfficialFeedSourceConnector(),
  new SitemapSourceConnector(),
  new JsonLdSourceConnector(),
  new StaticHtmlSourceConnector(),
  new DocumentSourceConnector(),
  new BrowserAssistedSourceConnector(),
  new ManualUploadSourceConnector()
];

describe('SourceConnectors (Stubs)', () => {
  allConnectors.forEach(connector => {
    describe(`${connector.constructor.name}`, () => {
      
      const createSource = (category: SourceConnectorCategory, status: SourceStatus = SourceStatus.ACTIVE, accessClassification: SourceAccessClassification = SourceAccessClassification.PUBLIC_ALLOWED) => {
        return new ImportSourceDefinition({
          sourceId: 'test-source',
          displayName: 'Test',
          baseUrl: 'https://example.com',
          category,
          accessClassification,
          status,
          connectorId: 'any',
          connectorVersion: '1.0.0'
        });
      };

      it('supports matching category active source', () => {
        const source = createSource(connector.category);
        expect(connector.supports(source)).toBe(true);
      });

      it('rejects mismatched category', () => {
        const otherCategory = Object.values(SourceConnectorCategory).find(c => c !== connector.category) as SourceConnectorCategory;
        const source = createSource(otherCategory);
        expect(connector.supports(source)).toBe(false);
      });

      it('rejects blocked source status', () => {
        const source = createSource(connector.category, SourceStatus.BLOCKED);
        expect(connector.supports(source)).toBe(false);
      });

      it('rejects disabled source status', () => {
        const source = createSource(connector.category, SourceStatus.DISABLED);
        expect(connector.supports(source)).toBe(false);
      });

      it('rejects blocked access classification', () => {
        const source = createSource(connector.category, SourceStatus.NEEDS_REVIEW, SourceAccessClassification.BLOCKED);
        expect(connector.supports(source)).toBe(false);
      });

      it('getSignature returns connectorId and version', async () => {
        const source = createSource(connector.category);
        const signature = await connector.getSignature(source);
        expect(signature.connectorId).toBe(connector.connectorId);
        expect(signature.connectorVersion).toBe(connector.connectorVersion);
      });

      it('acquire throws NotImplemented error', async () => {
        const source = createSource(connector.category);
        await expect(connector.acquire(source)).rejects.toThrow(/External acquisition is not implemented in Phase 06 P4E/);
      });

      if (connector instanceof BrowserAssistedSourceConnector) {
        it('browser-assisted acquire error mentions authorized human action', async () => {
          const source = createSource(connector.category);
          await expect(connector.acquire(source)).rejects.toThrow(/Requires authorized human action and is not stealth scraping/);
        });
      }
    });
  });
});
