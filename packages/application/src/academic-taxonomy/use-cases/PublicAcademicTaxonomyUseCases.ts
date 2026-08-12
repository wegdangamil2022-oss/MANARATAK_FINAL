import {
  IAcademicTaxonomyRepository,
  AcademicTaxonomyNodeDto,
  AcademicTaxonomyFilters,
  AcademicTaxonomyNodeType,
  AcademicStandardType,
} from '@manaratak/domain';

export class PublicAcademicTaxonomyUseCases {
  constructor(private readonly repository: IAcademicTaxonomyRepository) {}

  public async listNodes(
    filters?: AcademicTaxonomyFilters
  ): Promise<AcademicTaxonomyNodeDto[]> {
    return this.repository.listNodes(filters);
  }

  public async getNode(nodeId: string): Promise<AcademicTaxonomyNodeDto | null> {
    return this.repository.getNode(nodeId);
  }

  public async getNodeByCanonicalKey(input: {
    nodeType: AcademicTaxonomyNodeType;
    canonicalCode: string;
    standardType?: AcademicStandardType;
  }): Promise<AcademicTaxonomyNodeDto | null> {
    return this.repository.getNodeByCanonicalKey(input);
  }

  public async searchNodes(
    query: string,
    filters?: AcademicTaxonomyFilters
  ): Promise<AcademicTaxonomyNodeDto[]> {
    const trimmed = (query || '').trim();
    const mergedFilters: AcademicTaxonomyFilters = { ...filters };

    if (trimmed) {
      mergedFilters.q = trimmed;
    } else {
      delete mergedFilters.q;
    }

    return this.repository.listNodes(mergedFilters);
  }

  public async listChildren(parentNodeId: string): Promise<AcademicTaxonomyNodeDto[]> {
    return this.repository.listChildren(parentNodeId);
  }

  public async listParents(childNodeId: string): Promise<AcademicTaxonomyNodeDto[]> {
    return this.repository.listParents(childNodeId);
  }
}
