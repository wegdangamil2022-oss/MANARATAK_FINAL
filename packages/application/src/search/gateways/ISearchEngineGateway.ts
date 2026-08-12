import { SearchRequest } from '@manaratak/domain';
import { SearchResult } from '@manaratak/domain';

export interface ISearchEngineGateway {
  execute(request: SearchRequest): Promise<SearchResult>;
}
